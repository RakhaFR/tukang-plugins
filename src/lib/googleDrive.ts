import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '')
  .replace(/\\n/g, '\n')
  .replace(/"/g, '');

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

export const drive = google.drive({ version: 'v3', auth: auth as any });