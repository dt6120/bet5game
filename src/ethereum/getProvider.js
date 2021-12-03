import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";

const getProvider = async () => {
  return await detectEthereumProvider();
  // return new ethers.providers.Web3Provider(window.ethereum);
};

export default getProvider;
