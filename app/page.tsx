"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async () => {
    if (!url) return;

    try {
      const res = await fetch("http://localhost:8080/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setShortUrl(data.shortUrl);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          URL Shortener 🔗
        </h1>

        <input
          type="text"
          placeholder="Enter your long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white p-3 rounded-lg"
        >
          Shorten URL
        </button>

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