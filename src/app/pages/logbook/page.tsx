"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Log = {
  _id: string;
  text: string;
  explanation: string;
  ai_analysis: {
    sexism_score: number;
    counter_comments: string[];
    tags: string[];
  };
  tags: string[];
  votes: { sexist: number; notSexist: number };
  createdAt: string;
};

export default function LogbookPage() {
  const { user } = useUser();
  const [userVotes, setUserVotes] = useState<{ [logId: string]: "sexist" | "notSexist" }>({});
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagQuery, setTagQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let url = "/api/logs";
        const params: string[] = [];
        if (tagQuery) params.push(`tag=${encodeURIComponent(tagQuery)}`);
        if (dateQuery) params.push(`date=${encodeURIComponent(dateQuery)}`);
        if (params.length) url += "?" + params.join("&");

        const logsRes = await fetch(url);
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      } catch (error) {
        console.error("Loading failed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tagQuery, dateQuery, user?.id]);

  async function handleVoteAction(logId: string, newVote: "sexist" | "notSexist" | null) {
    if (!user?.id) return;
    try {
      const method = newVote ? "POST" : "DELETE";
      const body = JSON.stringify({
        logId,
        vote: newVote,
        userId: user.id,
      });

      const res = await fetch("/api/vote", {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Vote update failed");

      setLogs((prevLogs) =>
        prevLogs.map((log) => {
          if (log._id !== logId) return log;
          const updatedVotes = { ...log.votes };
          const currentVote = userVotes[log._id];
          if (currentVote) updatedVotes[currentVote]--;
          if (newVote) updatedVotes[newVote]++;
          return { ...log, votes: updatedVotes };
        })
      );

      setUserVotes((prev) => {
        const newVotes = { ...prev };
        if (newVote) {
          newVotes[logId] = newVote;
        } else {
          delete newVotes[logId];
        }
        return newVotes;
      });
    } catch (error) {
      console.error("Vote error:", error);
      alert("Failed to update vote. Please try again.");
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
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
    <>
      {/* Full page background overlay */}
      <div className="logbook-page-overlay">
        <main className="logbook-main">
          <h2 className="logbook-title font-nohemi-bold">LOGBOOK</h2>

          <div className="logbook-filters">
            <input
              type="text"
              placeholder="Search by tag (e.g. stereotype)"
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              className="logbook-input"
            />
            <input
              type="date"
              value={dateQuery}
              onChange={(e) => setDateQuery(e.target.value)}
              className="logbook-input"
            />
          </div>

          {loading ? (
            <div className="logbook-loading">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="logbook-empty">No logs found 📭</div>
          ) : (
            <ul className="logbook-list">
              {logs.map((log) => {
                const currentVote = userVotes[log._id];
                const isSexistSelected = currentVote === "sexist";
                const isNotSexistSelected = currentVote === "notSexist";
                return (
                  <li key={log._id} className="logbook-list-item">
                    <div className="logbook-meta">
                      <span className="logbook-date">{formatDate(log.createdAt)}</span>
                      <div className="logbook-tags">
                        {log.tags.map((tag) => (
                          <span key={tag} className="logbook-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="logbook-comment">{log.text}</div>
                    <div className="logbook-explanation">{log.explanation}</div>
                    <div className="logbook-votes">
                      <button
                        className={`logbook-vote-btn logbook-vote-sexist${isSexistSelected ? " selected" : ""}`}
                        onClick={() => handleVoteAction(log._id, isSexistSelected ? null : "sexist")}
                      >
                        {isSexistSelected ? "✅" : ""} Sexist ({log.votes.sexist})
                      </button>
                      <button
                        className={`logbook-vote-btn logbook-vote-notsexist${isNotSexistSelected ? " selected" : ""}`}
                        onClick={() => handleVoteAction(log._id, isNotSexistSelected ? null : "notSexist")}
                      >
                        {isNotSexistSelected ? "✅" : ""} Not Sexist ({log.votes.notSexist})
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>

      <style jsx>{`
        /* Full page overlay to override any other background */
        .logbook-page-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #16161a;
          color: #e0e0e0;
          overflow-y: auto;
          z-index: 10;
        }

        .logbook-main {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 2rem 4vw;
          box-sizing: border-box;
        }

        .logbook-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          text-align: left;
          color: #fff;
        }
        .logbook-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .logbook-input {
          background: #232336;
          border: 1px solid #333;
          color: #e0e0e0;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          outline: none;
        }
        .logbook-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .logbook-list-item {
          background: #232336;
          border-radius: 8px;
          margin-bottom: 1.2rem;
          padding: 1.2rem 1rem;
          border-left: 4px solid #6366f1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .logbook-meta {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .logbook-date {
          font-size: 0.9rem;
          color: #a3a3a3;
        }
        .logbook-tags {
          display: flex;
          gap: 0.5rem;
        }
        .logbook-tag {
          background: #37306b;
          color: #90caf9;
          border-radius: 1rem;
          padding: 0.2rem 0.7rem;
          font-size: 0.85rem;
        }
        .logbook-comment {
          font-size: 1.08rem;
          font-weight: 500;
          margin-bottom: 0.4rem;
          color: #fff;
          text-align: left;
        }
        .logbook-explanation {
          font-size: 0.97rem;
          color: #f48fb1;
          margin-bottom: 0.6rem;
          text-align: left;
        }
        .logbook-votes {
          display: flex;
          gap: 1rem;
        }
        .logbook-vote-btn {
          padding: 0.35rem 1.1rem;
          border-radius: 6px;
          border: none;
          background: #424242;
          color: #e0e0e0;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .logbook-vote-btn.selected {
          background: #6366f1;
          color: #fff;
        }
        .logbook-vote-sexist.selected {
          background: #c2185b;
        }
        .logbook-vote-notsexist.selected {
          background: #388e3c;
        }
        .logbook-loading,
        .logbook-empty {
          text-align: left;
          padding: 2rem 0;
          color: #888;
        }
      `}</style>
    </>
  );
}