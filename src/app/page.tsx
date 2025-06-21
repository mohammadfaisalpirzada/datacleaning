'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Define the type for a teacher row
type Teacher = {
  [key: string]: string | number | null | undefined;
};

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [details, setDetails] = useState<Teacher | null>(null);

  useEffect(() => {
    const fetchExcel = async () => {
      const res = await fetch('/data/teachers.xlsx');
      const arrayBuffer = await res.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: Teacher[] = XLSX.utils.sheet_to_json(worksheet);
      console.log('Excel JSON Data:', jsonData); // Debug log
      setTeachers(jsonData);
    };

    fetchExcel();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedName(name);
    const found = teachers.find(t => t['Name of employee'] === name);
    setDetails(found || null);
  };

  return (
    <main className="p-4 min-h-screen bg-gray-100 text-sm">
      <div className="flex flex-col items-center mb-4">
        <img src="/logo.png" alt="Logo" className="h-12 w-12 mb-2" />
        <h1 className="text-center text-xl font-bold mb-6">
          Data Cleaning 19-06-2025
        </h1>
      </div>
      <div className="max-w-sm mx-auto bg-white p-4 rounded shadow">
        {teachers.length === 0 && (
          <div className="text-red-500 text-center mb-2">No teachers found. Please check the Excel file and column names.</div>
        )}
        <label htmlFor="teacher-select" className="sr-only">Select Teacher Name</label>
        <select
          id="teacher-select"
          onChange={handleSelect}
          value={selectedName}
          className="w-full border px-3 py-2 mb-4 rounded"
        >
          <option value="">Select Teacher Name</option>
          {teachers.map((t, i) => (
            <option key={i} value={String(t['Name of employee'] || '')}>
              {t['Name of employee']}
            </option>
          ))}
        </select>

        {details && (
          <div className="text-sm space-y-2">
            {Object.entries(details).map(([key, val], i) => (
              <div key={i} className="flex flex-col mb-1">
                <span className="font-semibold text-gray-700">{key}</span>
                <span className="text-gray-900">{val ? String(val) : 'N/A'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
