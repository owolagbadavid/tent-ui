"use client";

import { useEffect, useRef, useState } from "react";
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
  nextCursor: number | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const didFetch = useRef(false);

  const fetchUsers = async (offset?: number | null) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ role: "worker", limit: "10" });
      if (offset != null) params.set("offset", String(offset));

      const res: PagedResponse = await apiFetch(`/users?${params}`);
      setUsers((c) => [...c, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    fetchUsers();
  }, []);

  const handleUploadClick = (userId: number) => {
    setUploadingId(userId);
    setSelectedFile(null);
  };

  const closeUploadModal = () => {
    if (isSubmittingUpload) return;
    setUploadingId(null);
    setSelectedFile(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || uploadingId == null) return;

    setIsSubmittingUpload(true);

    try {
      const form = new FormData();
      form.append("file", selectedFile);
      await apiFetch(`/users/${uploadingId}/image`, {
        method: "POST",
        body: form,
      });
      alert("Image uploaded.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsSubmittingUpload(false);
      setUploadingId(null);
      setSelectedFile(null);
    }
  };

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Workers</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {users.length === 0 ? (
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
          disabled={nextCursor == null}
          onClick={() => fetchUsers(nextCursor)}
          className="text-sm underline disabled:opacity-30"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>

      {uploadingId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-dialog-title"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <h2 id="upload-dialog-title" className="text-base font-semibold">
              Upload image for worker {uploadingId}
            </h2>
            <p className="mt-2 text-sm text-gray-600">Select an image, then confirm the upload.</p>

            <label className="mt-4 block text-sm font-medium text-gray-700">Image file</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isSubmittingUpload}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={!selectedFile || isSubmittingUpload}
                className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {isSubmittingUpload ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
