"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === "Admin" && pass === "nishtarroad") {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 rounded shadow">
        <img src="/logo.png" alt="School Logo" className="mx-auto mb-2 w-16 h-16 object-contain" />
        <h2 className="text-lg font-bold text-blue-900 mb-4 text-center">GGSS Nishtar Road, Khi</h2>
        <h1 className="text-xl font-bold text-center mb-4 text-blue-900">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto">
          <input
            className="border px-3 py-2 rounded"
            placeholder="User ID"
            value={user}
            onChange={e => setUser(e.target.value)}
            required
          />
          <input
            className="border px-3 py-2 rounded"
            placeholder="Password"
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-xs">{error}</div>}
          <button type="submit" className="bg-blue-700 text-white py-2 rounded mt-2">Login</button>
        </form>
      </div>
      <Footer />
    </main>
  );
}
