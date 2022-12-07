import * as nodemailer from 'nodemailer';

import logger from '../util/logger';

import env from '../env';

var inlineCss = require('inline-css');

// bcc takes two types of arguments, one is array of strings, or a string seperated by comma
export async function sendMail(
  email,
  template,
  templateStringValues,
  bcc: [string] | string = '',
) {
  const mailBody = template.render({ ...templateStringValues });
  const htmlLinkHrefBasePath = `file://${__dirname.replace(
    'dist/',
    'src/',
  )}/email/`; // we can do in html template: <link rel="stylesheet" href="./css/header.css" />

  const bccEmailString = Array.isArray(bcc)
    ? bcc.join(', ')
    : bcc
    ? bcc
    : '';

  try {
    const html = await inlineCss(mailBody, {
      url: htmlLinkHrefBasePath,
    });
    await mail(
      email,
      templateStringValues.subject,
      html,
      bccEmailString,
    );
  } catch (err) {
    logger.info(
      `Error compiling css in email template. Subject: ${templateStringValues.subject} Error: ${err}`,
    );
    throw err;
  }
}

async function mail(
  to: string,
  subject: string,
  body: string,
  bcc: string = '',
) {
  let from = `Kristean Klean <${env.mailUser}>`;
  if (env.appEnv === 'dev' || env.appEnv === 'local') {
    from = `Kristean Klean ${env.appEnv} <${env.mailUser}>`;
  }

  if (
    env.mailTransporter === 'aws' ||
    env.mailTransporter === 'smtp2go'
  ) {
    from = 'Kristean Kelan <no-reply@kristeanklean.com>';
  }

  let transporter;
  switch (env.mailTransporter) {
    case 'smtp2go':
      transporter = nodemailer.createTransport({
        host: 'mail.smtp2go.com',
        port: 587,
        secure: false,
        auth: { user: env.mailUser, pass: env.mailPass },
      });
      break;
    case 'aws':
      transporter = nodemailer.createTransport({
        host: 'email-smtp.us-east-1.amazonaws.com',
        port: 587,
        secure: false,
        auth: { user: env.mailUser, pass: env.mailPass },
      });
      break;
    case 'gmail':
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: env.mailUser, pass: env.mailPass },
      });
      break;

    case 'etheral':
    default:
      const account = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      });
  }

  const mailOptions = {
    to,
    subject,
    from,
    bcc,
    html: body,
  };

  const info = await transporter.sendMail(mailOptions);

  logger.info(`Email sent to ${to} with subject ${subject}`);

  if (env.appEnv !== 'dev' && env.appEnv !== 'prod') {
    logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
