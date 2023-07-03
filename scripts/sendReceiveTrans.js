const { ethers } = require('ethers');
const fs = require('fs')

module.exports.sendTransaction = async function (_fromAddress, _toAddress, _provider, _walletForTrans, _amtToSend) {
    let transactionHash;
    let transaction;

    try {
        const nonce = await _provider.getTransactionCount(_walletForTrans.address);
        const gasPrice = await _provider.getGasPrice();

        transaction = {
            to: _toAddress,
            value: ethers.utils.parseEther(_amtToSend),
            nonce: nonce,
            gasPrice: gasPrice,
        };

        const estimate = await _provider.estimateGas(transaction);
        transaction.gasLimit = estimate;
        const signedTx = await _walletForTrans.signTransaction(transaction);
        const output = await _provider.sendTransaction(signedTx);
        transactionHash = output.hash;
        return transactionHash;
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
};
