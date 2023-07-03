/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const GOERLI_URL = process.env.GOERLI_TESTNET;
module.exports = {
  solidity: "0.8.18",
  networks:{
     goerli:{
       url: GOERLI_URL,
       accounts:[process.env.WALLET_PRIVATE_KEY]
     },
    hardhat: { 
      
    }
  },
  params: {
    param1: '',
    param2: '',
  },
};
