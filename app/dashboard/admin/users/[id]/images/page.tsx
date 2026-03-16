"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Image {
  id: number;
  url: string;
  userId: number;
  createdById: number;
  [key: string]: unknown;
}

interface PagedResponse {
  items: Image[];
  nextCursor: number | null;
  prevCursor: number | null;
}

export default function UserImagesPage() {
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<Image[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [prevCursor, setPrevCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const currentCursor = useRef<number | null>(null);

  const fetchImages = useCallback(
    async (cursor?: number | null, direction?: "next" | "prev") => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          limit: "10",
        });
        if (cursor != null) params.set("cursor", String(cursor));
        if (direction) params.set("direction", direction);
        const res: PagedResponse = await apiFetch(`/users/${id}/images?${params}`);
        setImages(res.items);
        setNextCursor(res.nextCursor);
        setPrevCursor(res.prevCursor);
        currentCursor.current = cursor ?? null;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Images for User #{id}</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div ref={listRef} className="max-h-[70vh] overflow-auto">
        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : images.length === 0 ? (
          <p className="text-sm">No images found.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">User ID</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {images.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{c.id}</td>
                  <td className="py-2 pr-4">{c.userId}</td>
                  <td className="py-2">
                    <button
                      disabled={loading}
                      className="underline disabled:cursor-not-allowed cursor-pointer!"
                      onClick={async () => {
                        setLoading(true);
                        const res = await apiFetch(`/users/${id}/images/${c.id}`).finally(() =>
                          setLoading(false),
                        );

                        const a = document.createElement("a");
                        a.href = res.url;
                        a.target = "_blank";
                        a.click();
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          disabled={prevCursor == null}
          onClick={() => fetchImages(prevCursor, "prev")}
          className="text-sm underline disabled:opacity-30"
        >
          Previous
        </button>
        <button
          disabled={nextCursor == null}
          onClick={() => fetchImages(nextCursor, "next")}
          className="text-sm underline disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
