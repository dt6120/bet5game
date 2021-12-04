const {
  contracts: { Bet5Game, Token },
} = require("../src/ethereum/artifacts.json");
const { BTC, ETH, MATIC, LINK, DAI, UNI } = require("../priceFeeds.json");

const tokens = [BTC, ETH, MATIC, LINK, DAI, UNI];

const poolContract = new ethers.Contract(
  Bet5Game.address,
  Bet5Game.abi,
  ethers.provider
);

const main = async () => {
  try {
    const signers = await ethers.getSigners();

    const poolId = await poolContract.poolCounter();
    console.log(`Entering pool ${poolId}`);

    for (let i = 0; i < 6; i++) {
      const tx = await poolContract
        .connect(signers[i])
        .enterPool(
          poolId,
          [
            tokens[i % 6],
            tokens[i % 6],
            tokens[i % 6],
            tokens[i % 6],
            tokens[i % 6],
          ],
          { gasLimit: "500000" }
        );
      await tx.wait();

      console.log(`User ${i + 1} entered pool`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
