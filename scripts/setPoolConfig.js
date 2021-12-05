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

    console.log("Setting pool config");

    const tx1 = await poolContract.connect(signers[0]).setPoolEntryInterval(60);
    await tx1.wait();

    const tx2 = await poolContract
      .connect(signers[0])
      .setPoolStartInterval(120);
    await tx2.wait();

    const tx3 = await poolContract.connect(signers[0]).setPoolDuration(60);
    await tx3.wait();

    console.log("Pool config updated");
  } catch (error) {
    console.log(error.message);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
