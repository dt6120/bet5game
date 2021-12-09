import { ethers } from "ethers";
import getProvider from "./getProvider";

import { contracts } from "./artifacts.json";

// async when provider had to be awaited
const getContracts = async () => {
  const { Token, Bet5Game } = contracts;
  const provider = getProvider();
  // const provider = new ethers.providers.JsonRpcProvider(
  //   process.env.MORALIS_MUMBAI_RPC_URL
  // );

  const tokenContract = new ethers.Contract(Token.address, Token.abi, provider);
  const poolContract = new ethers.Contract(
    Bet5Game.address,
    Bet5Game.abi,
    provider
  );

  return { tokenContract, poolContract };
};

export default getContracts;
