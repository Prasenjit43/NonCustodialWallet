const { ethers } = require('ethers');
const crypto = require('crypto');
const fs = require('fs')
const bib39 = require('bip39');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    red: "\x1b[31m"
};


const generateKeys = () => {
    console.log("/**************** Genarating Keys ***************/")
    const mnemonic = ethers.Wallet.createRandom().mnemonic;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic.phrase);
    console.log(`${colors.red}Account Address: ${wallet.address}  ${colors.reset}`);
    return { _wallet: wallet };
}

module.exports.exportingToKeystore = async function (_wallet, _secret, _password) {
    try {
        const folderPath = './keysFolder/' + _wallet.address;
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        const keystore = await _wallet.encrypt(_password);
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(_password, 'salt', 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedCipher = cipher.update(_secret, 'utf8', 'hex');
        encryptedCipher += cipher.final('hex');
        const encryptedSecret = iv.toString('hex') + encryptedCipher;

        fs.writeFileSync(folderPath + '/' + _wallet.address + '.keystore', keystore);

        //Saving encrypted wallet to files
        fs.writeFileSync(folderPath + '/' + 'MAINNET_ERC20.txt', '');
        fs.writeFileSync(folderPath + '/' + 'GOERLI_ERC20.txt', '');
        fs.writeFileSync(folderPath + '/' + 'SAPOLIA_ERC20.txt', '');

        //Saving encrypted secret to files
        fs.writeFileSync(folderPath + '/' + _wallet.address + '.dat', encryptedSecret);
    } catch (error) {
        console.error(error);
    }
}

module.exports.appendToken = async function (_address, _tokenAddr, _network) {
    try {
        const folderPath = './keysFolder/' + _address;
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        const filename = folderPath + '/' + _network + '_ERC20.txt';
        fs.appendFileSync(filename, _tokenAddr + '\n');
        console.log(`${colors.green}!!!!! Token updated successfully !!!!!${colors.reset}`);
    } catch (error) {
        console.error(error);
    }
}

module.exports.listOfTokens = async function (_address, _network) {
    return new Promise((resolve, reject) => {
        try {
            const folderPath = './keysFolder/' + _address;
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            const filename = folderPath + '/' + _network + '_ERC20.txt';

            // Read the file asynchronously
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading the file:', err);
                    return;
                }
                // Split the file contents into an array of lines
                const lines = data.trim().split('\n');
                resolve(lines);
            });

        } catch (error) {
            console.error(error);
            reject(error.message);
        }
    });
}

module.exports.importingFromKeystore = async function (_publicKey, _password) {
    let decrytedWallet, decryptedSecret;
    try {
        const folderPath = './keysFolder/' + _publicKey;
        if (!fs.existsSync(folderPath)) {
            throw "invalid path";
        }

        const keystore = fs.readFileSync(folderPath + '/' + _publicKey + '.keystore', 'utf8');
        decrytedWallet = await ethers.Wallet.fromEncryptedJson(keystore, _password);
        const datFile = fs.readFileSync(folderPath + '/' + _publicKey + '.dat', 'utf8');
       
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(_password, 'salt', 32);
        const iv = Buffer.from(datFile.slice(0, 32), 'hex');
        const encryptedData = datFile.slice(32);

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decryptedSecret = decipher.update(encryptedData, 'hex', 'utf8');
        decryptedSecret += decipher.final('utf8');
    } catch (error) {
        return { decrytedWallet: null, decryptedSecret: null, _error: error.message };
    }
    return { decrytedWallet: decrytedWallet, decryptedSecret: decryptedSecret, _error: null };
}

module.exports.createAccount = function () {
    ({ _wallet: _wallet } = generateKeys());
    return _wallet;
}

module.exports.getSigner = async function (_provider, _wallet) {
    const walletForTrans = new ethers.Wallet(_wallet.privateKey);
    const signer = walletForTrans.connect(_provider);
    return { walletForTrans, signer };
}
