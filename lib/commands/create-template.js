const sendGrid = require('@sendgrid/client');
const fs = require("fs");
const path = require('path');
const chalk = require('chalk');
const sequential = require('promise-sequential');
const {
  configPath,
  apiKeyPath,
  createTemplate,
  createVersion,
  addTestDataToVersion
} = require('../defaults');

function createTemplateCmd(templateName, templatePath, subject, dataPath) {
  const key = fs.readFileSync(apiKeyPath, { encoding: 'utf-8'}).replace(/\r?\n|\r/g, '');
  sendGrid.setApiKey(key);

  sequential([
    createTemplate(templateName),
    createVersion(templatePath, subject),
    addTestDataToVersion(dataPath)
  ]).then(([template, version]) => {
    const config = JSON.parse(fs.readFileSync(configPath,  { encoding: 'utf-8' }));
    config.templates.push({
      name: templateName,
      id: template.id,
      versions: [
        {
          id: version.id,
          path: templatePath,
          data: dataPath
        }
      ]
    });
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2));
    console.log(chalk.green('Template deployed!!!'));
    console.log(chalk.bold.green(`Template ID: ${chalk.bold.cyan(template.id)}`));
    console.log(chalk.bold.green(`Template Version ID: ${chalk.bold.cyan(version.id)}`));
  })
}

module.exports = createTemplateCmd;
