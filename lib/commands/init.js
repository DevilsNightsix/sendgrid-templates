const fs = require("fs");
const chalk = require('chalk');
const co = require('co');
const prompt = require("co-prompt");
const { configPath, apiKeyPath } = require('../defaults');

const EMPTY_CONFIG = {
  templates: []
};

const IGNORE_API_KEY = `\n#Send grid api key\n${apiKeyPath}`;

function promptConfig() {
  return co( function *() {
    const key = yield prompt(
      chalk.bold.cyan('Enter yor sendgrid API key: ')
    );

    return key;
  }).then(key => {
    fs.writeFileSync(configPath, JSON.stringify(EMPTY_CONFIG, undefined, 2));
    console.log(
      chalk.bold.green(`Config file written to ${configPath}`)
    );

    fs.writeFileSync(apiKeyPath, key);
    console.log(
      chalk.bold.green(`Sendgrid API key saved to ${apiKeyPath}`)
    );
  })
}

function initFn() {
  promptConfig().then(() => {
    fs.readFile(
      './.gitignore',
      (err, content) => {
        if (err) {
          fs.writeFileSync('.gitignore', IGNORE_API_KEY);
          console.log(
            chalk.bold.green(`Created default .gitignore`)
          );
        } else {
          fs.writeFileSync('.gitignore', content + IGNORE_API_KEY);
          console.log(
            chalk.bold.green(`Ignore rules added to .gitignore`)
          );

          process.exit(0);
        }
      }
    );
  })
}

module.exports = initFn;
