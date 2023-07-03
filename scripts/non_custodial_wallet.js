const figlet = require('figlet');
const crypto = require('crypto');
const readline = require('readline');
const accounts = require('./accounts');
const security = require('./security');
const sendReceiveTrans = require('./sendReceiveTrans');
const createAccountInterface = require('./accountsInterface');
const getFoldersAndFiles = require('../scripts/accountsList');
const erc20Artifact = require('../contracts/ERC20.json');
const { table } = require('console');
const transactions = require('./getTransactionHistory');

const text = '!!! NON-CUSTODIAL WALLET !!!';
const options = ['Create new account', 'Already have an account?', 'Exit'];
const networks = ['Mainnet', 'Goerli', 'Sapolia', 'Exit'];
const accountOptions = ['Send Transaction', 'Sign Message', 'Add Asset (erc20)', 'Transfer Asset (erc20)', 'Transaction History', 'Back', 'Exit'];

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    red: "\x1b[31m",
    underline: "\x1b[4m"
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const displayHeading = async () => {
    return new Promise((resolve, reject) => {
        figlet(text, function (err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                reject(err);
                return;
            }
            console.log(data);
            resolve();
        });
    });
};

const displayNetwork = () => {
    return new Promise((resolve, reject) => {
        console.log(`${colors.underline}Select a network : ${colors.reset}`);
        networks.forEach((network, index) => {
            const coloredOption = `${colors.bright}${colors.cyan}${index + 1}.${colors.reset} ${colors.yellow}${network}${colors.reset}`;
            console.log(coloredOption);
        });
        resolve();
    });
};

const displayAccountOptions = () => {
    return new Promise((resolve, reject) => {
        console.log(`${colors.underline}Select an option:${colors.reset}`);
        accountOptions.forEach((accountOption, index) => {
            const coloredOption = `${colors.bright}${colors.cyan}${index + 1}.${colors.reset} ${colors.yellow}${accountOption}${colors.reset}`;
            console.log(coloredOption);
        });
        resolve();
    });
};


const displayAction = () => {
    return new Promise((resolve, reject) => {
        console.log(`${colors.underline}Select an option :${colors.reset}`);
        options.forEach((option, index) => {
            const coloredOption = `${colors.bright}${colors.cyan}${index + 1}.${colors.reset} ${colors.yellow}${option}${colors.reset}`;
            console.log(coloredOption);
        });
        resolve();
    });
};

const qn_selectChoice = () => {
    console.log("\n");
    return new Promise((resolve, reject) => {
        rl.question(`${colors.magenta}Enter your choice : ${colors.reset}`, (answer) => {
            resolve(answer);
        });
    });
};

const qn_createAccount = () => {
    return new Promise((resolve, reject) => {
        rl.stdoutMuted = true;
        rl._writeToOutput = function (string) {
            if (rl.stdoutMuted && string !== '\r\n') {
                rl.output.write('*');
            } else if (!rl.stdoutMuted) {
                rl.output.write(string);
            }
        };
        console.log(`${colors.cyan}Create your Master secret password:${colors.reset}`);
        rl.question('', (passwordAnswer) => {
            console.log("\n");
            const wallet = accounts.createAccount();
            rl.stdoutMuted = false;
            resolve({ _wallet: wallet, _password: passwordAnswer });
        });
    });
};

const qn_verifyPassword = () => {
    return new Promise((resolve, reject) => {
        rl.stdoutMuted = true;
        rl._writeToOutput = function (string) {
            if (rl.stdoutMuted && string !== '\r\n') {
                rl.output.write('*');
            } else if (!rl.stdoutMuted) {
                rl.output.write(string);
            }
        };
        console.log(`${colors.cyan}Enter your Master secret password:${colors.reset}`);
        rl.question('', (passwordVerify) => {
            console.log("\n");
            rl.stdoutMuted = false;
            resolve(passwordVerify);
        });
    });
};

const qn_2FA = () => {
    return new Promise((resolve, reject) => {
        rl.question(`${colors.cyan}Enter OTP : ${colors.reset}`, async (otpAnswer) => {
            resolve(otpAnswer);
        });
    });
};


const qn_selectNetwork = () => {
    console.log("\n");
    return new Promise((resolve, reject) => {
        rl.question(`${colors.magenta}Enter your choice : ${colors.reset}`, (networkAnswer) => {
            resolve(networkAnswer);
        });
    });
};


const qn_selectAccOption = () => {
    return new Promise((resolve, reject) => {
        console.log("\n");
        rl.question(`${colors.magenta}Enter your choice : ${colors.reset}`, (accountAnswer) => {
            resolve(accountAnswer);
        });
    });
};


const qn_erc20 = () => {
    return new Promise((resolve, reject) => {
        rl.question(`${colors.cyan}Enter ERC20 Token address : ${colors.reset}`, (erc20Addr) => {
            resolve(erc20Addr);
        });
    });
};

const qn_address = () => {
    return new Promise((resolve, reject) => {
        rl.question(`${colors.cyan}Enter Recepient Address : ${colors.reset}`, (recepientAddr) => {
            resolve(recepientAddr);
        });
    });
};

const qn_TransactionAmount = () => {
    return new Promise((resolve, reject) => {
        rl.question(`${colors.cyan}Enter Amount : ${colors.reset}`, (transAmt) => {
            resolve(transAmt);
        });
    });
};

const qn_messageToSign = () => {
    return new Promise((resolve, reject) => {
        rl.question(`${colors.cyan}Enter message to sign : ${colors.reset}`, (messageAns) => {
            resolve(messageAns);
        });
    });
};



const qn_exit = () => {
    return new Promise((resolve, reject) => {
        rl.question('Do you want to exit? (y/n) ', (answer) => {
            if (answer === 'y' || answer === 'Y') {
                console.log('Exiting...');
                rl.close();
            } else {
                resolve();
            }
        });
    });
};


const getTokenbalances = async (_provider, _tokenList, _signer) => {
    const data = [];
    const eth_balance = await _provider.getBalance(_signer.address);
    data.push({ ERC20: 'ETH', balance: ethers.utils.formatUnits(eth_balance, 18), address: _signer.address });

    for (let i = 0; i < _tokenList.length; i++) {
        try {
            const erc20Instance = new ethers.Contract(_tokenList[i], erc20Artifact.abi, _provider);
            const balance = await erc20Instance.connect(_signer).balanceOf(_signer.address);
            const formattedBalance = ethers.utils.formatUnits(balance, await erc20Instance.connect(_signer).decimals());
            const symbol = await erc20Instance.connect(_signer).symbol();
            const newRow = { ERC20: symbol, balance: formattedBalance, address: _tokenList[i] };
            data.push(newRow);
        } catch (error) {
            null;
        }
    }
    return data;
};


const qn_continue = () => {
    return new Promise((resolve, reject) => {
        console.log("\n");
        rl.question('Press enter key to continue ....', (continueKey) => {
            resolve();
        });
    });
};


async function main() {
    let decrytedWallet;
    while (true && !accountVerified) {
        console.clear();
        await displayHeading();
        await displayAction();
        const selectChoiceAns = await qn_selectChoice();
        const choice = parseInt(selectChoiceAns);

        if (isNaN(choice) || choice < 1 || choice > options.length) {
            console.log('Invalid choice. Please try again.');
            console.clear();
        } else {

            const selectedOption = options[choice - 1];
            if (selectedOption === 'Create new account') {
                const values = await qn_createAccount();
                const secret = await security.enable2FA(values._wallet.address);
                await accounts.exportingToKeystore(values._wallet, secret, values._password);
                await qn_continue();
            } else if (selectedOption === 'Already have an account?') {
                const accList = await getFoldersAndFiles('./keysFolder/')
                if (accList.folders.length < 1) {
                    console.log("No account found");
                    await qn_continue();
                    continue;
                }
                const selectedAccount = await createAccountInterface(accList.folders);
                console.log("\n");
                console.log("Selected Account : ", selectedAccount);
                const enteredPass = await qn_verifyPassword();
                const keys = await accounts.importingFromKeystore(selectedAccount, enteredPass);
                if (keys._error != null) {
                    console.log(keys._error);
                    await qn_continue();
                    continue;
                }
                const otpAnswer = await qn_2FA();
                const otpVerification = await security.verify2FA(keys.decryptedSecret, otpAnswer);
                if (otpVerification) {
                    console.log(`${colors.green}!!!Congratulation! , Account Verified!!!${colors.reset}`);
                    decrytedWallet = keys.decrytedWallet;
                    accountVerified = true;
                }
                else {
                    console.log(`${colors.red}!!!Sorry! , Account not Verified!!!${colors.reset}`);
                }
                await qn_continue();
            }
            else if (selectedOption === 'Exit') {
                accountVerified = false;
                await qn_exit();
            }
        }
    }


    let isProviderSet = false;
    let provider = null;
    let currentNetwork = null;
    let txnURL;
    while (accountVerified) {
        if (!isProviderSet) {
            console.clear();
            await displayHeading();
            await displayNetwork();
            const selectedNetwork = await qn_selectNetwork();
            const choice = parseInt(selectedNetwork);
            if (isNaN(choice) || choice < 1 || choice > networks.length) {
                console.log('Invalid choice. Please try again.');
                console.clear();
            } else {
                const selectedOption = networks[choice - 1];

                if (selectedOption === 'Mainnet') {
                    provider = new ethers.providers.JsonRpcProvider(process.env.MAINNET);
                    isProviderSet = true;
                    currentNetwork = 'MAINNET';
                    txnURL = "https://etherscan.io/tx/";
                }
                else if (selectedOption === 'Goerli') {
                    isProviderSet = true;
                    provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_TESTNET);
                    currentNetwork = 'GOERLI';
                    txnURL = "https://goerli.etherscan.io/tx/";
                }
                else if (selectedOption === 'Sapolia') {
                    provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_TESTNET);
                    isProviderSet = true;
                    currentNetwork = 'SAPOLIA';
                    txnURL = "https://sepolia.etherscan.io/tx/";
                }
                else if (selectedOption === 'Exit') {
                    await qn_exit();
                    continue;
                }
                await qn_continue();
            }
        }





        if (isProviderSet) {
            console.clear();
            await displayHeading();

            const { walletForTrans, signer } = await accounts.getSigner(provider, decrytedWallet);
            const tokenList = await accounts.listOfTokens(decrytedWallet.address, currentNetwork);
            const tokenBalances = await getTokenbalances(provider, tokenList, signer);
            table(tokenBalances);
            console.log("\n");

            await displayAccountOptions();
            const accountAns = await qn_selectAccOption();
            const choice = parseInt(accountAns);

            if (isNaN(choice) || choice < 1 || choice > accountOptions.length) {
                console.log('Invalid choice. Please try again.');
                console.clear();
            } else {
                const selectedOption = accountOptions[choice - 1];

                if (selectedOption === 'Send Transaction') {
                    const _recepientAddr = await qn_address();
                    const _transactionAmount = await qn_TransactionAmount();
                    try {
                        const txn = await sendReceiveTrans
                            .sendTransaction(signer.address,
                                _recepientAddr,
                                provider,
                                walletForTrans,
                                _transactionAmount);
                        console.log("\n");
                        console.log(`${colors.green}View on blocx explorer : \n${txnURL}${txn}${colors.reset}`);

                    } catch (error) {
                        console.log("\n");
                        console.log(`${colors.red}Transaction completed in error : ${error.message}${colors.reset}`)
                    }
                }

                else if (selectedOption === 'Sign Message') {
                    const _message = await qn_messageToSign();
                    const signedMsg = await walletForTrans.signMessage(_message);
                    console.log(`${colors.green}Signed Message : ${signedMsg}${colors.reset}`);
                }
                else if (selectedOption === 'Add Asset (erc20)') {
                    const _erc20Addr = await qn_erc20();
                    await accounts.appendToken(decrytedWallet.address, _erc20Addr, currentNetwork);
                }
                else if (selectedOption === 'Transfer Asset (erc20)') {
                    const _erc20Addr = await qn_erc20();
                    const _recepientAddr = await qn_address();
                    const _transactionAmount = await qn_TransactionAmount();
                    const erc20Instance = new ethers.Contract(_erc20Addr, erc20Artifact.abi, provider);
                    try {
                        const transaction = await erc20Instance.connect(signer).transfer(_recepientAddr, ethers.utils.parseUnits(_transactionAmount, 18));
                        console.log("\n");
                        console.log(`${colors.green}View on blocx explorer : \n${txnURL}${transaction.hash}${colors.reset}`);
                    } catch (error) {
                        console.log(`${colors.red}Transaction completed in error : ${error.message} ${colors.reset}`);
                    }
                }
                else if (selectedOption === 'Transaction History') {
                    await transactions.getHistory(decrytedWallet.address);
                }

                else if (selectedOption === 'Back') {
                    isProviderSet = false;
                    provider = null;
                    currentNetwork = null;
                    continue;
                }
                else if (selectedOption === 'Exit') {
                    await qn_exit();
                    continue;
                }
                await qn_continue();
            }


        }


    }


}
let accountVerified = false;
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});