const fs = require('fs');

function getFoldersAndFiles(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      const folders = [];
      const filesList = [];

      files.forEach(file => {
        if (file.isDirectory()) {
          folders.push(file.name);
        } else {
          filesList.push(file.name);
        }
      });

      resolve({ folders, files: filesList });
    });
  });
}

module.exports = getFoldersAndFiles