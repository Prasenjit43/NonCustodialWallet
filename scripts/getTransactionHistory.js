const { ethers } = require("ethers");
const fs = require("fs");
const axios = require("axios");
const { Network, Alchemy } = require("alchemy-sdk");
const { table } = require("console");
const Table = require("cli-table3");

const settings = {
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

async function getFromHistory(_address) {
  let response;
  try {
    response = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: _address,
      category: ["external", "internal", "erc20", "erc721", "erc1155"],
    });
  } catch (error) {
    console.error(error);
  }
  return response;
}

async function getToHistory(_address) {
  let response;
  try {
    response = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: _address,
      category: ["external", "internal", "erc20", "erc721", "erc1155"],
    });
  } catch (error) {
    console.error(error);
  }
  return response;
}

const generateMergedRes = async (_fromResponse, _toResponse) => {
  const mergedResponse = {
    transfers: [..._fromResponse.transfers, ..._toResponse.transfers],
  };
  const sortedResponse = {
    transfers: [
      ...mergedResponse.transfers.sort((a, b) => {
        return a.blockNum < b.blockNum ? -1 : 1;
      }),
    ],
  };
  return sortedResponse;
};

// Function to wrap text within a specified width
function table_display(data) {
  const table = new Table({
    head: Object.keys(data[0]),
    //head: Object.keys(data[0]).map(key => `\x1b[33m${key}\x1b[0m`), // Yellow color for table headings

    colWidths: [44, 44, 68, 17], // Adjust the column widths as needed
    wordWrap: true,
  });

  data.forEach((item) => {
    table.push(Object.values(item).map((val) => `\x1b[36m${val}\x1b[0m`)); // Cyan color for table text
  });

  console.log(table.toString());
}

const displayTransaction = async (_sortedResponse) => {
  const data = [];
  for (const events of _sortedResponse.transfers) {
    data.push({
      FROM: events.from,
      TO: events.to,
      HASH: events.hash,
      VALUE: events.value + " " + events.asset,
    });
  }
  table_display(data);
};

module.exports.getHistory = async function (address) {
  const fromHistoryRes = await getFromHistory(address);
  const toHistoryRes = await getToHistory(address);
  const mergedResponse = await generateMergedRes(fromHistoryRes, toHistoryRes);
  await displayTransaction(mergedResponse);
};
