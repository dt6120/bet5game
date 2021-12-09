// import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";

// const getProvider = async () => {
// return await detectEthereumProvider();
// return new ethers.providers.Web3Provider(window.ethereum);
// };

const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    return new ethers.providers.JsonRpcProvider(
      process.env.ALCHEMY_MUMBAI_RPC_URL
    );
  }
};

export default getProvider;
