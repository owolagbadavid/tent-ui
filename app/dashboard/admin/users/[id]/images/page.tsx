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
  nextOffset: number | null;
  prevOffset: number | null;
}

export default function UserImagesPage() {
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<Image[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [prevOffset, setPrevOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const currentCursor = useRef<number | null>(null);

  const handleViewImage = async (image: Image) => {
    setImageLoading(true);
    const res = await apiFetch<Image>(`/users/${id}/images/${image.id}`).finally(() =>
      setImageLoading(false),
    );

    const a = document.createElement("a");
    a.href = res.url;
    a.target = "_blank";
    a.click();
  };

  const fetchImages = useCallback(
    async (cursor?: number | null) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          limit: "10",
        });
        if (cursor != null) params.set("cursor", String(cursor));
        const res: PagedResponse = await apiFetch(`/users/${id}/images?${params}`);
        setImages(res.items);
        setNextOffset(res.nextOffset);
        setPrevOffset(res.prevOffset);
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
                      disabled={imageLoading}
                      className="underline disabled:cursor-not-allowed cursor-pointer!"
                      onClick={() => handleViewImage(c)}
                    >
                      {imageLoading ? "Loading..." : "View"}
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
          disabled={prevOffset == null}
          onClick={() => fetchImages(prevOffset)}
          className="text-sm underline disabled:opacity-30"
        >
          Previous
        </button>
        <button
          disabled={nextOffset == null}
          onClick={() => fetchImages(nextOffset)}
          className="text-sm underline disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
