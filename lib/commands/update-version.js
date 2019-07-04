const sendGrid = require('@sendgrid/client');
const fs = require("fs");
const chalk = require('chalk');
const sequential = require('promise-sequential');
const {
  configPath,
  apiKeyPath,
  fetchTemplate,
  updateVersion
} = require('../defaults');

function updateVersionCmd(templateId, versionId, path, subject, dataPath) {
  const key = fs.readFileSync(apiKeyPath, { encoding: 'utf-8'}).replace(/\r?\n|\r/g, '');
  sendGrid.setApiKey(key);

  sequential([
    fetchTemplate(templateId),
    updateVersion(templateId, versionId, path, dataPath,{ subject }),
  ]).then(([template, version]) => {
    const config = JSON.parse(fs.readFileSync(configPath,  { encoding: 'utf-8' }));
    const local = config.templates.find(({ id }) => id === templateId);
    const localVersion = local.versions.find(({ id }) => id === version.id);
    config.templates = [
      ...config.templates.slice(0, config.templates.indexOf(local)),
      {
        name: template.name,
        id: template.id,
        versions: [
          ...local.versions.slice(0, local.versions.indexOf(localVersion)),
          {
            id: version.id,
            path: path,
            data: dataPath
          },
          ...local.versions.slice(local.versions.indexOf(local) + 1)
        ]
      },
      ...config.templates.slice(config.templates.indexOf(local) + 1)
    ];
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2));
    console.log(chalk.green('Verison updated!!!'));
    console.log(chalk.bold.green(`Template ID: ${chalk.bold.cyan(template.id)}`));
    console.log(chalk.bold.green(`Version ID: ${chalk.bold.cyan(version.id)}`));
  })
}

module.exports = updateVersionCmd;
