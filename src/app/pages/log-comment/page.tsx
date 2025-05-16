"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function LogCommentPage() {
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    
    if (!user?.id) {
      alert("You must be signed in to log a comment.");
      return;
    }
    
    try {
      // Step 1: Get AI analysis first
      const analysisRes = await fetch("/api/analyze-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      if (!analysisRes.ok) throw new Error("Analysis failed");
      
      const analysis = await analysisRes.json();
      
      // Step 2: Now save the comment with the analysis
      const res = await fetch("/api/log-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          explanation,
          ai_analysis: analysis, // Use the AI analysis results
          tags: analysis.tags || tags.split(",").map(t => t.trim()),
          userId: user.id,
        }),
      });
      
      if (res.ok) {
        setSuccess(true);
        // Clear form after successful submission
        setText("");
        setExplanation("");
        setTags("");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze and save comment");
    }
  }

  return (
    <>
      {/* Full page background overlay */}
      <div className="log-comment-page-overlay">
        <main className="log-comment-main">
          <h2 className="log-comment-title font-nohemi-bold">LOG A COMMENT</h2>
          
          <form onSubmit={handleSubmit} className="log-comment-form">
            <div className="form-group">
              <label htmlFor="comment-text" className="form-label">Comment Text</label>
              <textarea
                id="comment-text"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                className="form-input"
                placeholder="Enter the misogynistic comment here"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="explanation" className="form-label">Explanation</label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                rows={2}
                className="form-input"
                placeholder="Why is this comment harmful or problematic?"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tags" className="form-label">Tags</label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="form-input"
                placeholder="stereotype, misogyny, gender_inequality (comma separated)"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Log Comment
              
              </button>
              <br/>
              {success && <div className="success-message">Comment successfully logged!</div>}
            </div>
          </form>
        </main>
      </div>

      <style jsx>{`
        /* Full page overlay to override any other background */
        .log-comment-page-overlay {
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

        .log-comment-main {
          width: 100%;
          max-width: 600px;
          min-height: 100vh;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          box-sizing: border-box;
        }

        .log-comment-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 2rem;
          text-align: left;
          color: #fff;
        }

        .log-comment-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 1rem;
          font-weight: 500;
          color: #90caf9;
        }

        .form-input {
          background: #232336;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 0.8rem 1rem;
          font-size: 1rem;
          color: #e0e0e0;
          width: 100%;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          border-color: #6366f1;
        }

        .form-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .submit-button {
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0.7rem 1.8rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-button:hover {
          background: #4f46e5;
        }

        .success-message {
          color: #4ade80;
          font-weight: 500;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .log-comment-main {
            padding: 1.5rem 1rem;
          }
          
          .log-comment-title {
            font-size: 1.7rem;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}