import { ethers } from "ethers";
import getProvider from "./getProvider";

import { contracts } from "./artifacts.json";

const getContracts = async () => {
  const { Token, Bet5Game } = contracts;
  const provider = new ethers.providers.Web3Provider(window.ethereum); // await getProvider();

  const tokenContract = new ethers.Contract(Token.address, Token.abi, provider);
  const poolContract = new ethers.Contract(
    Bet5Game.address,
    Bet5Game.abi,
    provider
  );

  return { tokenContract, poolContract };
};

export default getContracts;
