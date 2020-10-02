module.exports = {
    accounts: {
      amount: 10, // Number of unlocked accounts
      ether: 10000, // Initial balance of unlocked accounts (in ether)
    },

    contracts: {
      type: 'truffle', // Contract abstraction to use: 'truffle' for @truffle/contract or 'web3' for web3-eth-contract
      defaultGas: 6e6, // Maximum gas for contract calls (when unspecified)

      // Options available since v0.1.2
      defaultGasPrice: 20e9, // Gas price for contract calls (when unspecified)
      artifactsDir: 'build/contracts', // Directory where contract artifacts are stored
    },

    node: { // Options passed directly to Ganache client
      gasLimit: 8e6, // Maximum gas per block
      gasPrice: 20e9 // Sets the default gas price for transactions if not otherwise specified.
    },

    // Configure your compilers
    compilers: {
      solc: {
        version: "0.6.2",    // Fetch exact version from solc-bin (default: truffle's version)
        // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
        settings: {          // See the solidity docs for advice about optimization and evmVersion
          optimizer: {
            enabled: false,
            runs: 200
          },
          evmVersion: "byzantium"
        }
      },
    },
  };