const addNetwork = async () => {
  // params = [{
  //     chainId: '0x89 ',
  //     chainName: 'Matic Mainnet ',
  //     nativeCurrency: {
  //         name: 'MATIC ',
  //         symbol: 'MATIC ',
  //         decimals: 18
  //     },
  //     rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
  //     blockExplorerUrls: ['https://polygonscan.com/']
  // }]

  const params = [
    {
      chainId: "0x13881",
      chainName: "Polygon Testnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
      blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    },
  ];

  try {
    await window?.ethereum?.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13881" }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      await window?.ethereum?.request({
        method: "wallet_addEthereumChain",
        params,
      });
    } else {
      throw new Error(switchError);
    }
    // handle other "switch" errors
  }
};

export default addNetwork;
