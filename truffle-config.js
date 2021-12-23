require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`
        ),
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.8.10",
    },
  },
};
