import { ethers } from "ethers";

export const httpsProvider = window.ethereum
  ? new ethers.providers.Web3Provider(window.ethereum)
  : new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_MUMBAI_RPC_URL);

export const wssProvider = window.ethereum
  ? new ethers.providers.Web3Provider(window.ethereum)
  : new ethers.providers.WebSocketProvider(process.env.ALCHEMY_MUMBAI_WSS);
