const { expect } = require("chai");
const { ethers } = require("hardhat");

const {
  BTC,
  ETH,
  MATIC,
  AAVE,
  COMP,
  DOT,
  ADA,
  BNB,
  LTC,
} = require("../priceFeeds.json");

describe("Bet5Game", () => {
  let token,
    poolContract,
    signers,
    WINNER_COUNT,
    NUM_USER_SELECTION,
    MAX_POOL_ENTRY,
    POOL_ENTRY_INTERVAL,
    POOL_START_INTERVAL,
    POOL_MIN_DURATION;

  beforeEach(async () => {});

  before(async () => {
    signers = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Token", "TKN");
    await token.deployed();

    const Pool = await ethers.getContractFactory("Bet5Game");
    poolContract = await Pool.deploy();
    await poolContract.deployed();

    signers.forEach(async (signer) => {
      const amount = "1000000000000000000000000";
      await token.connect(signers[0]).transfer(signer.address, amount);
      await token.connect(signer).approve(poolContract.address, amount);
    });

    WINNER_COUNT = await poolContract.WINNER_COUNT();
    NUM_USER_SELECTION = await poolContract.NUM_USER_SELECTION();
    POOL_ENTRY_INTERVAL = Number(await poolContract.POOL_ENTRY_INTERVAL());
    POOL_START_INTERVAL = Number(await poolContract.POOL_START_INTERVAL());
    POOL_MIN_DURATION = Number(await poolContract.POOL_MIN_DURATION());
  });

  describe.skip("deployment", () => {
    it("contract configured correctly", async () => {
      expect(token.address).to.be.properAddress;
      expect(poolContract.address).to.be.properAddress;
      expect(await poolContract.owner()).to.equal(signers[0].address);
    });
  });

  describe.skip("createPool", () => {
    describe("with invalid params", () => {
      it("throws an error", async () => {
        const startTime = ethers.BigNumber.from(Math.round(Date.now() / 1000));
        const endTime = startTime.add(ethers.BigNumber.from(POOL_MIN_DURATION));
        const entryFee = ethers.BigNumber.from(1000);

        const [owner] = signers;

        await expect(
          poolContract
            .connect(owner)
            .createPool(startTime, endTime, entryFee, token.address)
        ).to.be.revertedWith("Increase start time");

        await expect(
          poolContract
            .connect(owner)
            .createPool(
              startTime.add(ethers.BigNumber.from(POOL_START_INTERVAL)),
              endTime,
              entryFee,
              token.address
            )
        ).to.be.revertedWith("Increase end time");

        await expect(
          poolContract
            .connect(owner)
            .createPool(
              startTime.add(ethers.BigNumber.from(POOL_START_INTERVAL)),
              endTime.add(ethers.BigNumber.from(POOL_MIN_DURATION)),
              0,
              token.address
            )
        ).to.be.revertedWith("Increase entry fee");
      });
    });

    describe("with valid params", () => {
      it("creates a new pool", async () => {
        const startTime = ethers.BigNumber.from(
          Math.round(Date.now() / 1000) + POOL_START_INTERVAL
        );
        const endTime = startTime.add(ethers.BigNumber.from(POOL_MIN_DURATION));
        const entryFee = ethers.BigNumber.from(1000);

        const [owner] = signers;

        const tx = await poolContract
          .connect(owner)
          .createPool(startTime, endTime, entryFee, token.address);
        const { events } = await tx.wait();
        const { poolId } = events[events.length - 1].args;
        const newPool = await poolContract.pools(poolId);

        expect(newPool.startTime).to.equal(startTime);
        expect(newPool.endTime).to.equal(endTime);
        expect(newPool.entryFee).to.equal(entryFee);
      });
    });
  });

  describe.skip("enterPool", () => {
    describe("before entry time", () => {
      it("throws an error", async () => {
        const [, user] = signers;
        const poolId = await poolContract.poolCounter();
        const pool = await poolContract.pools(poolId);
        await expect(
          poolContract
            .connect(user)
            .enterPool(poolId, [BTC, ETH, MATIC, AAVE, ADA])
        ).to.be.revertedWith("Pool entry not started");
      });
    });

    describe("within entry time", () => {
      before(async () => {
        await ethers.provider.send("evm_increaseTime", [
          POOL_START_INTERVAL - 100,
        ]);
      });

      it("adds user entry to pool", async () => {
        const [, user] = signers;

        const poolId = await poolContract.poolCounter();
        const entryCount = (await poolContract.getPoolEntries(poolId)).length;

        const tx = await poolContract
          .connect(user)
          .enterPool(poolId, [BTC, ETH, ADA, BNB, DOT]);
        await tx.wait();

        // const { events } = await tx.wait();
        // const { prices } = events[events.length - 1].args;

        expect((await poolContract.getPoolEntries(poolId)).length).to.equal(
          entryCount + 1
        );
      });
    });

    describe("after entry time", () => {
      before(async () => {
        await ethers.provider.send("evm_increaseTime", [POOL_MIN_DURATION]);
      });

      it("throws an error", async () => {
        const [, user] = signers;
        const poolId = await poolContract.poolCounter();
        const pool = await poolContract.pools(poolId);
        await expect(
          poolContract
            .connect(user)
            .enterPool(poolId, [BTC, ETH, MATIC, AAVE, ADA])
        ).to.be.revertedWith("Pool entry time over");
      });
    });
  });

  describe.skip("cancelPool", () => {});

  describe("claimReward", () => {
    let poolId;

    before(async () => {
      // create pool
      const startTime = ethers.BigNumber.from(
        Math.round(Date.now() / 1000) + POOL_START_INTERVAL
      );
      const endTime = startTime.add(ethers.BigNumber.from(POOL_MIN_DURATION));
      const entryFee = ethers.BigNumber.from("1000000000000000000000000");

      const [owner] = signers;

      const tx = await poolContract
        .connect(owner)
        .createPool(startTime, endTime, entryFee, token.address);
      const { events } = await tx.wait();
      const { poolId: id } = events[events.length - 1].args;
      poolId = id;

      // increase time
      await ethers.provider.send("evm_increaseTime", [
        POOL_START_INTERVAL - 100,
      ]);

      // enter pool
      const tokens = [BTC, ETH, ADA, BNB, DOT];
      for (let i = 1; i < 21; i++) {
        const index = Math.floor(Math.random() * 5);
        const tx = await poolContract
          .connect(signers[i])
          .enterPool(poolId, [
            tokens[index],
            tokens[index],
            tokens[index],
            tokens[index],
            tokens[index],
          ]);
        await tx.wait();
      }
    });

    describe("before pool end time", () => {
      it("throws an error", async () => {
        await expect(
          poolContract.connect(signers[1]).claimReward(poolId)
        ).to.be.revertedWith("Pool in progress");
      });
    });

    describe("after pool end time", () => {
      before(async () => {
        await ethers.provider.send("evm_increaseTime", [
          POOL_MIN_DURATION + 1000,
        ]);
      });

      it("gives out pool reward", async () => {
        const tx = await poolContract.connect(signers[1]).claimReward(poolId);
        const { events } = await tx.wait();
        const { amount } = events[events.length - 1].args;

        console.log(ethers.utils.formatUnits(amount, "ether"));
      });
    });
  });
});

// const gasEstimate = await poolContract.estimateGas.enterPool();
// const gasPrice = await ethers.provider.getGasPrice();
// const txFee = gasEstimate * gasPrice;
// console.log(`Tx fee: ${ethers.utils.formatUnits(txFee, "ether")} ETH`);

// keeper to start pool - can it iterate through all users' every token to set initial price?
// keeper to end pool - can it iterate through all users' every token to set final price?
// estimate gas and check max limit of `NMUM_USER_SELECTION` and `MAX_ENTRY_COUNT`
