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
    MIN_ENTRY_COUNT,
    POOL_ENTRY_INTERVAL,
    POOL_START_INTERVAL,
    POOL_DURATION;

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
    POOL_DURATION = Number(await poolContract.POOL_DURATION());
    MIN_ENTRY_COUNT = Number(await poolContract.MIN_ENTRY_COUNT());
  });

  describe("deployment", () => {
    it("contract configured correctly", async () => {
      expect(token.address).to.be.properAddress;
      expect(poolContract.address).to.be.properAddress;
      expect(await poolContract.owner()).to.equal(signers[0].address);
    });
  });

  describe("createPool", () => {
    describe("with invalid entry fee", () => {
      it("throws an error", async () => {
        // const startTime = ethers.BigNumber.from(Math.round(Date.now() / 1000));
        // const endTime = startTime.add(ethers.BigNumber.from(POOL_DURATION));

        const [owner] = signers;

        // await expect(
        //   poolContract
        //     .connect(owner)
        //     .createPool(entryFee, token.address)
        // ).to.be.revertedWith("Increase start time");

        // await expect(
        //   poolContract
        //     .connect(owner)
        //     .createPool(
        //       startTime.add(ethers.BigNumber.from(POOL_START_INTERVAL)),
        //       endTime,
        //       entryFee,
        //       token.address
        //     )
        // ).to.be.revertedWith("Increase end time");

        await expect(
          poolContract.connect(owner).createPool(0, token.address)
        ).to.be.revertedWith("Increase entry fee");
      });
    });

    describe("with valid entry fee", () => {
      it("creates a new pool", async () => {
        // const startTime = ethers.BigNumber.from(
        //   Math.round(Date.now() / 1000) + POOL_START_INTERVAL
        // );
        // const endTime = startTime.add(ethers.BigNumber.from(POOL_DURATION));
        const entryFee = ethers.BigNumber.from(1000);

        const [owner] = signers;

        const tx = await poolContract
          .connect(owner)
          .createPool(entryFee, token.address);
        const { events } = await tx.wait();
        const { poolId } = events[events.length - 1].args;
        const newPool = await poolContract.pools(poolId);

        expect(newPool.startTime).to.not.be.null;
        expect(newPool.endTime).to.not.be.null;
        expect(newPool.entryFee).to.equal(entryFee);
      });
    });
  });

  describe("enterPool", () => {
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
          POOL_START_INTERVAL - 10,
        ]);
      });

      it.skip("adds user entry to pool", async () => {
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
        await ethers.provider.send("evm_increaseTime", [POOL_DURATION]);
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

  describe.skip("cancelPool", () => {
    let poolId;

    before(async () => {
      poolId = await poolContract.poolCounter();
    });

    describe("before start time", () => {
      it("throws an error", async () => {
        await expect(poolContract.cancelPool(poolId)).to.be.revertedWith(
          "Pool not started"
        );
      });
    });

    describe("with enough entries", () => {
      before(async () => {
        await ethers.provider.send("evm_increaseTime", [
          POOL_START_INTERVAL - 100,
        ]);

        // add `MIN_ENTRY_COUNT` user entries
        for (let i = 0; i < MIN_ENTRY_COUNT; i++) {
          const tx = await poolContract
            .connect(signers[i])
            .enterPool(poolId, [BTC, ETH, BNB, ADA, DOT]);
          await tx.wait();
        }

        await ethers.provider.send("evm_increaseTime", [1000]);
      });

      it("throws an error", async () => {
        await expect(
          poolContract.connect(owner).cancelPool(poolId)
        ).to.be.revertedWith("Entry count exceeds cancel limit");
      });
    });

    describe("without enough entries", () => {
      before(async () => {
        // create pool
        const entryFee = ethers.BigNumber.from("1000000000000000000000000");

        [owner] = signers;

        const tx = await poolContract
          .connect(owner)
          .createPool(entryFee, token.address);
        const { events } = await tx.wait();
        const { poolId: id } = events[events.length - 1].args;
        poolId = id;
      });
      it("cancels the pool", async () => {});
    });
  });

  describe.skip("distributeRewards", () => {
    let poolId;

    before(async () => {
      // create pool
      const entryFee = ethers.BigNumber.from("1000000000000000000000000");

      const [owner] = signers;

      const tx = await poolContract
        .connect(owner)
        .createPool(entryFee, token.address);
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
        await ethers.provider.send("evm_increaseTime", [POOL_DURATION + 1000]);
      });

      it("gives out pool reward", async () => {
        const tx = await poolContract.connect(signers[1]).claimReward(poolId);
        const { events } = await tx.wait();
        const { amount } = events[events.length - 1].args;
      });
    });
  });
});

// const gasEstimate = await poolContract.estimateGas.enterPool();
// const gasPrice = await ethers.provider.getGasPrice();
// const txFee = gasEstimate * gasPrice;
// console.log(`Tx fee: ${ethers.utils.formatUnits(txFee, "ether")} ETH`);

// estimate gas and check max limit of `NMUM_USER_SELECTION` and `MAX_ENTRY_COUNT`
