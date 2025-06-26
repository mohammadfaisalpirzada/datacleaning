import { google } from 'googleapis';

const SHEET_ID = '1I1I52MWDQBgx5lkut4nioZvAmOPIW9Im';
const SHEET_NAME = 'Sheet1'; // Change if your tab is named differently

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export default async function handler(req, res) {
  const auth = await getAuth().getClient();
  const sheets = google.sheets({ version: 'v4', auth });

  if (req.method === 'GET') {
    // Read all data
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });
    return res.status(200).json({ data: result.data.values });
  }

  if (req.method === 'POST') {
    // Update a row by PID
    const { PID, ...updateData } = req.body;
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });
    const rows = getRows.data.values;
    const header = rows[0];
    const pidIndex = header.indexOf('PID');
    const rowIndex = rows.findIndex(row => row[pidIndex] === PID);

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'PID not found' });
    }

    // Prepare updated row
    const updatedRow = header.map(col => updateData[col] ?? rows[rowIndex][header.indexOf(col)]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] },
    });

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}