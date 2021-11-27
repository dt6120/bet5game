const {
  contracts: { Bet5Game, Token },
} = require("../src/ethereum/artifacts.json");

const poolContract = new ethers.Contract(
  Bet5Game.address,
  Bet5Game.abi,
  ethers.provider
);

const main = async () => {
  try {
    const signers = await ethers.getSigners();

    console.log("Creating new pool");

    const entryFee = "1000000000000000000000";
    const tx = await poolContract
      .connect(signers[0])
      .createPool(entryFee, Token.address);
    await tx.wait();

    const poolId = await poolContract.poolCounter();
    console.log(`Pool created. ID: ${poolId}`);
  } catch (error) {
    console.log(error.message);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
