const addNetwork = async (type) => {
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
      chainId: "0x13881 ",
      chainName: "Polygon Testnet ",
      nativeCurrency: {
        name: "MATIC ",
        symbol: "MATIC ",
        decimals: 18,
      },
      rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
      blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    },
  ];

  window.ethereum &&
    window.ethereum
      .request({ method: "wallet_addEthereumChain ", params })
      .then(() => console.log("Success"))
      .catch((error) => console.log("Error", error.message));
};
