const { ethers } = require("hardhat");

const main = async () => {
  // await hre.run('compile');

  const Token = await ethers.getContractFactory("contracts/Token.sol:Token");
  const token = await Token.deploy("Unify", "UNF");

  await token.deployed();

  console.log(`Token deployed to ${token.address}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
