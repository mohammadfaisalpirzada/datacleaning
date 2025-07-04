"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Footer from "@/components/Footer";

type StaffRow = Record<string, string>;

export default function StaffPage() {
  const [pid, setPid] = useState("");
  const [staffList, setStaffList] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [data, setData] = useState<StaffRow | null>(null);
  const [editData, setEditData] = useState<StaffRow | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [step, setStep] = useState<"select" | "pid" | "view">("select");
  const [exited, setExited] = useState(false);

  useEffect(() => {
    // Fetch staff names on mount
    fetch("/api/staffdata")
      .then((res) => res.json())
      .then((json) => {
        const rows: string[][] = json.data;
        const header = rows[0];
        const nameIndex = header.indexOf("Name of employee");
        const names = rows
          .slice(1)
          .map((row) => row[nameIndex])
          .filter(Boolean);
        setStaffList(names);
      });
  }, []);

  const handleNameSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedName(e.target.value);
    setError("");
    setSuccess("");
    setPid("");
    setData(null);
    setEditData(null);
    setEditMode(false);
    if (e.target.value) setStep("pid");
  };

  const handlePidSubmit = async (e: FormEvent) => {
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
      const rows: string[][] = json.data;
      const header = rows[0];
      const nameIndex = header.indexOf("Name of employee");
      const pidIndex = header.indexOf("PID");
      const rowIndex = rows.findIndex(
        (row) => row[nameIndex] === selectedName && row[pidIndex] === pid
      );
      if (rowIndex === -1) {
        setError("PID does not match for selected name.");
        setLoading(false);
        return;
      }
      const row = rows[rowIndex];
      const rowObj: StaffRow = {};
      header.forEach((col, i) => (rowObj[col] = row[i]));
      setData(rowObj);
      setEditData({ ...rowObj });
      setStep("view");
    } catch {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const handleEditChange = (key: string, value: string) => {
    if (editData) setEditData({ ...editData, [key]: value });
  };

  const handleEditSubmit = async (e: FormEvent) => {
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
    } catch {
      setError("Failed to update data.");
    }
    setLoading(false);
  };

  if (exited) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm bg-white p-4 rounded shadow text-center">
          <img
            src="/logo.png"
            alt="School Logo"
            className="mx-auto mb-2 w-20 h-20 object-contain"
          />
          <h2 className="text-lg font-bold text-blue-900 mb-1">
            GGSS Nishtar Road, Khi
          </h2>
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Bye bye!</h1>
          <p className="text-blue-700">
            Thank you for using the Staff Data Lookup.
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-gray-100">
      <div className="w-full max-w-sm bg-white p-4 rounded shadow mt-2 mb-24">
        <img
          src="/logo.png"
          alt="School Logo"
          className="mx-auto mb-2 w-20 h-20 object-contain"
        />
        <h2 className="text-lg font-bold text-blue-900 mb-4 text-center">
          GGSS Nishtar Road, Khi
        </h2>
        <h1 className="text-xl font-bold text-center mb-4 text-blue-900">
          Staff Data Lookup
        </h1>
        {selectedName && step !== "select" && (
          <div className="mb-4 text-center">
            <span className="font-semibold text-blue-900">Selected Name: </span>
            <span className="text-black">{selectedName}</span>
          </div>
        )}
        {step === "select" && (
          <form className="mb-4 flex flex-col gap-2">
            <label
              htmlFor="staff-select"
              className="font-semibold text-blue-900"
            >
              Select Staff Name
            </label>
            <select
              id="staff-select"
              className="border px-3 py-2 rounded"
              value={selectedName}
              onChange={handleNameSelect}
            >
              <option value="">Select Staff Name</option>
              {staffList.map((name, i) => (
                <option key={i} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-red-600 underline mt-2"
              onClick={() => setExited(true)}
            >
              Exit
            </button>
          </form>
        )}
        {step === "pid" && (
          <form
            onSubmit={handlePidSubmit}
            className="mb-4 flex flex-col gap-2"
          >
            <label htmlFor="pid" className="font-semibold text-blue-900">
              Enter your PID
            </label>
            <input
              id="pid"
              type="text"
              className="border px-3 py-2 rounded"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              required
              placeholder="Enter PID"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white py-2 rounded mt-2"
              disabled={loading}
            >
              {loading ? "Checking..." : "View My Data"}
            </button>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => setStep("select")}
              >
                Back
              </button>
              <button
                type="button"
                className="text-red-600 underline"
                onClick={() => setExited(true)}
              >
                Exit
              </button>
            </div>
          </form>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {step === "view" && data && !editMode && (
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
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => setStep("select")}
              >
                Back
              </button>
              <button
                type="button"
                className="text-red-600 underline"
                onClick={() => setExited(true)}
              >
                Exit
              </button>
            </div>
          </div>
        )}
        {editMode && editData && (
          <form onSubmit={handleEditSubmit} className="space-y-2 mt-4">
            <div className="font-semibold mb-2 text-blue-900">Edit Your Data</div>
            {Object.entries(editData).map(([key, val], i) => (
              <div key={i} className="mb-2">
                <label className="block text-blue-900 font-medium mb-1">
                  {key}
                </label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={val ? String(val) : ""}
                  onChange={(e) => handleEditChange(key, e.target.value)}
                  disabled={key === "PID" || key === "Name of employee"}
                  placeholder={key}
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
              <button
                type="button"
                className="text-red-600 underline"
                onClick={() => setExited(true)}
              >
                Exit
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </main>
  );
}
