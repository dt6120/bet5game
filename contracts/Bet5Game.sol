// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

/**
    @title A betting game for users to predict top performing crypto tokens and win pool rewards
  */
contract Bet5Game is Ownable, ReentrancyGuard, KeeperCompatibleInterface {
    uint16 private constant DENOMINATOR = 10000;
    uint8 public constant WINNER_COUNT = 3;
    uint8 public constant MIN_ENTRY_COUNT = 6;
    uint8 public constant MAX_ENTRY_COUNT = 30;
    uint8 public constant NUM_USER_SELECTION = 5;
    uint16 public constant FEE = 500;
    uint256 public POOL_ENTRY_INTERVAL = 5 minutes; // 30 minutes;
    uint256 public POOL_START_INTERVAL = 10 minutes; // 1 days;
    uint256 public POOL_DURATION = 10 minutes; // 1 days;

    // --------------------- TEST FUNCTIONS --------------------
    // ---------------- DO NOT USE IN PRODUCTION ---------------

    function setPoolEntryInterval(uint256 _poolEntryInterval)
        external
        onlyOwner
    {
        POOL_ENTRY_INTERVAL = _poolEntryInterval;
    }

    function setPoolStartInterval(uint256 _poolStartInterval)
        external
        onlyOwner
    {
        POOL_START_INTERVAL = _poolStartInterval;
    }

    function setPoolDuration(uint256 _poolDuration) external onlyOwner {
        POOL_DURATION = _poolDuration;
    }

    enum Status {
        ACTIVE,
        CANCELLED,
        COMPLETE
    }

    struct Pool {
        uint256 startTime;
        uint256 endTime;
        uint256 entryFee;
        address token;
        address[] entries;
        address[WINNER_COUNT] winners;
        Status status;
    }

    struct UserEntry {
        address[NUM_USER_SELECTION] tokens;
        int256[NUM_USER_SELECTION] prices;
    }

    uint256 public poolCounter;
    uint256 public keeperPoolCounter;

    mapping(address => uint256) public feeCollected;
    mapping(address => uint256) public poolsEntered;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => UserEntry)) internal userPoolEntries;

    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed startTime,
        uint256 endTime,
        address indexed token,
        uint256 entryFee
    );
    event PoolEntered(
        uint256 indexed poolId,
        address indexed user,
        address[NUM_USER_SELECTION] tokens,
        int256[NUM_USER_SELECTION] prices,
        bool newEntry
    );
    event PoolCancelled(uint256 indexed poolId);
    event PoolRewardTransfer(
        uint256 indexed poolId,
        uint256 indexed amount,
        address indexed winner
    );
    event FeeWithdrawn(address indexed token, uint256 indexed amount);

    constructor() {
        keeperPoolCounter = 1;
    }

    /**
        @notice Create a new pool for users to enter and select tokens
        @param _entryFee amount of accepted tokens to be deposited by user to enter pool
        @param _token accepted token of the pool in terms of which the entry fee is based
     */
    function createPool(uint256 _entryFee, address _token) external onlyOwner {
        require(_entryFee > 0, "Increase entry fee");
        require(
            bytes(ERC20(_token).name()).length > 0,
            "Invalid token address"
        );

        uint256 poolId = ++poolCounter;
        pools[poolId].startTime = block.timestamp + POOL_START_INTERVAL;
        pools[poolId].endTime =
            block.timestamp +
            POOL_START_INTERVAL +
            POOL_DURATION;
        pools[poolId].entryFee = _entryFee;
        pools[poolId].token = _token;
        pools[poolId].status = Status.ACTIVE;

        emit PoolCreated(
            poolId,
            pools[poolId].startTime,
            pools[poolId].endTime,
            _token,
            _entryFee
        );
    }

    /**
        @notice Adds user to list of pool entries, collects entry fee, and stores the current token prices
        @param _poolId Unique ID of the pool to enter
        @param _tokens List of token aggregator addresses
     */
    function enterPool(
        uint256 _poolId,
        address[NUM_USER_SELECTION] memory _tokens
    ) external nonReentrant {
        Pool storage pool = pools[_poolId];

        require(
            block.timestamp >= pool.startTime - POOL_ENTRY_INTERVAL,
            "Pool entry not started"
        );
        require(pool.startTime > block.timestamp, "Pool entry time over");
        require(
            _tokens.length == NUM_USER_SELECTION,
            "Invalid token selection"
        );
        require(pool.entries.length < MAX_ENTRY_COUNT, "Pool limit reached");

        bool newEntry = userPoolEntries[_poolId][msg.sender].tokens[0] ==
            address(0);
        userPoolEntries[_poolId][msg.sender].tokens = _tokens;
        poolsEntered[msg.sender] += 1;

        for (uint8 i = 0; i < NUM_USER_SELECTION; i++) {
            AggregatorV3Interface aggregator = AggregatorV3Interface(
                _tokens[i]
            );
            (, int256 price, , , ) = aggregator.latestRoundData();
            require(price > 0, "Token price feed not found");
            userPoolEntries[_poolId][msg.sender].prices[i] = price;
        }

        if (newEntry) {
            pool.entries.push(msg.sender);

            ERC20(pool.token).transferFrom(
                msg.sender,
                address(this),
                pool.entryFee
            );
        }

        emit PoolEntered(
            _poolId,
            msg.sender,
            _tokens,
            userPoolEntries[_poolId][msg.sender].prices,
            newEntry
        );
    }

    /**
        @notice Disbales additional entries and returns the deposited tokens of users if number of entries is less than `MIN_ENTRY_COUNT`
        @param _poolId Unique ID of the pool to cancel
     */
    function cancelPool(uint256 _poolId) public {
        Pool storage pool = pools[_poolId];

        require(pool.endTime > pool.startTime, "Pool already cancelled");
        require(block.timestamp > pool.startTime, "Pool not started");
        require(
            pool.entries.length < MIN_ENTRY_COUNT,
            "Entry count exceeds cancel limit"
        );

        pool.endTime = pool.startTime;
        pool.status = Status.CANCELLED;

        for (uint8 i = 0; i < pool.entries.length; i++) {
            poolsEntered[pool.entries[i]] -= 1;
            ERC20(pool.token).transfer(pool.entries[i], pool.entryFee);
        }

        emit PoolCancelled(_poolId);
    }

    /**
        @notice Distributes pool rewards to winners based on gains of token selection
        @param _poolId Unique ID of the pool to distribute rewards to winners
     */
    function distributeRewards(uint256 _poolId) public nonReentrant {
        Pool storage pool = pools[_poolId];

        require(block.timestamp >= pool.endTime, "Pool in progress");
        require(pool.winners[0] == address(0), "Rewards already distributed");

        (address[WINNER_COUNT] memory winners, ) = leaderboard(_poolId);

        pool.status = Status.COMPLETE;
        pool.winners = winners;

        uint256 fee = (pool.entries.length * pool.entryFee * FEE) / DENOMINATOR;
        feeCollected[pool.token] += fee;
        uint256 rewards = pool.entries.length * pool.entryFee - fee;

        for (uint8 i = 0; i < WINNER_COUNT; i++) {
            address winner = winners[i];

            // hard coded, will have to be modified if `WINNER_COUNT` is changed

            uint256 amount = (rewards * (WINNER_COUNT - i)) / 6;
            ERC20(pool.token).transfer(winner, amount);

            emit PoolRewardTransfer(_poolId, amount, winner);
        }
    }

    /**
        @notice Transfers the collected fee of the provided token to owner address
        @param _token Address of token to withdraw collected fee
    */
    function withdrawFees(address _token) external nonReentrant onlyOwner {
        require(feeCollected[_token] > 0, "No fee to collect");

        uint256 amount = feeCollected[_token];
        delete feeCollected[_token];

        ERC20(_token).transfer(msg.sender, amount);

        emit FeeWithdrawn(_token, amount);
    }

    /**
        @notice Keeper function to automatically cancel pool or distribute pool rewards
     */
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        Pool memory pool = pools[keeperPoolCounter];
        if (
            block.timestamp >= pool.startTime &&
            pool.entries.length < MIN_ENTRY_COUNT
        ) {
            cancelPool(keeperPoolCounter++);
        } else if (block.timestamp > pool.endTime) {
            distributeRewards(keeperPoolCounter++);
        }
    }

    // --------------------- VIEW FUNCTIONS ---------------------

    /**
        @notice Keeper function to check if any pool needs to be cancelled or to distribute rewards
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external override returns (bool upkeepNeeded, bytes memory) {
        Pool memory pool = pools[keeperPoolCounter];

        // pool should exist (invalid case)
        // by start time it does not have enough entries (cancel case)
        // crosses end time (reward winners case)
        upkeepNeeded =
            keeperPoolCounter <= poolCounter &&
            ((block.timestamp >= pool.startTime &&
                pool.entries.length < MIN_ENTRY_COUNT) ||
                block.timestamp > pool.endTime);
    }

    /**
        @param _poolId Unique ID of the pool
        @param _address User address of which points are to be calculated
        @return Number of points till current time based upon their pool token selection
     */
    function getNetPoints(uint256 _poolId, address _address)
        public
        view
        returns (int256)
    {
        require(pools[_poolId].status == Status.ACTIVE, "Pool not active");

        int256 netPoints = 0;

        for (uint8 i = 0; i < NUM_USER_SELECTION; i++) {
            AggregatorV3Interface aggregator = AggregatorV3Interface(
                userPoolEntries[_poolId][_address].tokens[i]
            );
            (, int256 price, , , ) = aggregator.latestRoundData();
            netPoints +=
                ((price - userPoolEntries[_poolId][_address].prices[i]) *
                    int256(uint256(DENOMINATOR))) /
                userPoolEntries[_poolId][_address].prices[i];
        }

        return netPoints / int256(uint256(NUM_USER_SELECTION));
    }

    /**
        @notice Calculates the position of a user in a pool based upon the gains of their selected tokens
        @param _poolId Unique ID of the pool
        @param _address User address of which position and points are to be calculated
        @return Position and net points of the user among all the pool entries
     */
    function getPoolPosition(uint256 _poolId, address _address)
        external
        view
        returns (uint256, int256)
    {
        require(block.timestamp > pools[_poolId].startTime, "Pool not started");
        require(block.timestamp <= pools[_poolId].endTime, "Pool has ended");

        address[] memory entries = pools[_poolId].entries;
        int256 netPoints = getNetPoints(_poolId, _address);
        uint256 count = 1;
        uint256 userIndex = entries.length;

        for (uint256 i = 0; i < entries.length; i++) {
            address user = entries[i];
            if (user == _address) {
                userIndex = i;
            }
            if (netPoints < getNetPoints(_poolId, user)) {
                count++;
            } else if (
                netPoints == getNetPoints(_poolId, user) && userIndex > i
            ) {
                count++;
            }
        }

        return (count, netPoints);
    }

    /**
        @param _poolId Unique ID of the pool
        @return List of addresses of users that entered the pool
     */
    function getPoolEntries(uint256 _poolId)
        external
        view
        returns (address[] memory)
    {
        return pools[_poolId].entries;
    }

    /**
        @param _poolId Unique ID of the pool
        @return List of winners after pool has ended
    */
    function getPoolWinners(uint256 _poolId)
        external
        view
        returns (address[WINNER_COUNT] memory)
    {
        require(pools[_poolId].status == Status.COMPLETE, "Pool has not ended");

        return pools[_poolId].winners;
    }

    /**
        @param _poolId Unique ID of the pool
        @param _address User address of which pool entries are required
        @return UserEntry struct which has list of tokens and their initial prices
     */
    function getUserPoolEntries(uint256 _poolId, address _address)
        external
        view
        returns (UserEntry memory)
    {
        return userPoolEntries[_poolId][_address];
    }

    /**
        @param _poolId Unique ID of the pool
        @return List of top `WINNER_COUNT` users and their respective points in descending order of points
     */
    function leaderboard(uint256 _poolId)
        public
        view
        returns (address[WINNER_COUNT] memory, int256[WINNER_COUNT] memory)
    {
        Pool memory pool = pools[_poolId];

        require(pool.entries.length >= MIN_ENTRY_COUNT, "Add more entries");
        require(pool.status == Status.ACTIVE, "Pool not active");

        address[WINNER_COUNT] memory winners;
        int256[WINNER_COUNT] memory netPoints;

        for (uint8 i = 0; i < pool.entries.length; i++) {
            int256 points = getNetPoints(_poolId, pool.entries[i]);

            // hard coded, will have to be modified if `WINNER_COUNT` is changed

            if (points > netPoints[0] || winners[0] == address(0)) {
                winners[2] = winners[1];
                winners[1] = winners[0];
                winners[0] = pool.entries[i];

                netPoints[2] = netPoints[1];
                netPoints[1] = netPoints[0];
                netPoints[0] = points;
            } else if (points > netPoints[1] || winners[1] == address(0)) {
                winners[2] = winners[1];
                winners[1] = pool.entries[i];

                netPoints[2] = netPoints[1];
                netPoints[1] = points;
            } else if (points > netPoints[2] || winners[2] == address(0)) {
                winners[2] = pool.entries[i];

                netPoints[2] = points;
            }
        }

        return (winners, netPoints);
    }
}
