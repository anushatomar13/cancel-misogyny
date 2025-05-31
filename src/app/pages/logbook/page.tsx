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

type UserVote = {
  logId: string;
  vote: "sexist" | "notSexist";
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
        // Load logs
        let url = "/api/logs";
        const params: string[] = [];
        if (tagQuery) params.push(`tag=${encodeURIComponent(tagQuery)}`);
        if (dateQuery) params.push(`date=${encodeURIComponent(dateQuery)}`);
        if (params.length) url += "?" + params.join("&");

        const logsRes = await fetch(url);
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);

        // Load user votes if user is signed in
        if (user?.id) {
          const votesRes = await fetch(`/api/user-votes?userId=${user.id}`);
          if (votesRes.ok) {
            const votesData = await votesRes.json();
            const voteMap: { [logId: string]: "sexist" | "notSexist" } = {};
            votesData.votes.forEach((vote: UserVote) => {
              voteMap[vote.logId] = vote.vote;
            });
            setUserVotes(voteMap);
          }
        }
      } catch (error) {
        console.error("Loading failed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tagQuery, dateQuery, user?.id]);

  async function handleVoteAction(logId: string, newVote: "sexist" | "notSexist" | null) {
    if (!user?.id) {
      alert("Please sign in to vote on comments.");
      return;
    }

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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Vote update failed");
      }

      // Update local state optimistically
      setLogs((prevLogs) =>
        prevLogs.map((log) => {
          if (log._id !== logId) return log;
          const updatedVotes = { ...log.votes };
          const currentVote = userVotes[log._id];
          
          // Remove previous vote count
          if (currentVote) {
            updatedVotes[currentVote] = Math.max(0, updatedVotes[currentVote] - 1);
          }
          
          // Add new vote count
          if (newVote) {
            updatedVotes[newVote] = updatedVotes[newVote] + 1;
          }
          
          return { ...log, votes: updatedVotes };
        })
      );

      // Update user votes tracking
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

  function getScoreColor(score: number): string {
    if (score < 0.3) return "#4ade80"; // Green for low scores
    if (score < 0.7) return "#f59e0b"; // Amber for medium scores
    return "#ef4444"; // Red for high scores
  }

  return (
    <>
      {/* Full page background overlay */}
      <div className="logbook-page-overlay">
        <main className="logbook-main">
          <h2 className="logbook-title font-nohemi-bold">COMMUNITY LOGBOOK</h2>

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
            <div className="logbook-loading">Loading community logs...</div>
          ) : logs.length === 0 ? (
            <div className="logbook-empty">
              <div className="empty-icon">📭</div>
              <div>No logs found</div>
              <div className="empty-subtitle">Be the first to contribute to our community database!</div>
            </div>
          ) : (
            <div>
              <div className="logs-count">
                {logs.length} comment{logs.length !== 1 ? 's' : ''} in community database
              </div>
              <ul className="logbook-list">
                {logs.map((log) => {
                  const currentVote = userVotes[log._id];
                  const isSexistSelected = currentVote === "sexist";
                  const isNotSexistSelected = currentVote === "notSexist";
                  const totalVotes = log.votes.sexist + log.votes.notSexist;
                  const sexistPercentage = totalVotes > 0 ? (log.votes.sexist / totalVotes) * 100 : 0;
                  
                  return (
                    <li key={log._id} className="logbook-list-item">
                      <div className="logbook-header">
                        <div className="logbook-meta">
                          <span className="logbook-date">{formatDate(log.createdAt)}</span>
                          <div className="ai-score">
                            <span className="score-label">AI Score:</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{ 
                                  width: `${log.ai_analysis.sexism_score * 100}%`,
                                  backgroundColor: getScoreColor(log.ai_analysis.sexism_score)
                                }}
                              ></div>
                            </div>
                            <span className="score-text">
                              {(log.ai_analysis.sexism_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="logbook-tags">
                          {log.tags.map((tag) => (
                            <span key={tag} className="logbook-tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="comment-content">
                        <div className="logbook-comment">{log.text}</div>
                        <div className="logbook-explanation">{log.explanation}</div>
                      </div>
                      
                      <div className="community-voting">
                        <div className="voting-header">
                          <span className="voting-title">Community Consensus</span>
                          {totalVotes > 0 && (
                            <span className="consensus-indicator">
                              {sexistPercentage > 60 ? "🚨 Sexist" : 
                               sexistPercentage < 40 ? "✅ Not Sexist" : 
                               "🤔 Mixed Views"}
                            </span>
                          )}
                        </div>
                        
                        <div className="logbook-votes">
                          <button
                            className={`logbook-vote-btn logbook-vote-sexist${isSexistSelected ? " selected" : ""}`}
                            onClick={() => handleVoteAction(log._id, isSexistSelected ? null : "sexist")}
                            disabled={!user}
                          >
                            <span className="vote-icon">{isSexistSelected ? "✅" : "👎"}</span>
                            <span className="vote-text">Sexist</span>
                            <span className="vote-count">({log.votes.sexist})</span>
                          </button>
                          
                          <button
                            className={`logbook-vote-btn logbook-vote-notsexist${isNotSexistSelected ? " selected" : ""}`}
                            onClick={() => handleVoteAction(log._id, isNotSexistSelected ? null : "notSexist")}
                            disabled={!user}
                          >
                            <span className="vote-icon">{isNotSexistSelected ? "✅" : "👍"}</span>
                            <span className="vote-text">Not Sexist</span>
                            <span className="vote-count">({log.votes.notSexist})</span>
                          </button>
                        </div>
                        
                        {!user && (
                          <div className="sign-in-prompt">
                            Sign in to vote and contribute to community consensus
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
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
          flex-wrap: wrap;
        }

        .logbook-input {
          background: #232336;
          border: 1px solid #333;
          color: #e0e0e0;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .logbook-input:focus {
          border-color: #6366f1;
        }

        .logs-count {
          font-size: 0.9rem;
          color: #90caf9;
          margin-bottom: 1rem;
          text-align: left;
        }

        .logbook-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .logbook-list-item {
          background: #232336;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          border-left: 4px solid #6366f1;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .logbook-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .logbook-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .logbook-date {
          font-size: 0.85rem;
          color: #a3a3a3;
        }

        .ai-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .score-label {
          font-size: 0.8rem;
          color: #90caf9;
        }

        .score-bar {
          width: 60px;
          height: 8px;
          background: #18181e;
          border-radius: 4px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .score-text {
          font-size: 0.8rem;
          font-weight: bold;
          color: #e0e0e0;
        }

        .logbook-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .logbook-tag {
          background: #37306b;
          color: #90caf9;
          border-radius: 1rem;
          padding: 0.2rem 0.7rem;
          font-size: 0.8rem;
        }

        .comment-content {
          margin-bottom: 1.5rem;
        }

        .logbook-comment {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.8rem;
          color: #fff;
          text-align: left;
          line-height: 1.4;
          padding: 1rem;
          background: #2e2e42;
          border-radius: 8px;
          border-left: 3px solid #6366f1;
        }

        .logbook-explanation {
          font-size: 0.95rem;
          color: #f48fb1;
          text-align: left;
          line-height: 1.4;
        }

        .community-voting {
          background: #1e1e2e;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #333;
        }

        .voting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .voting-title {
          font-size: 0.9rem;
          color: #90caf9;
          font-weight: 600;
        }

        .consensus-indicator {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .logbook-votes {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .logbook-vote-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          border: 2px solid transparent;
          background: #424242;
          color: #e0e0e0;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .logbook-vote-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .logbook-vote-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .logbook-vote-btn.selected {
          border-color: #6366f1;
          background: #6366f1;
          color: #fff;
        }

        .logbook-vote-sexist.selected {
          background: #c2185b;
          border-color: #c2185b;
        }

        .logbook-vote-notsexist.selected {
          background: #388e3c;
          border-color: #388e3c;
        }

        .vote-icon {
          font-size: 1rem;
        }

        .vote-text {
          font-weight: 600;
        }

        .vote-count {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .sign-in-prompt {
          margin-top: 0.8rem;
          font-size: 0.8rem;
          color: #a0aec0;
          text-align: center;
          font-style: italic;
        }

        .logbook-loading,
        .logbook-empty {
          text-align: center;
          padding: 3rem 0;
          color: #888;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-subtitle {
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.5rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .logbook-main {
            padding: 1.5rem 1rem;
          }
          
          .logbook-title {
            font-size: 1.5rem;
          }

          .logbook-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .ai-score {
            flex-wrap: wrap;
          }

          .logbook-votes {
            justify-content: center;
          }

          .logbook-vote-btn {
            flex: 1;
            min-width: 120px;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}