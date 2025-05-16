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

useEffect(() => {
  const loadData = async () => {
    try {
      const logsRes = await fetch("/api/logs");
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);
    } catch (error) {
      console.error("Loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [user?.id]);


  async function handleVoteAction(logId: string, newVote: "sexist" | "notSexist" | null) {
    if (!user?.id) return;

    try {
      const method = newVote ? "POST" : "DELETE";
      const body = JSON.stringify({ 
        logId, 
        vote: newVote,
        userId: user.id 
      });

      const res = await fetch("/api/vote", {
        method,
        headers: { "Content-Type": "application/json" },
        body
      });

      if (!res.ok) throw new Error("Vote update failed");

      // Optimistic UI update
      setLogs(prevLogs => prevLogs.map(log => {
        if (log._id !== logId) return log;
        
        const updatedVotes = { ...log.votes };
        const currentVote = userVotes[logId];

        if (currentVote) updatedVotes[currentVote]--;
        if (newVote) updatedVotes[newVote]++;

        return { ...log, votes: updatedVotes };
      }));

      setUserVotes(prev => {
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

  return (
    <main className="logbook-container">
      <h2 className="logbook-header">🧠 Logbook Analysis</h2>
      
      {loading ? (
        <div className="loading-indicator">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">No logs found 📭</div>
      ) : (
        <ul className="log-list">
          {logs.map(log => {
            const currentVote = userVotes[log._id];
            const isSexistSelected = currentVote === "sexist";
            const isNotSexistSelected = currentVote === "notSexist";

            return (
              <li key={log._id} className="log-item">
                <div className="log-content">
                  <div className="comment-section">
                    <span className="label">🗣️ Comment:</span>
                    <p className="comment-text">{log.text}</p>
                  </div>

                  <div className="explanation-section">
                    <span className="label">💡 Explanation:</span>
                    <p className="explanation-text">{log.explanation}</p>
                  </div>

                  <div className="tags-section">
                    <span className="label">🏷️ Tags:</span>
                    <div className="tags-container">
                      {log.tags.map(tag => (
                        <span key={tag} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="votes-section">
                    <span className="label">📊 Votes:</span>
                    <div className="votes-display">
                      <span className="sexist-votes">{log.votes.sexist}</span>
                      <span className="divider">|</span>
                      <span className="not-sexist-votes">{log.votes.notSexist}</span>
                    </div>
                  </div>
                </div>

                <div className="vote-controls">
                  <button
                    className={`vote-button sexist ${isSexistSelected ? 'selected' : ''}`}
                    onClick={() => 
                      handleVoteAction(log._id, isSexistSelected ? null : "sexist")
                    }
                  >
                    {isSexistSelected ? '✅ Voted Sexist' : 'Vote Sexist'}
                  </button>
                  
                  <button
                    className={`vote-button not-sexist ${isNotSexistSelected ? 'selected' : ''}`}
                    onClick={() => 
                      handleVoteAction(log._id, isNotSexistSelected ? null : "notSexist")
                    }
                  >
                    {isNotSexistSelected ? '✅ Voted Not Sexist' : 'Vote Not Sexist'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <style jsx>{`
        .logbook-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background-color: #121212;
          color: #e0e0e0;
          font-family: 'Segoe UI', sans-serif;
        }

        .logbook-header {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 2rem;
          text-align: center;
        }

        .loading-indicator,
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        .log-list {
          list-style: none;
          padding: 0;
        }

        .log-item {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #1e1e1e;
          border-radius: 10px;
          border: 1px solid #333;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        .label {
          display: block;
          margin-bottom: 0.5rem;
          color: #888;
          font-size: 0.9rem;
        }

        .comment-text,
        .explanation-text {
          margin: 0;
          color: #f5f5f5;
          line-height: 1.5;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .tag {
          background: #333;
          padding: 0.3rem 0.6rem;
          border-radius: 1rem;
          font-size: 0.85rem;
          color: #90caf9;
        }

        .votes-display {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-top: 0.5rem;
        }

        .sexist-votes { color: #f48fb1; }
        .not-sexist-votes { color: #81c784; }
        .divider { color: #444; }

        .vote-controls {
          margin-top: 1.5rem;
          display: flex;
          gap: 1rem;
        }

        .vote-button {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vote-button.sexist {
          background: #424242;
          color: #f48fb1;
        }

        .vote-button.sexist.selected {
          background: #c2185b;
          color: white;
        }

        .vote-button.not-sexist {
          background: #424242;
          color: #81c784;
        }

        .vote-button.not-sexist.selected {
          background: #388e3c;
          color: white;
        }

        .vote-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>
    </main>
  );
}
