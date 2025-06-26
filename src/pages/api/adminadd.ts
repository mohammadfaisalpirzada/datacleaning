import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SHEET_ID = '1ogh77JsKGtrfdfBmxdhNZnAxz8-nhTLcYCCWtZXmDnE';
const SHEET_NAME = 'Sheet1';

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const auth = await getAuth();
    const client = await auth.getClient() as JWT;
    const sheets = google.sheets({ version: 'v4', auth: client });
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });
    const rows = getRows.data.values;
    if (!rows) {
      return res.status(500).json({ error: 'No data found in sheet' });
    }
    const header = rows[0];
    const newRow = header.map(col => req.body[col] ?? '');
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Google Sheets API error:', err);
    res.status(500).json({ error: 'Google Sheets API error', details: String(err) });
  }
}
