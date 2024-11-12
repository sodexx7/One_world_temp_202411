import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import { config as dotenv } from "dotenv";

dotenv();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.22",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          // viaIR: true,
        },
      },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
    truffle: {
      url: "http://localhost:24012/rpc",
    },
    testnet: {
      url: process.env.TESTNET_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://1rpc.io/sepolia",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    polygon: {
      url: process.env.MATIC_MAINNET_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      // gasPrice: 1200000000000,
      // minGasPrice: 800000000000,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    token: "ETH",
    coinmarketcap: "8512f085-3377-4a79-84db-d903ff8d9042",
    gasPrice: 21,
    showTimeSpent: true,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: "VAMIDJCYIT76E628K5W572WEVQ2HZ31DKB", //polygon
    // apiKey: 'U23IUYHAVKMKPV9P8UVDZ7RSRSYZ3XAZNJ', //ethereum
  },
};

export default config;
