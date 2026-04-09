'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type ShortUrlItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  visitCount: number;
  createdAt: string;
  lastVisitedAt: string | null;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [items, setItems] = useState<ShortUrlItem[]>([]);
  const [createdItem, setCreatedItem] = useState<ShortUrlItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');

  async function fetchUrls() {
    try {
      setLoadingList(true);
      const response = await api.get('/api/urls');
      setItems(response.data);
    } catch {
      setError('Failed to load URLs.');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCreatedItem(null);
    setLoading(true);

    try {
      const response = await api.post('/api/urls', { url });
      setCreatedItem(response.data);
      setUrl('');
      await fetchUrls();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to create the shortened URL.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">URL Shortener</h1>
          <p className="mt-2 text-slate-600">
            Create short links, redirect users, and track visit counts.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-700">
              Long URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/blog/1234"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-xl border px-4 py-3 outline-none ring-0 focus:border-slate-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create short URL'}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {createdItem && (
            <div className="mt-6 rounded-xl bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Short URL created successfully
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a
                  href={createdItem.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {createdItem.shortUrl}
                </a>
                <button
                  onClick={() => handleCopy(createdItem.shortUrl)}
                  className="rounded-lg border px-3 py-1 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">All shortened URLs</h2>
            <button
              onClick={fetchUrls}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Refresh
            </button>
          </div>

          {loadingList ? (
            <p className="text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-500">No URLs created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="pr-4">Short URL</th>
                    <th className="pr-4">Original URL</th>
                    <th className="pr-4">Visits</th>
                    <th className="pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="bg-slate-50">
                      <td className="rounded-l-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={item.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            {item.shortCode}
                          </a>
                          <button
                            onClick={() => handleCopy(item.shortUrl)}
                            className="rounded border px-2 py-1 text-xs"
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td className="max-w-md truncate px-4 py-3">
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-700 underline"
                          title={item.originalUrl}
                        >
                          {item.originalUrl}
                        </a>
                      </td>
                      <td className="px-4 py-3">{item.visitCount}</td>
                      <td className="rounded-r-xl px-4 py-3">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}