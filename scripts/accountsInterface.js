const readline = require('readline');
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

function createAccountInterface(accounts) {
  const r2 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let selectedIndex = 0;
  let listening = true;

  // Function to display the accounts list
  function displayAccounts() {
    accounts.forEach((account, index) => {
      if (index === selectedIndex) {
        console.log(`> ${account}`);
      } else {
        console.log(`  ${account}`);
      }
    });
  }

  // Function to handle keypress events
  function handleKeyPress(key) {
    if (listening) {
      if (key === '\u001B\u005B\u0041') { // Up arrow key
        selectedIndex = Math.max(0, selectedIndex - 1);
      } else if (key === '\u001B\u005B\u0042') { // Down arrow key
        selectedIndex = Math.min(accounts.length - 1, selectedIndex + 1);
      }

      readline.cursorTo(process.stdout, 0, 0);
      //readline.moveCursor(process.stdout, 0, -accounts.length);
      readline.clearScreenDown(process.stdout);
      displayAccounts();
    }
  }

  // Start listening for keypress events
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (_, key) => {
    handleKeyPress(key.sequence);
  });

  // Initial display of accounts
  displayAccounts();

  // Return a promise that resolves with the selected account
  return new Promise(resolve => {
    r2.on('line', () => {
      listening = false;
      resolve(accounts[selectedIndex]);
    });
  });
}

module.exports = createAccountInterface; 