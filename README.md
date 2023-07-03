# NonCustodialWallet

This repository contains the code for a Non-Custodial Wallet, a decentralized wallet built on Ethereum. The wallet allows users to manage their own funds securely and perform various transactions on the Ethereum network.

## Prerequisites

Before running the project, make sure you have the following prerequisites installed on your system:

1. [Metamask](https://metamask.io/): Metamask is a browser extension that allows you to interact with Ethereum-based applications and manage your Ethereum accounts securely.

2. [Visual Studio Code (VS Code)](https://code.visualstudio.com/): A powerful and popular code editor.

3. [Node.js](https://nodejs.org/): Node.js is a JavaScript runtime that allows you to run JavaScript code outside of a web browser.

## Installation

To set up the project, follow these steps:

1. Clone the repository using the following command:

   ```bash
   git clone https://github.com/Prasenjit43/NonCustodialWallet.git
   ```

2. Navigate to the project directory:

   ```bash
   cd NonCustodialWallet/
   ```

3. Install the required npm packages:

   ```bash
   npm install
   ```

4. Replace all the global variables in the `.env` file with your specific configuration. This file contains environment variables that the project relies on for proper execution.

## Running the Project

To run the Non-Custodial Wallet project, execute the following command:

```bash
npx hardhat run scripts/non_custodial_wallet.js
```

This command will start the project and execute the `non_custodial_wallet.js` script, which contains the main logic of the Non-Custodial Wallet.
