import { ethers } from "ethers";
import getProvider from "./getProvider";

import { contracts } from "./artifacts.json";

const getTokenData = async (tokenAddress) => {
  const { Token } = contracts;
  const provider = getProvider();

  const tokenContract = new ethers.Contract(tokenAddress, Token.abi, provider);

  return {
    name: await tokenContract.name(),
    symbol: await tokenContract.symbol(),
    decimals: await tokenContract.decimals(),
  };
};

export default getTokenData;
