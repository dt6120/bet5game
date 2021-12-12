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

    console.log("Creating new pool");

    const entryFee = "1000000000000000000000";
    const tx = await poolContract
      .connect(signers[0])
      .createPool(entryFee, "0x24f4f44abd6540c31fc7063386e50ef8ac80a491");
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

// LINK: 0xf3052ac27f270595b6ef9164b4ea130df3c848e2;
// WBTC: 0x46fc4eaffe1c37e65c31b6727eb020124735687a;
// DOGE: 0x24f4f44abd6540c31fc7063386e50ef8ac80a491;
// WBNB: 0x55777af7c8c49765460e3d86a442c618f9763bee;
// AAVE: 0x7c1911d522d04fd0afc92159972b7764b6fec908;
