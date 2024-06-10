require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');

module.exports = {
  solidity: "0.8.24",
  gasReporter: {
    enabled: true,
    outputFile: "report.txt",
    noColors: true,
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
};
