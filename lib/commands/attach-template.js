const sendGrid = require('@sendgrid/client');
const fs = require("fs");
const chalk = require('chalk');
const sequential = require('promise-sequential');
const {
  configPath,
  apiKeyPath,
  createVersion,
  addTestDataToVersion,
  fetchTemplate,
  updateVersion
} = require('../defaults');


function aattachTemplateFn(templateId, path, subject = null, data = null, version = null) {
  const key = fs.readFileSync(apiKeyPath, { encoding: 'utf-8'}).replace(/\r?\n|\r/g, '');
  sendGrid.setApiKey(key);

  const updates = {};
  if (subject) {
    updates.subject = subject;
  }
  const sequence =  version ? [
    fetchTemplate(templateId),
    updateVersion(templateId, version, path, data, updates),
  ] : [
    fetchTemplate(templateId),
    createVersion(path, subject),
    data ? addTestDataToVersion(data) : null
  ].filter(Boolean);

  sequential(sequence).then(([template, version]) => {
    const config = JSON.parse(fs.readFileSync(configPath,  { encoding: 'utf-8' }));
    config.templates.push({
      name: template.name,
      id: template.id,
      versions: [
        {
          id: version.id,
          path,
          data
        }
      ]
    });
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2));
    console.log(chalk.green('Template attached!'));
    console.log(chalk.bold.green(`Template ID: ${chalk.bold.cyan(template.id)}`));
    console.log(chalk.bold.green(`Template Version ID: ${chalk.bold.cyan(version.id)}`));
  })
}

module.exports = aattachTemplateFn;
