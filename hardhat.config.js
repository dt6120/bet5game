require("dotenv").config();

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    const balance = ethers.utils.formatEther(
      (await account.getBalance()).toString()
    );
    console.log(`${account.address} (${balance} ETH)`);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MUMBAI_RPC_URL,
      },
      accounts: {
        count: 20,
      },
    },

    localhost: {
      url: "http://0.0.0.0:8545",
      // chainId: 8545,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5,
      },
    },

    mumbai: {
      url: process.env.ALCHEMY_MUMBAI_RPC_URL,
      chainId: 80001,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
      saveDeployments: true,
    },
  },

  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },

  paths: {
    root: "./",
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },

  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
};
