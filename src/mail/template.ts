var fs = require('fs');
const Hogan = require('hogan.js');

import { sendMail } from './mail';

export const emailTemplates = {
  bookingMail: 'booking_mail',
};

const PATH_TO_TEMPLATES = './src/mail/email/';
const templates = Object.keys(emailTemplates).reduce((a, t) => {
  a[emailTemplates[t]] = Hogan.compile(
    fs
      .readFileSync(`${PATH_TO_TEMPLATES}${emailTemplates[t]}.html`)
      .toString(),
  );
  return a;
}, {});

// Booking Mail
export async function bookingMail({ email, name, service, status }) {
  const template = templates[emailTemplates.bookingMail];

  const templateStringValues = {
    email,
    name,
    service,
    status,
    subject: `Your booking has been ${status}`,
  };

  return sendMail(email, template, templateStringValues);
}
