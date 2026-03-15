"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function WorkerDashboard() {
  const [name, setName] = useState("");
  const [noOfUsers, setNoOfUsers] = useState("");
  const [noOfProducts, setNoOfProducts] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { name };
      if (noOfUsers) body.noOfUsers = Number(noOfUsers);
      if (noOfProducts) body.noOfProducts = Number(noOfProducts);
      await apiFetch("/companies", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setName("");
      setNoOfUsers("");
      setNoOfProducts("");
      setSuccess("Company submitted successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-semibold mb-4">Submit Company Details</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && <p className="text-green-700 text-sm mb-3">{success}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-1 text-sm">Company Name *</label>
        <input
          type="text"
          required
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm"
        />
        <label className="block mb-1 text-sm">Number of Users</label>
        <input
          type="number"
          min={0}
          value={noOfUsers}
          onChange={(e) => setNoOfUsers(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm"
        />
        <label className="block mb-1 text-sm">Number of Products</label>
        <input
          type="number"
          min={0}
          value={noOfProducts}
          onChange={(e) => setNoOfProducts(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
        />

        <label className="block mb-1 text-sm">Percentage</label>
        <input
          type="text"
          disabled
          min={0}
          value={
            noOfUsers && noOfProducts
              ? parseFloat(((Number(noOfProducts) / Number(noOfUsers)) * 100).toFixed(2)) + " %"
              : ""
          }
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded text-sm disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
