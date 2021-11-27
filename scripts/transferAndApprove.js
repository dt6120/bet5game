const {
  contracts: { Bet5Game, Token },
} = require("../src/ethereum/artifacts.json");

const poolContract = new ethers.Contract(
  Bet5Game.address,
  Bet5Game.abi,
  ethers.provider
);

const tokenContract = new ethers.Contract(
  Token.address,
  Token.abi,
  ethers.provider
);

const main = async () => {
  const signers = await ethers.getSigners();

  for (let i = 0; i < 20; i++) {
    const tx = await tokenContract
      .connect(signers[0])
      .transfer(signers[i].address, "1000000000000000000000000");
    await tx.wait();

    // const apprTx = await
    tokenContract
      .connect(signers[i])
      .approve(poolContract.address, "1000000000000000000000000");
    // await apprTx.wait();

    console.log(`Transfer and approve done for user ${i + 1}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
