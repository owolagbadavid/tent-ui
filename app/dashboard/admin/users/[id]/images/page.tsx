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
}

export default function UserImagesPage() {
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<Image[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingImageId, setLoadingImageId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const didFetch = useRef(false);

  const handleViewImage = async (image: Image) => {
    setLoadingImageId(image.id);
    const res = await apiFetch<Image>(`/users/${id}/images/${image.id}`).finally(() =>
      setLoadingImageId(null),
    );

    const a = document.createElement("a");
    a.href = res.url;
    a.target = "_blank";
    a.click();
  };

  const fetchImages = useCallback(
    async (offset?: number | null) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          limit: "10",
        });
        if (offset != null) params.set("offset", String(offset));
        const res: PagedResponse = await apiFetch(`/users/${id}/images?${params}`);
        setImages((c) => [...c, ...res.items]);
        setNextCursor(res.nextCursor);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    fetchImages();
  }, [id]);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Images for User #{id}</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div ref={listRef} className="max-h-[70vh] overflow-auto">
        {images.length === 0 ? (
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
                      disabled={loadingImageId === c.id}
                      className="underline disabled:cursor-not-allowed cursor-pointer!"
                      onClick={() => handleViewImage(c)}
                    >
                      {loadingImageId === c.id ? "Loading..." : "View"}
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
          disabled={nextCursor == null || loading}
          onClick={() => fetchImages(nextCursor)}
          className="text-sm underline disabled:opacity-30"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
