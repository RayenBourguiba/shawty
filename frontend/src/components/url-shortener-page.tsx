"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export type ShortUrlItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  visitCount: number;
  createdAt: string;
  lastVisitedAt: string | null;
};

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CopyButton({
  value,
  id,
  copiedId,
  onCopy,
}: {
  value: string;
  id: string;
  copiedId: string | null;
  onCopy: (value: string, id: string) => void;
}) {
  const isCopied = copiedId === id;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCopy(value, id);
      }}
      className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition ${
        isCopied
          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
      }`}
    >
      {isCopied ? "Copied" : "Copy"}
    </button>
  );
}

function getDisplayUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url;
  }
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function UrlShortenerPage() {
  const [url, setUrl] = useState("");
  const [items, setItems] = useState<ShortUrlItem[]>([]);
  const [createdItem, setCreatedItem] = useState<ShortUrlItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function fetchUrls() {
    try {
      setLoadingList(true);
      setError("");
      const response = await api.get("/api/urls");
      setItems(response.data);
    } catch {
      setError("Failed to load URLs.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCreatedItem(null);
    setLoading(true);

    try {
      const response = await api.post("/api/urls", { url });
      setCreatedItem(response.data);
      setUrl("");
      await fetchUrls();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create the shortened URL.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Failed to copy the link.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[220px] w-[220px] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-20 left-0 h-[220px] w-[220px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-8 sm:px-8">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/25">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                URL Shortener
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Shorten links instantly, track clicks, and manage everything in
                one simple dashboard.
              </p>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3"
                      />
                    </svg>
                  </div>

                  <input
                    id="url-input"
                    type="url"
                    placeholder="Paste a long URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Shortening...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Shorten
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {createdItem && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 shrink-0 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-emerald-300">
                    Link created successfully
                  </span>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center">
                  <a
                    href={createdItem.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate font-mono text-sm text-violet-300 hover:text-violet-200"
                  >
                    {createdItem.shortUrl}
                  </a>

                  <CopyButton
                    value={createdItem.shortUrl}
                    id={`created-${createdItem.id}`}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-white">Your Links</h2>
                  {!loadingList && items.length > 0 && (
                    <span className="inline-flex min-w-[22px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-300">
                      {items.length}
                    </span>
                  )}
                </div>

                <button
                  onClick={fetchUrls}
                  disabled={loadingList}
                  className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  {loadingList ? "Loading..." : "Refresh"}
                </button>
              </div>

              {loadingList ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                  <Spinner className="h-5 w-5 text-slate-400" />
                  <p className="text-sm text-slate-400">Loading your links...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <svg
                      className="h-6 w-6 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">No links yet</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Paste a URL above to create your first short link.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/urls/${item.shortCode}`}
                        className="flex items-center gap-4 px-4 py-4 transition hover:bg-white/5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/20">
                          <span className="font-mono text-xs font-bold tracking-wide text-violet-300">
                            {item.shortCode.substring(0, 2).toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-sm font-medium text-violet-300">
                            {item.shortUrl}
                          </p>
                          <p className="mt-1 truncate text-sm text-slate-400">
                            {getDisplayUrl(item.originalUrl)}
                          </p>
                        </div>

                        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 sm:flex">
                          <svg
                            className="h-3.5 w-3.5 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="text-xs text-slate-300">
                            {item.visitCount}
                          </span>
                        </div>

                        <span className="hidden text-xs text-slate-400 md:block">
                          {formatShortDate(item.createdAt)}
                        </span>

                        <div className="hidden sm:block">
                          <CopyButton
                            value={item.shortUrl}
                            id={item.id}
                            copiedId={copiedId}
                            onCopy={handleCopy}
                          />
                        </div>

                        <svg
                          className="h-4 w-4 shrink-0 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}