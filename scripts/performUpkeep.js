const {
  contracts: { Bet5Game },
} = require("../src/ethereum/artifacts.json");

const poolContract = new ethers.Contract(
  Bet5Game.address,
  Bet5Game.abi,
  ethers.provider
);

const main = async () => {
  try {
    const signers = await ethers.getSigners();

    console.log("Performing upkeep");

    const tx = await poolContract
      .connect(signers[0])
      .performUpkeep("0x", { gasLimit: "2500000" });
    await tx.wait();

    console.log("Upkeep successful");
  } catch (error) {
    console.log(error.message);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
