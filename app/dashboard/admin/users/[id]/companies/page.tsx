"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { fetchEventSource } from "@microsoft/fetch-event-source";

interface Company {
  id: number;
  name: string;
  noOfUsers?: number;
  noOfProducts?: number;
  percentage?: number;
  createdById: number;
  createdAt?: string;
  [key: string]: unknown;
}

interface PagedResponse {
  items: Company[];
  nextOffset: number | null;
  prevOffset: number | null;
}

export default function UserCompaniesPage() {
  const { id } = useParams<{ id: string }>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [prevOffset, setPrevOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const isFirstPage = useRef(true);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchCompanies = useCallback(
    async (offset?: number | null) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          createdById: id,
          limit: "10",
        });
        if (offset != null) params.set("offset", String(offset));
        const res: PagedResponse = await apiFetch(`/companies?${params}`);
        setCompanies(res.items);
        setNextOffset(res.nextOffset);
        setPrevOffset(res.prevOffset);
        isFirstPage.current = !offset;
        setHasNewUpdates(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load companies");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const ctrl = new AbortController();

    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      await fetchEventSource(`${apiUrl}/companies/${id}/inputs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: ctrl.signal,

        onmessage(event) {
          try {
            const payload = JSON.parse(event.data);
            const company: Company = payload;

            if (String(payload.createdById) !== id) return;

            const atTop = listRef.current ? listRef.current.scrollTop === 0 : true;

            if (isFirstPage.current && atTop) {
              setCompanies((prev) => {
                const filtered = prev.filter((c) => c.id !== company.id);
                const hasNextPage = filtered.length > 10;
                const result = [company, ...filtered].slice(0, 10);
                if (hasNextPage) {
                  setNextOffset(10);
                }
                return result;
              });
            } else {
              setHasNewUpdates(true);
            }
          } catch {}
        },

        onerror(err) {
          console.error("SSE error", err);
          throw err;
        },
      });
    };

    connect();

    return () => {
      ctrl.abort();
    };
  }, [id]);

  const handleReload = () => {
    fetchCompanies();
    if (listRef.current) listRef.current.scrollTop = 0;
  };

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Companies for User #{id}</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {hasNewUpdates && (
        <button
          onClick={handleReload}
          className="mb-3 px-3 py-1 bg-black text-white text-sm rounded"
        >
          New updates available — click to reload
        </button>
      )}

      <div ref={listRef} className="max-h-[70vh] overflow-auto">
        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : companies.length === 0 ? (
          <p className="text-sm">No companies found.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Users</th>
                <th className="py-2">Products</th>
                <th className="py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{c.id}</td>
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4">{c.noOfUsers ?? "—"}</td>
                  <td className="py-2 pr-4">{c.noOfProducts ?? "—"}</td>
                  <td className="py-2">{c.percentage ? c.percentage + "%" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          disabled={prevOffset == null}
          onClick={() => fetchCompanies(prevOffset)}
          className="text-sm underline disabled:opacity-30"
        >
          Previous
        </button>
        <button
          disabled={nextOffset == null}
          onClick={() => fetchCompanies(nextOffset)}
          className="text-sm underline disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
