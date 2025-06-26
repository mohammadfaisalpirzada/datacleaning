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
    const { rowIndex } = req.body;
    const auth = await getAuth();
    const client = await auth.getClient() as JWT;
    const sheets = google.sheets({ version: 'v4', auth: client });
    // Delete the row (rowIndex is 1-based in the UI, but 0-based in API, and first row is header)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Usually 0 for first sheet, but should be dynamic if multiple sheets
                dimension: 'ROWS',
                startIndex: rowIndex, // rowIndex is already 1-based for data (header is 0)
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Google Sheets API error:', err);
    res.status(500).json({ error: 'Google Sheets API error', details: String(err) });
  }
}
