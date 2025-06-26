import React from "react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-red-600 text-white text-center py-2 text-xs z-50">
      <div className="block sm:hidden">
        <div>MasterSahub, copyright © 2025 - 2026</div>
        <div>For building your projects, contact: 0345-8340669</div>
      </div>
      <div className="hidden sm:block">
        MasterSahub, copyright © 2025 - 2026 | For building your projects, contact: 0345-8340669
      </div>
    </footer>
  );
}
