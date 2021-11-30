import { ethers } from "ethers";
import getProvider from "./getProvider";

const aggregatorAbi = [];

const getAggregatorData = async (aggregatorAddress) => {
  const provider = await getProvider();

  const aggregatorContract = new ethers.Contract(
    aggregatorAddress,
    aggregatorAbi,
    provider
  );

  return {
    price: (await aggregatorContract.latestRoundData())[1],
    decimals: await aggregatorContract.decimals(),
  };
};

export default getAggregatorData;
