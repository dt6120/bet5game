const { ethers } = require("hardhat");

const main = async (time) => {
  const res = await ethers.provider.send("evm_increaseTime", [86400]);
  console.log(res);

  //   ethers.provider.getNetwork().then(console.log);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
