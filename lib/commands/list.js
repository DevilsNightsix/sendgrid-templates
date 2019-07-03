const fs = require("fs");
const chalk = require('chalk');
const sendGrid = require('@sendgrid/client');

const { configPath, apiKeyPath } = require('../defaults');

function printTemplates(templates) {
  templates.forEach((template, index) => {
    if (index === 0) {
      console.log("-".repeat(80));
    }
    console.log(
      chalk.bold('\nTemplate name:'), '\t', template.name,
      );
    console.log(
      chalk.bold('Template ID:'), '\t', template.id,
    );
    console.log(chalk.bold('Versions'));
    template.versions.forEach(version => {
      console.log(
        chalk.bold('\tVersion ID:'), '\t\t\t', version.id,
      );
      console.log(
        chalk.bold('\tTemplate path:'), '\t\t\t', version.path,
      );
      console.log(
        chalk.bold('\tTemplate test data path:'), '\t', version.data, '\n',
      );
    });
    console.log("-".repeat(80));
  });
}

function mergeTemplates(fetched, local) {
  return {
    ...fetched,
    versions: fetched.versions.map(v => {
      const lv = local.versions.find(l => l.id === v.id) || {};
      return { ...lv, ...v };
    })
  }
}

function mergeTemplatesFromSources(localTemplates, fetchedTemplates) {
  return fetchedTemplates.map(ft => {
    const local = localTemplates.find(lt => lt.id === ft.id);
    return local ? mergeTemplates(ft, local) : ft;
  });
}

function listLocalFn() {
  const config = JSON.parse(fs.readFileSync(configPath,  { encoding: 'utf-8' }));
  printTemplates(config.templates);
}

function listFetchedFn() {
  const key = fs.readFileSync(apiKeyPath, { encoding: 'utf-8'}).replace(/\r?\n|\r/g, '');
  sendGrid.setApiKey(key);
  sendGrid.request({
    method: 'GET',
    url: '/v3/templates?generations=dynamic'
  }).then(([_, { templates }]) => {
    const config = JSON.parse(fs.readFileSync(configPath,  { encoding: 'utf-8' }));
    printTemplates(
      mergeTemplatesFromSources(config.templates, templates)
    );
  });
}

module.exports = {
  listLocalFn,
  listFetchedFn
};
