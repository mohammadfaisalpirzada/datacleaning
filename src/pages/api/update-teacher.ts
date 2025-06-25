import type { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'staffdata.xlsx');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const updatedTeacher = req.body;
    // Read workbook
    const workbook = XLSX.readFile(DATA_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Find and update the teacher by PID
    const idx = data.findIndex((t: any) => String(t['PID']) === String(updatedTeacher['PID']));
    if (idx === -1) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    data[idx] = updatedTeacher;

    // Write back to Excel
    const newWs = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = newWs;
    XLSX.writeFile(workbook, DATA_FILE);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update file', details: String(err) });
  }
}
