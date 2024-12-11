const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: YOUR_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export const getEmailsWithQR = async () => {
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'has:attachment filename:qr',
    });
    const messages = res.data.messages;
    if (messages.length) {
      const qrCodes = [];
      for (const message of messages) {
        const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
        const qrCode = extractQrCodeFromMessage(msg.data);
        if (qrCode) {
          qrCodes.push({ id: message.id, qrCode });
        }
      }
      return qrCodes;
    } else {
      console.log('No messages found.');
      return [];
    }
  } catch (err) {
    console.log('The API returned an error: ' + err);
    return [];
  }
};

const extractQrCodeFromMessage = (message) => {
  // Implement logic to extract QR code from the email message
  return 'sample-qr-code-data';
};