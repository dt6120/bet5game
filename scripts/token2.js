const {
  contracts: { Bet5Game, Token },
} = require("../src/ethereum/artifacts.json");
const aggregators = Object.values(
  require("../src/ethereum/mumbaiAggregators.json")
);

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

    for (let i = 3; i < 9; i++) {
      const tx = await poolContract
        .connect(signers[i])
        .enterPool(
          "2",
          [
            aggregators[Math.floor(Math.random() * 10)],
            aggregators[Math.floor(Math.random() * 10)],
            aggregators[Math.floor(Math.random() * 10)],
            aggregators[Math.floor(Math.random() * 10)],
            aggregators[Math.floor(Math.random() * 10)],
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
