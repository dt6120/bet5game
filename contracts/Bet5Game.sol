// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

import "hardhat/console.sol";

/**
    @title A betting game for users to predict top performing crypto tokens and win pool rewards
    @author Dhruv Takwal
  */
contract Bet5Game is Ownable, KeeperCompatibleInterface {
    uint16 private constant DENOMINATOR = 10000;
    uint8 public constant WINNER_COUNT = 3;
    uint8 public constant MIN_ENTRY_COUNT = 6;
    uint8 public constant MAX_ENTRY_COUNT = 20;
    uint8 public constant NUM_USER_SELECTION = 5;
    uint16 public constant FEE = 500;
    uint256 public constant POOL_ENTRY_INTERVAL = 30 minutes;
    uint256 public constant POOL_START_INTERVAL = 1 days;
    uint256 public constant POOL_MIN_DURATION = 1 days;

    struct Pool {
        uint80 startTime;
        uint80 endTime;
        uint256 entryFee;
        address token;
        address[] entries;
    }

    struct UserEntry {
        address[NUM_USER_SELECTION] tokens;
        int256[NUM_USER_SELECTION] prices;
    }

    uint256 public poolCounter;

    mapping(address => uint256) public feeCollected;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => UserEntry)) internal userPoolEntries;

    event PoolCreated(
        uint256 poolId,
        uint128 startTime,
        uint128 endTime,
        uint256 entryFee
    );
    event PoolEntered(
        uint256 poolId,
        address user,
        address[NUM_USER_SELECTION] tokens,
        int256[NUM_USER_SELECTION] prices
    );
    event PoolCancelled(uint256 poolId);
    event PoolRewardClaim(uint256 poolId, uint256 amount, address winner);

    /**
        @notice Create a new pool for users to enter and select tokens
        @param _startTime timestamp when the stops accepting new entries 
        @param _endTime timestamp when net points are calculated to decide winners
        @param _entryFee amount of accepted tokens to be deposited by user to enter pool
        @param _token accepted token of the pool in terms of which the entry fee is based
     */
    function createPool(
        uint80 _startTime,
        uint80 _endTime,
        uint256 _entryFee,
        address _token
    ) external onlyOwner {
        require(
            _startTime >= block.timestamp + POOL_START_INTERVAL,
            "Increase start time"
        );
        require(
            _endTime >= _startTime + POOL_MIN_DURATION,
            "Increase end time"
        );
        require(_entryFee > 0, "Increase entry fee");
        require(
            bytes(ERC20(_token).name()).length > 0,
            "Invalid token address"
        );

        uint256 poolId = ++poolCounter;
        pools[poolId].startTime = _startTime;
        pools[poolId].endTime = _endTime;
        pools[poolId].entryFee = _entryFee;
        pools[poolId].token = _token;

        emit PoolCreated(poolId, _startTime, _endTime, _entryFee);
    }

    /**
        @notice Adds user to list of pool entries, collects entry fee, and stores the current token prices
        @param _poolId Unique ID of the pool to enter
        @param _tokens List of token aggregator addresses
     */
    function enterPool(
        uint256 _poolId,
        address[NUM_USER_SELECTION] memory _tokens
    ) external {
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

        // do the tokens need to be unique?

        bool newEntry = userPoolEntries[_poolId][msg.sender].tokens[0] ==
            address(0);
        userPoolEntries[_poolId][msg.sender].tokens = _tokens;

        for (uint8 i = 0; i < NUM_USER_SELECTION; i++) {
            AggregatorV3Interface aggregator = AggregatorV3Interface(
                _tokens[i]
            );
            (, int256 price, , , ) = aggregator.latestRoundData();
            require(price > 0, "Token price feed not found");
            userPoolEntries[_poolId][msg.sender].prices[i] = price;
        }

        if (newEntry) {
            // pool.entryCount++;
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
            userPoolEntries[_poolId][msg.sender].prices
        );
    }

    /**
        @notice Disbales additional entries and returns the deposited tokens of users
        @param _poolId Unique ID of the pool to cancel if number of entries is less than `MIN_ENTRY_COUNT`
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

        for (uint8 i = 0; i < pool.entries.length; i++) {
            ERC20(pool.token).transfer(pool.entries[i], pool.entryFee);
        }

        emit PoolCancelled(_poolId);
    }

    /**
        @notice Gives out reward to user based upon their position, if in top `WINNER_COUNT`, in the pool
        @param _poolId Unique ID of the pool in which the user entered
     */
    function claimReward(uint256 _poolId) external {
        Pool memory pool = pools[_poolId];

        require(
            userPoolEntries[_poolId][msg.sender].tokens[0] != address(0),
            "Reward claimed"
        );
        require(block.timestamp > pool.endTime, "Pool in progress");

        uint256 position = _getPoolPosition(_poolId, msg.sender);

        require(position <= WINNER_COUNT, "Only winner can claim");

        // this gives error when calculating points for subsequent users
        delete userPoolEntries[_poolId][msg.sender];

        // hard coded, will have to be modified if `WINNER_COUNT` is changed
        // 1st : 2nd : 3rd :: 5 : 3 : 2

        uint256 reward = 0;
        if (position == 1) {
            reward = (pool.entryFee * pool.entries.length * 5) / 10;
        } else if (position == 2) {
            reward = (pool.entryFee * pool.entries.length * 3) / 10;
        } else if (position == 3) {
            reward = (pool.entryFee * pool.entries.length * 2) / 10;
        }

        uint256 fee = (reward * FEE) / DENOMINATOR;
        feeCollected[pool.token] += fee;
        ERC20(pool.token).transfer(msg.sender, reward - fee);

        emit PoolRewardClaim(_poolId, reward, msg.sender);
    }

    /**
        @notice Calculates the position of a user in a pool based upon the gains of their selected tokens
        @param _poolId Unique ID of the pool of which user position is to be calculated
        @return Position of the user among all the pool entries, with 1 being the best
     */
    function _getPoolPosition(uint256 _poolId, address _address)
        public
        view
        returns (uint256)
    {
        address[] memory entries = pools[_poolId].entries;
        int256 netPoints = _getNetPoints(_poolId, _address);
        uint256 count = 1;
        uint256 userIndex = entries.length;

        for (uint256 i = 0; i < entries.length; i++) {
            address user = entries[i];
            if (user == _address) {
                userIndex = i;
            }
            if (netPoints < _getNetPoints(_poolId, user)) {
                count++;
            } else if (
                netPoints == _getNetPoints(_poolId, user) && userIndex > i
            ) {
                count++;
            }
        }

        return count;
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
        external
        view
        returns (address[WINNER_COUNT] memory, int256[WINNER_COUNT] memory)
    {
        Pool memory pool = pools[_poolId];

        require(pool.entries.length > MIN_ENTRY_COUNT, "Add more entries");

        address[WINNER_COUNT] memory winners;
        int256[WINNER_COUNT] memory netPoints;

        for (uint8 i = 0; i < pool.entries.length; i++) {
            int256 points = _getNetPoints(_poolId, pool.entries[i]);

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

    /**
        @param _poolId Unique ID of the pool
        @param _address User address of which points are to be calculated
        @return Number of points till current time based upon their pool token selection
     */
    function _getNetPoints(uint256 _poolId, address _address)
        public
        view
        returns (int256)
    {
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

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external override returns (bool upkeepNeeded, bytes memory) {}

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {}
}
