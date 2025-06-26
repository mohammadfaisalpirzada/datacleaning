"use client";
import React, { useState } from "react";

export default function StaffPage() {
  const [pid, setPid] = useState("");
  const [data, setData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setData(null);
    setEditData(null);
    setEditMode(false);
    try {
      const res = await fetch("/api/staffdata");
      const json = await res.json();
      const rows = json.data;
      const header = rows[0];
      const pidIndex = header.indexOf("PID");
      const rowIndex = rows.findIndex((row: any) => row[pidIndex] === pid);
      if (rowIndex === -1) {
        setError("PID not found.");
        setLoading(false);
        return;
      }
      const row = rows[rowIndex];
      const rowObj: any = {};
      header.forEach((col: string, i: number) => (rowObj[col] = row[i]));
      setData(rowObj);
      setEditData({ ...rowObj });
    } catch (err) {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const handleEditChange = (key: string, value: string) => {
    setEditData({ ...editData, [key]: value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/staffdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setData(editData);
        setSuccess("Data updated successfully!");
        setEditMode(false);
      } else {
        setError("Failed to update data.");
      }
    } catch (err) {
      setError("Failed to update data.");
    }
    setLoading(false);
  };

  return (
    <main className="p-4 min-h-screen bg-gray-100 text-sm flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold text-center mb-6 text-blue-900">
          Staff Data Lookup
        </h1>
        <form
          onSubmit={handleSearch}
          className="mb-4 flex flex-col gap-2"
        >
          <label
            htmlFor="pid"
            className="font-semibold text-blue-900"
          >
            Enter your PID
          </label>
          <input
            id="pid"
            type="text"
            className="border px-3 py-2 rounded"
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-700 text-white py-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Searching..." : "View My Data"}
          </button>
        </form>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {data && !editMode && (
          <div className="space-y-2">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-blue-900">Your Data</span>
              <button
                className="text-blue-600 underline"
                onClick={() => setEditMode(true)}
                type="button"
              >
                Edit
              </button>
            </div>
            {Object.entries(data).map(([key, val], i) => (
              <div key={i} className="flex flex-col mb-1">
                <span className="font-semibold text-blue-900">{key}</span>
                <span className="text-black">{val ? String(val) : "N/A"}</span>
              </div>
            ))}
          </div>
        )}
        {editMode && editData && (
          <form
            onSubmit={handleEditSubmit}
            className="space-y-2 mt-4"
          >
            <div className="font-semibold mb-2 text-blue-900">
              Edit Your Data
            </div>
            {Object.entries(editData).map(([key, val], i) => (
              <div key={i} className="mb-2">
                <label className="block text-blue-900 font-medium mb-1">
                  {key}
                </label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={val ? String(val) : ""}
                  onChange={(e) => handleEditChange(key, e.target.value)}
                  disabled={key === "PID"}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
