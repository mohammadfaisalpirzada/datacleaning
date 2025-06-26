"use client";
import React, { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";

// This is a simple admin dashboard for demonstration. In production, use proper authentication and API security.

export default function AdminDashboard() {
  const [staff, setStaff] = useState<string[][]>([]);
  const [header, setHeader] = useState<string[]>([]);
  const [editRow, setEditRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewRow, setViewRow] = useState<number | null>(null);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/staffdata")
      .then(res => res.json())
      .then(json => {
        setStaff(json.data);
        setHeader(json.data[0]);
      });
  }, []);

  const handleEdit = (idx: number) => {
    setEditRow(idx);
    const rowObj: Record<string, string> = {};
    header.forEach((col, i) => (rowObj[col] = staff[idx][i]));
    setEditData(rowObj);
    setError("");
    setSuccess("");
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleEditChange = (key: string, value: string) => {
    setEditData({ ...editData, [key]: value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/staffdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setSuccess("Data updated successfully!");
        setEditRow(null);
        // Refresh data
        const json = await fetch("/api/staffdata").then(r => r.json());
        setStaff(json.data);
      } else {
        setError("Failed to update data.");
      }
    } catch {
      setError("Failed to update data.");
    }
  };

  // For adding a new row (admin can add staff)
  const [addMode, setAddMode] = useState(false);
  const [newData, setNewData] = useState<Record<string, string>>({});
  const handleAdd = () => {
    setAddMode(true);
    const obj: Record<string, string> = {};
    header.forEach(col => (obj[col] = ""));
    setNewData(obj);
    setError("");
    setSuccess("");
  };
  const handleAddChange = (key: string, value: string) => {
    setNewData({ ...newData, [key]: value });
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      // Add new row to Google Sheet (append)
      const res = await fetch("/api/adminadd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (res.ok) {
        setSuccess("Staff added successfully!");
        setAddMode(false);
        // Refresh data
        const json = await fetch("/api/staffdata").then(r => r.json());
        setStaff(json.data);
      } else {
        setError("Failed to add staff.");
      }
    } catch {
      setError("Failed to add staff.");
    }
  };

  const handleRemove = async (idx: number) => {
    if (!window.confirm('Are you sure you want to remove this staff record?')) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/adminremove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex: idx }),
      });
      if (res.ok) {
        setSuccess("Staff removed successfully!");
        // Remove the row from local state immediately for instant feedback
        setStaff(prev => prev.filter((_, i) => i !== idx));
      } else {
        setError("Failed to remove staff.");
      }
    } catch {
      setError("Failed to remove staff.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-100 pb-24">
      <div className="w-full max-w-full bg-white p-2 sm:p-4 rounded shadow mt-2 mb-24 overflow-x-auto">
        <img src="/logo.png" alt="School Logo" className="mx-auto mb-2 w-16 h-16 object-contain" />
        <h2 className="text-lg font-bold text-blue-900 mb-4 text-center">GGSS Nishtar Road, Khi</h2>
        <h1 className="text-xl font-bold text-center mb-4 text-blue-900">Admin Dashboard</h1>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          onClick={handleAdd}
          disabled={addMode}
        >
          Add Staff
        </button>
        {addMode && (
          <form onSubmit={handleAddSubmit} className="mb-4 space-y-2">
            <div className="font-semibold mb-2 text-blue-900">Add New Staff</div>
            {header.map((col, i) => (
              <div key={i} className="mb-2">
                <label className="block text-blue-900 font-medium mb-1">{col}</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={newData[col] || ""}
                  onChange={e => handleAddChange(col, e.target.value)}
                  placeholder={col}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setAddMode(false)}>Cancel</button>
            </div>
          </form>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-200">Actions</th>
                {header.map((col, i) => (
                  <th key={i} className="border px-2 py-1 bg-gray-200 text-blue-900">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.slice(1).map((row, idx) => (
                <tr key={idx} className="border-b">
                  <td className="border px-2 py-1 flex flex-col gap-1 min-w-[80px]">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setViewRow(idx + 1)}
                    >
                      View
                    </button>
                    <button
                      className="text-blue-600 underline"
                      onClick={() => handleEdit(idx + 1)}
                      disabled={editRow === idx + 1}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 underline"
                      onClick={() => handleRemove(idx + 1)}
                    >
                      Remove
                    </button>
                  </td>
                  {header.map((col, i) => (
                    <td key={i} className="border px-2 py-1">{row[i]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* View Modal */}
        {viewRow && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div
              className="bg-white rounded shadow p-4 max-w-md w-full relative"
              onTouchStart={e => (touchStartX.current = e.touches[0].clientX)}
              onTouchEnd={e => {
                if (touchStartX.current !== null) {
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (dx > 50 && viewRow > 1) setViewRow(viewRow - 1); // swipe right
                  if (dx < -50 && viewRow < staff.length - 1) setViewRow(viewRow + 1); // swipe left
                  touchStartX.current = null;
                }
              }}
            >
              <h2 className="text-lg font-bold mb-2 text-blue-900">Staff Details</h2>
              <div className="space-y-1 mb-4">
                {header.map((col, i) => (
                  <div key={i} className="flex justify-between border-b pb-1">
                    <span className="font-semibold text-blue-900">{col}</span>
                    <span className="text-black">{staff[viewRow][i]}</span>
                  </div>
                ))}
              </div>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded w-full"
                onClick={() => setViewRow(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {editRow && (
          <form ref={editFormRef} onSubmit={handleEditSubmit} className="mb-4 space-y-2 mt-4">
            <div className="font-semibold mb-2 text-blue-900">Edit Staff Data</div>
            {header.map((col, i) => (
              <div key={i} className="mb-2">
                <label className="block text-blue-900 font-medium mb-1">{col}</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={editData[col] || ""}
                  onChange={e => handleEditChange(col, e.target.value)}
                  placeholder={col}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditRow(null)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </main>
  );
}
