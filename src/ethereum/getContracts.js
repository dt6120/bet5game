import { ethers } from "ethers";
import { httpsProvider as provider, wssProvider } from "./getProvider";

import { contracts } from "./artifacts.json";

const { Token, Bet5Game } = contracts;

export const tokenContract = new ethers.Contract(
  Token.address,
  Token.abi,
  provider
);
export const poolContract = new ethers.Contract(
  Bet5Game.address,
  Bet5Game.abi,
  provider
);

export const wssPoolContract = new ethers.Contract(
  Bet5Game.address,
  Bet5Game.abi,
  wssProvider
);

export const poolContractWithProvider = (provider) =>
  new ethers.Contract(Bet5Game.address, Bet5Game.abi, provider);

export const tokenContractWithAddress = (address) =>
  new ethers.Contract(address, Token.abi, provider);
