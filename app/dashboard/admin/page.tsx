"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface UserItem {
  id: number;
  uid: string;
  role: string;
  [key: string]: unknown;
}

interface PagedResponse {
  items: UserItem[];
  nextOffset: number | null;
  prevOffset: number | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [prevOffset, setPrevOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async (cursor?: number | null) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ role: "worker", limit: "10" });
      if (cursor != null) params.set("cursor", String(cursor));
      const res: PagedResponse = await apiFetch(`/users?${params}`);
      setUsers(res.items);
      setNextOffset(res.nextOffset);
      setPrevOffset(res.prevOffset);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUploadClick = (userId: number) => {
    setUploadingId(userId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingId == null) return;
    try {
      const form = new FormData();
      form.append("file", file);
      await apiFetch(`/users/${uploadingId}/image`, {
        method: "POST",
        body: form,
      });
      alert("Image uploaded.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Workers</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {loading ? (
        <p className="text-sm">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm">No workers found.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">UID</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-2 pr-4">{u.id}</td>
                <td className="py-2 pr-4 font-mono text-xs">{u.uid}</td>
                <td className="py-2 flex gap-2">
                  <Link href={`/dashboard/admin/users/${u.id}/companies`} className="underline">
                    View Inputs
                  </Link>
                  <button onClick={() => handleUploadClick(u.id)} className="underline">
                    Upload Image
                  </button>
                  <Link href={`/dashboard/admin/users/${u.id}/images`} className="underline">
                    View Images
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex gap-4 mt-4">
        <button
          disabled={prevOffset == null}
          onClick={() => fetchUsers(prevOffset)}
          className="text-sm underline disabled:opacity-30"
        >
          Previous
        </button>
        <button
          disabled={nextOffset == null}
          onClick={() => fetchUsers(nextOffset)}
          className="text-sm underline disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
