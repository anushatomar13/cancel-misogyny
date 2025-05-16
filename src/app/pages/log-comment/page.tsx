"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type AIAnalysis = {
  sexism_score: number;
  counter_comments: string[];
  tags: string[];
};

type Log = {
  _id: string;
  text: string;
  explanation: string;
  ai_analysis: AIAnalysis;
  tags: string[];
  votes: { sexist: number; notSexist: number };
  createdAt: string;
  userId?: string;
};

export default function LogbookPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { user } = useUser();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedTag
        ? `/api/logs?tag=${encodeURIComponent(selectedTag)}`
        : "/api/logs";

      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          pragma: "no-cache",
          "cache-control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();

      if (!Array.isArray(data.logs)) {
        throw new Error("Invalid data format received");
      }

      setLogs(data.logs);

      const tags = data.logs.flatMap((log: Log) => log.tags || []);
      const uniqueTags = Array.from(new Set(tags.filter(Boolean)));
      setAllTags(uniqueTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    fetchLogs();
    const intervalId = setInterval(() => {
      fetchLogs();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchLogs]);

  async function handleVote(logId: string, voteType: "sexist" | "notSexist") {
    if (!user) return;

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId,
          userId: user.id,
          vote: voteType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }

      setLogs((prevLogs) =>
        prevLogs.map((log) => {
          if (log._id === logId) {
            const newVotes = { ...log.votes };
            newVotes[voteType]++;
            return { ...log, votes: newVotes };
          }
          return log;
        })
      );

      fetchLogs();
    } catch (err) {
      console.error("Vote error:", err);
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center mb-8">
          <span className="text-pink-300 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
                clipRule="evenodd"
              />
              <path d="M10 6a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1V7a1 1 0 011-1z" />
            </svg>
          </span>
          <h1 className="text-4xl font-bold">Logbook Analysis</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">Filter by tag:</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTag === null
                  ? "bg-pink-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTag === tag
                    ? "bg-pink-600 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
            <p>{error}</p>
            <button
              onClick={() => fetchLogs()}
              className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl">No comments found.</p>
            <p className="text-gray-400 mt-2">Be the first to log a comment!</p>
          </div>
        )}

        <div className="space-y-6">
          {logs.map((log) => (
            <div
              key={log._id}
              className="bg-gray-800 p-4 rounded-lg shadow-md transition-all"
            >
              <div className="mb-2 text-sm text-gray-400">
                {formatDate(log.createdAt)}
              </div>
              <p className="text-lg font-medium">{log.text}</p>
              <p className="text-sm mt-2 text-pink-300 italic">
                {log.explanation}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {log.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-pink-700 text-white px-2 py-1 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleVote(log._id, "sexist")}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                >
                  Sexist ({log.votes.sexist})
                </button>
                <button
                  onClick={() => handleVote(log._id, "notSexist")}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                >
                  Not Sexist ({log.votes.notSexist})
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
