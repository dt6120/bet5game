import detectEthereumProvider from "@metamask/detect-provider";

const getProvider = async () => {
  return await detectEthereumProvider();
};

export default getProvider;
