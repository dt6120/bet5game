const { ethers } = require("hardhat");

const { AAVE } = require("../data.json");

const main = async () => {
  const PriceFeed = await ethers.getContractFactory("PriceConsumer");
  const priceFeed = await PriceFeed.deploy();
  await priceFeed.deployed();

  const btcPrice = await priceFeed.getPrice(AAVE);
  console.log(btcPrice.toString());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
