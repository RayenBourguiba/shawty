"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Props = {
  params: Promise<{ shortCode: string }>;
};

type ShortUrlItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl?: string;
  visitCount: number;
  createdAt: string;
  lastVisitedAt: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function UrlDetailsPage({ params }: Props) {
  const [item, setItem] = useState<ShortUrlItem | null>(null);
  const [error, setError] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const resolvedParams = await params;
        setShortCode(resolvedParams.shortCode);

        const response = await api.get(`/api/urls/${resolvedParams.shortCode}`);
        setItem(response.data);
      } catch {
        setError("Failed to load URL details.");
      }
    }

    load();
  }, [params]);

  const resolvedShortUrl = useMemo(() => {
    if (item?.shortUrl) return item.shortUrl;
    if (!shortCode) return "";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    return `${baseUrl}/${shortCode}`;
  }, [item?.shortUrl, shortCode]);

  async function handleCopy() {
    if (!resolvedShortUrl) return;

    try {
      await navigator.clipboard.writeText(resolvedShortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy the short URL.");
    }
  }

  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-8 top-0 h-96 w-96 rounded-full bg-red-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-red-500/20 bg-red-500/10 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/15">
              <svg
                className="h-10 w-10 text-red-400"
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
            </div>

            <h1 className="text-3xl font-semibold text-white">
              Error Loading URL
            </h1>
            <p className="mt-3 text-red-200">{error}</p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/60 px-8 py-10 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="h-10 w-10 animate-spin text-violet-400"
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
              <p className="text-sm text-slate-300">Loading URL details...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[220px] w-[220px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-5 sm:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
                  <span className="text-lg font-bold text-white">
                    {shortCode.substring(0, 2).toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Short Link Details</p>
                  <h1 className="mt-1 font-mono text-3xl font-semibold text-white">
                    {shortCode}
                  </h1>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                <p className="text-2xl font-semibold text-white">
                  {item.visitCount}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  total visits
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <section className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Short URL
              </label>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center">
                <a
                  href={resolvedShortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate font-mono text-sm text-violet-300 hover:text-violet-200 sm:text-base"
                >
                  {resolvedShortUrl || "Unavailable"}
                </a>

                <button
                  onClick={handleCopy}
                  disabled={!resolvedShortUrl}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    copied
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-violet-600 text-white hover:bg-violet-500"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Original URL
              </label>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <a
                  href={item.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-sky-300 hover:text-sky-200"
                >
                  {item.originalUrl}
                </a>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Created
                </p>
                <p className="mt-3 text-xl font-semibold text-white">
                  {formatDate(item.createdAt)}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {formatTime(item.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Last Visit
                </p>
                {item.lastVisitedAt ? (
                  <>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {formatDate(item.lastVisitedAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatTime(item.lastVisitedAt)}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-xl font-semibold text-slate-500">
                    Never
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/80">
                  Engagement
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {item.visitCount}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {item.visitCount === 1 ? "click" : "clicks"}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
