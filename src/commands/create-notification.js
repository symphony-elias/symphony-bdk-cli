import chalk from "chalk";
import {
  getAnwsers,
  NOTIFICATION_CUSTOM_OPTIONS,
  NOTIFICATION_TEMPLATE_OPTIONS,
} from "../questions/create-notification";
import fs from 'fs';
import ReplaceInFiles from 'replace-in-files';
import {
  simpleTemplateEntity,
  simpleTemplateEnricher,
  informationTemplateEntity,
  informationTemplateEnricher,
  listTemplateEntity,
  listTemplateEnricher,
  tableTemplateEntity,
  tableTemplateEnricher,
  alertTemplateEntity,
  alertTemplateEnricher,
  notificationTemplateEntity,
  notificationTemplateEnricher,
  customNewTemplateEntity,
  customNewTemplateEnricher,
  customNewTemplateHbs,
  customAlertTemplateEntity,
  customAlertTemplateEnricher,
  customAlertTemplateHbs,
  customInformationTemplateEntity,
  customInformationTemplateEnricher,
  customInformationTemplateHbs,
  customImport,
  customNames,
  customTemplates,
} from "../assets/notifications";
import { spinnerStart, spinnerError, spinnerStop} from "../../utils/spinner";

const getFiles = (extAppPath) => {
  return [
      `${extAppPath}/extension-app/services/enrichers/entities.js`,
      `${extAppPath}/extension-app/services/enrichers/general-enricher.js`,
      `${extAppPath}/extension-app/services/enrichers/templates/components`,
  ];
};

const createNotification = async (options) => {
  console.log(chalk.bold(
    'This tool will guide you through the process of adding a new notification'
  ));
  const awnsers = await getAnwsers(options);

  const extensionAppRoot = options.cwd;
  const validationJsonPath = `${extensionAppRoot}/package.json`;
    spinnerStart('Generating Notifications!\n');

  try {
    const validationJsonBuffer = fs.readFileSync(validationJsonPath);
    const packageJson = JSON.parse(validationJsonBuffer);

    if(!packageJson.dependencies['sms-dev-tool-mock-client']) {
      throw new Error('e');
    }

    const files = getFiles(extensionAppRoot);

    const notificationEntityOption = {
      files: [ files[0] ],
      from: /export const ENRICHER_EVENTS = {/,
      to: null,
    };

    const notificationEnricher = {
      files: [ files[1] ],
      from: new RegExp('default:'),
      to: null,
    };


    if (awnsers.custom) {
      const hbsFile = `${files[2]}/${awnsers.notificationName.toLowerCase()}.hbs`;

       const notificationCustomNameEnricher = {
        files: [ files[1] ],
        from: new RegExp(/const CUSTOM_TEMPLATE_NAMES = {/),
        to: customNames(awnsers.notificationName),
      };

       const notificationCustomTemplate = {
        files: [ files[1] ],
        from: new RegExp(/const customTemplates = {/),
        to: customTemplates(awnsers.notificationName),
      };

      const notificationCustomImport = {
        files: [ files[1] ],
        from: new RegExp(/\/\* global SYMPHONY \*\//),
        to: customImport(awnsers.notificationName),
      };

      switch (awnsers.custom) {
        case NOTIFICATION_CUSTOM_OPTIONS.NEW_TEMPLATE:
          notificationEntityOption.to = customNewTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = customNewTemplateEnricher(awnsers.notificationName);
          fs.writeFileSync(hbsFile, customNewTemplateHbs);
          break;
        case NOTIFICATION_CUSTOM_OPTIONS.ALERT:
          notificationEntityOption.to = customAlertTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = customAlertTemplateEnricher(awnsers.notificationName);
          fs.writeFileSync(hbsFile, customAlertTemplateHbs);
          break;
        case NOTIFICATION_CUSTOM_OPTIONS.INFORMATION:
          notificationEntityOption.to = customInformationTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = customInformationTemplateEnricher(awnsers.notificationName);
          fs.writeFileSync(hbsFile, customInformationTemplateHbs);
          break;
      };

      await ReplaceInFiles(notificationCustomNameEnricher);
      await ReplaceInFiles(notificationCustomTemplate);
      await ReplaceInFiles(notificationCustomImport);
    }

    if (awnsers.template) {
      switch (awnsers.template) {
        case NOTIFICATION_TEMPLATE_OPTIONS.SIMPLE:
          notificationEntityOption.to = simpleTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = simpleTemplateEnricher(awnsers.notificationName);
          break;
        case NOTIFICATION_TEMPLATE_OPTIONS.ALERT:
          notificationEntityOption.to = alertTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = alertTemplateEnricher(awnsers.notificationName);
          break;
        case NOTIFICATION_TEMPLATE_OPTIONS.NOTIFICATION:
          notificationEntityOption.to = notificationTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = notificationTemplateEnricher(awnsers.notificationName);
          break;
        case NOTIFICATION_TEMPLATE_OPTIONS.INFORMATION:
          notificationEntityOption.to = informationTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = informationTemplateEnricher(awnsers.notificationName);
          break;
        case NOTIFICATION_TEMPLATE_OPTIONS.TABLE:
          notificationEntityOption.to = tableTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = tableTemplateEnricher(awnsers.notificationName);
          break;
        case NOTIFICATION_TEMPLATE_OPTIONS.LIST:
          notificationEntityOption.to = listTemplateEntity(awnsers.notificationName);
          notificationEnricher.to = listTemplateEnricher(awnsers.notificationName);
          break;
      };
    }

    await ReplaceInFiles(notificationEntityOption);
    await ReplaceInFiles(notificationEnricher);
    spinnerStop(chalk.bold('Notification ') + chalk.green.bold('Installed'));
  }catch (e) {
    spinnerError('Error');
    console.log(chalk.bold('please mare sure you`re within an extension app folder, error: ', e));
  }
};

export default createNotification;