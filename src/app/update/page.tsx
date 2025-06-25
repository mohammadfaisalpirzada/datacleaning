'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Define the type for a teacher row
type Teacher = {
  [key: string]: string | number | null | undefined;
};

export default function UpdatePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [details, setDetails] = useState<Teacher | null>(null);
  const [editData, setEditData] = useState<Teacher | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchExcel = async () => {
      const res = await fetch('/data/staffdata.xlsx');
      const arrayBuffer = await res.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: Teacher[] = XLSX.utils.sheet_to_json(worksheet);
      setTeachers(jsonData);
    };
    fetchExcel();
  }, []);

  const handleSelect = (name: string) => {
    setSelectedName(name);
    const found = teachers.find(t => t['Name of employee'] === name);
    setDetails(found || null);
    setEditData(found ? { ...found } : null);
    setEditMode(false);
    setSuccessMsg('');
  };

  const handleEditChange = (key: string, value: string) => {
    if (editData) {
      setEditData({ ...editData, [key]: value });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);
    setSuccessMsg('Saving...');
    try {
      const res = await fetch('/api/update-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setDetails(editData);
        setSuccessMsg('Data updated successfully!');
      } else {
        setSuccessMsg('Failed to update data.');
      }
    } catch (err) {
      setSuccessMsg('Error updating data.');
    }
  };

  return (
    <main className="p-4 min-h-screen bg-gray-100 text-sm">
      <div className="flex flex-col items-center mb-4">
        <img src="/logo.png" alt="Logo" className="h-12 w-12 mb-2" />
        <h1 className="text-center text-xl font-bold mb-6">Update Teacher Data</h1>
      </div>
      <div className="max-w-lg mx-auto bg-white p-4 rounded shadow">
        <div className="mb-4">
          <label htmlFor="staff-select" className="font-semibold mb-2 block">Select Staff Name</label>
          <select
            id="staff-select"
            className="w-full border px-3 py-2 rounded mb-2"
            value={selectedName}
            onChange={e => handleSelect(e.target.value)}
          >
            <option value="">Select Staff Name</option>
            {teachers.map((t, i) => (
              <option key={i} value={String(t['Name of employee'] || '')}>
                {t['Name of employee']}
              </option>
            ))}
          </select>
        </div>
        {details && editData && !editMode && (
          <div className="space-y-2">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Your Data</span>
              <button className="text-blue-600 underline" onClick={() => setEditMode(true)}>Edit</button>
            </div>
            {Object.entries(details).map(([key, val], i) => (
              <div key={i} className="flex flex-col mb-1">
                <span className="font-semibold text-gray-700">{key}</span>
                <span className="text-gray-900">{val ? String(val) : 'N/A'}</span>
              </div>
            ))}
            {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
          </div>
        )}
        {editMode && editData && (
          <form onSubmit={handleEditSubmit} className="space-y-2">
            <div className="font-semibold mb-2">Edit Your Data</div>
            {Object.entries(editData).map(([key, val], i) => (
              <div key={i} className="mb-2">
                <label className="block text-gray-700 font-medium mb-1">{key}</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={val ? String(val) : ''}
                  onChange={e => handleEditChange(key, e.target.value)}
                  disabled={key === 'Name of employee' || key === 'PID'}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
