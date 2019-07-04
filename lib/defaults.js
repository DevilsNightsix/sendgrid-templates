const sendGrid = require('@sendgrid/client');
const fs = require("fs");
const chalk = require('chalk');

const conf = {
  configPath: ".sendgrid-email.json",
  apiKeyPath: ".sendgrid-key"
};

const createTemplate = (templateName) => {
  const createRequest = {
    method: 'POST',
    url: '/v3/templates',
    body: {
      generation: "dynamic",
      name: templateName
    }
  };

  return () => sendGrid.request(createRequest)
    .then(([response, body]) => body)
    .catch((err) => {
      console.log(chalk.bold.red(err.body.error));
      process.exit(1);
    });
  ;
};

const createVersion = (templatePath, subject) => {
  const htmlContent = fs.readFileSync(templatePath,  { encoding: 'utf-8' });
  const createRequest = {
    method: 'POST',
    url: `/v3/templates/${template.id}/versions`,
    body: {
      active: 1,
      name: `${template.name}-version`,
      html_content: htmlContent,
      subject: subject,
      template_id: template.id
    }
  }
  return (template, _, count) => sendGrid.request(createRequest).then(([res, body]) => body).catch((error) => {
      console.log(chalk.bold.red(error));
      process.exit(1);
    });
  ;
};

const addTestDataToVersion = (dataPath) => {
  const testData = JSON.parse(fs.readFileSync(dataPath,  { encoding: 'utf-8' }));
  const request = {
    method: 'PATCH',
    url: `/v3/templates/${version.template_id}/versions/${version.id}`,
    body: {
      test_data: testData
    }
  };
  return (version, _, count) => sendGrid.request(request).then(() => version).catch((err) => {
    console.log(chalk.bold.red(err.body.error));
    process.exit(1);
  });
};

const fetchTemplate = (id) => {
  return () => sendGrid.request({
    method: 'GET',
    url: `/v3/templates/${id}`
  }).then(([_, body]) => body);
};

const updateVersion = (templateId, versionId, templatePath, dataPath, updates) => {
  const htmlContent = fs.readFileSync(templatePath,  { encoding: 'utf-8' });
  const testData = JSON.parse(fs.readFileSync(dataPath,  { encoding: 'utf-8' }));

  const body = updates;

  if (htmlContent) {
    body.html_content = htmlContent;
  }

  if(testData) {
    body.test_data = testData;
  }

  const request = {
    method: 'PATCH',
    url: `/v3/templates/${templateId}/versions/${versionId}`,
    body
  };
  return () => sendGrid.request(request).then(([_, version]) => version).catch((err) => {
    console.log(chalk.bold.red(err.body.error));
    process.exit(1);
  });
};

module.exports =  {
  ...conf,
  createTemplate,
  createVersion,
  addTestDataToVersion,
  fetchTemplate,
  updateVersion
};
