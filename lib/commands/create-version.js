const sendGrid = require('@sendgrid/client');
const fs = require("fs");
const chalk = require('chalk');
const sequential = require('promise-sequential');
const {
  configPath,
  apiKeyPath,
  fetchTemplate,
  createVersion,
  addTestDataToVersion
} = require('../defaults');

function createVersionCmd(templateId, path, subject, dataPath) {
  const key = fs.readFileSync(apiKeyPath, { encoding: 'utf-8'}).replace(/\r?\n|\r/g, '');
  sendGrid.setApiKey(key);

  sequential([
    fetchTemplate(templateId),
    createVersion(path, subject),
    addTestDataToVersion(dataPath)
  ]).then(([template, version]) => {
    const config = JSON.parse(fs.readFileSync(configPath,  { encoding: 'utf-8' }));
    const local = config.templates.find(({ id }) => id === templateId);
    config.templates = [
      ...config.templates.slice(0, config.templates.indexOf(local)),
      {
        name: template.name,
        id: template.id,
        versions: [
          ...local.versions,
          {
            id: version.id,
            path: path,
            data: dataPath
          }
        ]
      },
      ...config.templates.slice(config.templates.indexOf(local) + 1)
    ];
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2));
    console.log(chalk.green('Template updated!!!'));
    console.log(chalk.bold.green(`Template ID: ${chalk.bold.cyan(template.id)}`));
    console.log(chalk.bold.green(`Created Version ID: ${chalk.bold.cyan(version.id)}`));
  })
}

module.exports = createVersionCmd;
