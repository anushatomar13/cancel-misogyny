"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type PendingLogData = {
  analyzedComment: string;
  aiAnalysis: {
    sexism_score: number;
    explanation: string;
    counter_comments: string[];
    tags: string[];
  };
  timestamp: string;
};


type AIAnalysis = {
  sexism_score: number;
  explanation: string;
  counter_comments: string[];
  tags: string[];
};

export default function LogCommentPage() {
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");
  const [success, setSuccess] = useState(false);
const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const { user } = useUser();
  const router = useRouter();

  // Load pending log data when component mounts
  useEffect(() => {
    const pendingData = sessionStorage.getItem('pendingLogData');
    if (pendingData) {
      try {
        const logData: PendingLogData = JSON.parse(pendingData);
        
        // Auto-populate the form with analyzed data
        setText(logData.analyzedComment);
        setExplanation(logData.aiAnalysis.explanation);
        setTags(logData.aiAnalysis.tags.join(', '));
        setAiAnalysis(logData.aiAnalysis);
        
        // Clear the stored data after loading
        sessionStorage.removeItem('pendingLogData');
      } catch (error) {
        console.error('Error loading pending log data:', error);
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    
    if (!user?.id) {
      alert("You must be signed in to log a comment.");
      return;
    }
    
    try {
      let analysisToUse = aiAnalysis;
      
      // If we don't have stored AI analysis, get fresh analysis
      if (!analysisToUse) {
        const analysisRes = await fetch("/api/analyze-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        
        if (!analysisRes.ok) throw new Error("Analysis failed");
        
        analysisToUse = await analysisRes.json();
      }
      
      // Save the comment with the analysis
      const res = await fetch("/api/log-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          explanation,
          ai_analysis: analysisToUse,
          tags: tags.split(",").map(t => t.trim()).filter(t => t.length > 0),
          userId: user.id,
        }),
      });
      
      if (res.ok) {
        setSuccess(true);
        
        // Clear form after successful submission
        setText("");
        setExplanation("");
        setTags("");
        setAiAnalysis(null);
        
        // Redirect to logbook after a short delay
        setTimeout(() => {
          router.push('/pages/logbook');
        }, 1500);
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
          
          {/* Show analysis preview if available */}
          {aiAnalysis && (
            <div className="analysis-preview">
              <h3 className="preview-title">Analysis Preview</h3>
              <div className="preview-content">
                <div className="score-indicator">
                  Sexism Score: <span className="score-value">{(aiAnalysis.sexism_score * 100).toFixed(0)}%</span>
                </div>
                <div className="tags-preview">
                  Tags: {aiAnalysis.tags.map((tag: string, i: number) => (
                    <span key={i} className="tag-chip">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
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
              <div className="input-hint">
                {aiAnalysis ? "This comment was auto-populated from your analysis. You can edit it if needed." : "Enter the comment you want to log."}
              </div>
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
              <div className="input-hint">
                {aiAnalysis ? "This explanation was generated by AI analysis. You can modify it." : "Explain why this comment is problematic."}
              </div>
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
              <div className="input-hint">
                {aiAnalysis ? "These tags were suggested by AI. You can add or remove tags." : "Add relevant tags separated by commas."}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button uppercase">
                Log Comment
              </button>
              <br/>
              {success && (
                <div className="success-message">
                  Comment successfully logged! Redirecting to logbook...
                </div>
              )}
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

        .analysis-preview {
          background: #232336;
          border: 1px solid #6366f1;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .preview-title {
          color: #90caf9;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .score-indicator {
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .score-value {
          color: #f59e0b;
          font-weight: bold;
        }

        .tags-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .tag-chip {
          background: #37306b;
          color: #90caf9;
          padding: 0.2rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.8rem;
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

        .input-hint {
          font-size: 0.8rem;
          color: #a0aec0;
          font-style: italic;
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

          .tags-preview {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}