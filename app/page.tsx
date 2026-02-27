"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [seedMessage, setSeedMessage] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url) return;
    setError("");
    setShortUrl("");

    console.log("url", url);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ longUrl: url.trim() }),
      });

      const text = await res.text();
      let data: { shortUrl?: string; message?: string; error?: string } = {};
      if (text.startsWith("{") || res.headers.get("content-type")?.includes("application/json")) {
        try {
          data = JSON.parse(text);
        } catch {
          setError("Invalid response from server");
          return;
        }
      }

      if (!res.ok) {
        const msg =
          data?.error ??
          data?.message ??
          (text.startsWith("<") ? `Server error (${res.status})` : "Failed to shorten URL");
        setError(msg);
        return;
      }

      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };


  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          URL Shortener 🔗
        </h1>

        <input
          type="text"
          placeholder="Enter your long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4 text-black"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white p-3 rounded-lg"
        >
          Shorten URL
        </button>

        
        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
        {shortUrl && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Short URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              className="text-blue-600 font-medium"
            >
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}