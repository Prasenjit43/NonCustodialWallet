const { ethers } = require('ethers');
const otplib = require('otplib');
const qrcode = require('qrcode');

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

module.exports.enable2FA = async function (_address) {
    const secret = otplib.authenticator.generateSecret();
    console.log("\n");
    const otpAuthUrl = otplib.authenticator.keyuri('NON-CUSTODIAL WALLET', _address, secret);
    console.log(`${colors.green} ${colors.bright} Add QR code to Google Authenticator for 2FA ${colors.reset}`);
    console.log("\n");

    qrcode.toString(otpAuthUrl, { type: 'terminal', small: true }, (err, qrCodeASCII) => {
        console.log(qrCodeASCII);
    });

    return secret;
}

module.exports.verify2FA = async function (_userSecretKey, _verificationCode) {
    const isValid = otplib.authenticator.check(_verificationCode, _userSecretKey);

    if (isValid) {
        return true;
    } else {
        return false;
    }
}