#!/usr/bin/env node
var program = require('commander');

var initCmd = require('../lib/commands/init');
var createTemplateCmd = require('../lib/commands/create-template');
var attachTemplateCmd = require('../lib/commands/attach-template');
var createVersionCmd = require('../lib/commands/create-version');
var updateVersionCmd = require('../lib/commands/update-version');

var {
  listLocalFn,
  listFetchedFn
} = require('../lib/commands/list');

program.command('init').action(() => initCmd());

program.command('list')
  .alias('l')
  .description('List all templates')
  .option('-l, --local', 'list locally installed templates only')
  .action((cmd) => cmd.local ? listLocalFn() : listFetchedFn());

program.command('template-create <templateName>')
  .alias('tc')
  .description('Add new template to sendgrid')
  .option('-p, --path <path>', 'path to template')
  .option('-s, --subject <subject>', 'Email subject')
  .option('-d, --data [data]', 'path to test data')
  .action((templateName, cmd) => createTemplateCmd(templateName, cmd.path, cmd.subject, cmd.data))

program.command('template-attach <templateId>')
  .alias('ta')
  .description('Attach local files to existent sendgrid template')
  .option('-p, --path <path>', 'path to template')
  .option('-s, --subject <subject>', 'Email subject')
  .option('-d, --data [data]', 'path to test data')
  .option('-v, --version [verisonId]', 'update a specific version of template (when empty new version would be created)')
  .action((templateId, cmd) => attachTemplateCmd(templateId, cmd.path, cmd.subject, cmd.data, cmd.verisonId))

program.command('version-create <templateId>')
  .alias('vc')
  .description('create a new version for specific template')
  .option('-p, --path <path>', 'path to template')
  .option('-s, --subject <subject>', 'Email subject')
  .option('-d, --data [data]', 'path to test data')
  .action((templateId, cmd) => createVersionCmd(templateId, cmd.path, cmd.subject, cmd.data))

program.command('version-update <templateId> <versionId>')
  .alias('vu')
  .description('create a new version for specific template')
  .option('-p, --path <path>', 'path to template')
  .option('-s, --subject <subject>', 'Email subject')
  .option('-d, --data [data]', 'path to test data')
  .action((templateId, versionId, cmd) => updateVersionCmd(templateId, versionId, cmd.path, cmd.subject, cmd.data))

program.parse(process.argv);
