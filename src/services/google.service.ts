import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

export class GoogleService {
  private auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  public sheets = google.sheets({ version: 'v4', auth: this.auth });
}
