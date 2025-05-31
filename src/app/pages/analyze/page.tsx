"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@heroui/tooltip";

type AIResult = {
  sexism_score: number;
  explanation: string;
  counter_comments: string[];
  tags: string[];
};

export default function AnalyzePage() {
  const router = useRouter();
  // const placements = [
  //   "top-start"
  // ];
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Refs for GSAP animations
  const formRef = useRef(null);
  const resultRef = useRef(null);
  const uploadIconRef = useRef(null);
  const progressBarRef = useRef(null);

  const scoreRef = useRef(null);
  const counterCommentsRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', '#16161a');
    document.body.style.background = '#16161a';
    document.documentElement.style.background = '#16161a';
    document.body.className = '';
  }, []);

  // Initialize animations when component mounts
  useEffect(() => {
    // Initial page load animation
    gsap.from(".analyze-title", {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.from(formRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: "power3.out"
    });

    // File upload icon animation
    const uploadIcon = uploadIconRef.current;
    if (uploadIcon) {
      gsap.to(uploadIcon, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: "none",
        paused: true
      });
    }
  }, []);

  // Animation when results appear
  useEffect(() => {
    if (result) {
      // Reset scroll position to see results
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Animate result container appearance
      gsap.fromTo(resultRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // Animate score meter
      const score = result.sexism_score;
      gsap.fromTo(scoreRef.current,
        { width: 0 },
        { width: `${score * 100}%`, duration: 1.5, ease: "power3.inOut", delay: 0.4 }
      );

      // Stagger counter comments animation
      gsap.fromTo(".counter-comment",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: "power3.out", delay: 0.8 }
      );
    }
  }, [result]);

  // Handle loading animation
  useEffect(() => {
    if (loading && progressBarRef.current) {
      gsap.fromTo(progressBarRef.current,
        { width: "0%" },
        { width: "90%", duration: 2, ease: "power2.inOut" }
      );
    }
  }, [loading]);

  // Function to validate image file
  const validateImageFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, GIF, or WebP)";
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return "Image is too large. Please use an image smaller than 10MB";
    }
    
    return null;
  };

  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Function to handle navigation to log comment page with analyzed data
  const handleLogComment = () => {
    if (result && comment) {
      // Store data in sessionStorage for persistence across page navigation
      const logData = {
        analyzedComment: comment,
        aiAnalysis: result,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem('pendingLogData', JSON.stringify(logData));
      
      // Navigate to log comment page
      router.push('/pages/log-comment');
    }
  };

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    let text = comment;

    // If image is uploaded, extract text first
    if (image) {
      // Validate image file
      const validationError = validateImageFile(image);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      try {
        setOcrLoading(true);
        const base64 = await fileToBase64(image);
        
        const ocrRes = await fetch("/api/extract-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        if (!ocrRes.ok) {
          const errorData = await ocrRes.json();
          throw new Error(errorData.error || "OCR failed. Unable to extract text from image.");
        }

        const ocrData = await ocrRes.json();
        text = ocrData.text;

        // Show extracted text to user
        setComment(text);
        
        setOcrLoading(false);
      } catch (ocrError) {
        setOcrLoading(false);
        setError(ocrError instanceof Error ? ocrError.message : "Failed to extract text from image");
        setLoading(false);
        return;
      }
    }

    // Validate that we have text to analyze
    if (!text || text.trim().length === 0) {
      setError("Please provide text to analyze (either by typing or uploading an image with text)");
      setLoading(false);
      return;
    }

    analyzeText(text);

    async function analyzeText(textToAnalyze: string) {
      try {
        const res = await fetch("/api/analyze-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToAnalyze }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Analysis API returned an error");
        }
        
        const data = await res.json();

        // Complete the progress bar animation before showing results
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, {
            width: "100%",
            duration: 0.3,
            ease: "power1.inOut",
            onComplete: () => {
              setResult(data);
              setLoading(false);
            }
          });
        } else {
          setResult(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to analyze comment. Please try again.");
        setLoading(false);
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-[#16161a] text-[#e0e0e0] overflow-y-auto z-10">
        <main className="w-full max-w-[720px] min-h-screen mx-auto px-6 py-8">
          <h2 className="analyze-title text-2xl font-bold mb-8 text-left text-white border-b-2 border-[#6366f1] pb-2 font-nohemi-bold">ANALYZE A COMMENT</h2>

          <form ref={formRef} onSubmit={handleAnalyze} className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="comment-text" className="text-base font-medium text-[#90caf9]">Enter Comment</label>
              <textarea
                id="comment-text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                className="bg-[#232336] border border-[#333] rounded-lg p-4 text-base text-[#e0e0e0] w-full resize-y outline-none transition-all duration-300 focus:border-[#6366f1] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"
                placeholder="Paste a potentially misogynistic comment here..."
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-base font-medium text-[#90caf9]">
                <div className="flex items-center gap-3 bg-[#232336] border border-dashed border-[#6366f1] p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#2a2a42]">
                  <div ref={uploadIconRef} className="text-2xl text-[#90caf9]">📷</div>
                  <span>{image ? `Selected: ${image.name}` : 'Upload Image (Max 10MB)'}</span>
                  {ocrLoading && <span className="text-sm text-[#f59e0b]">Extracting text...</span>}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    setError(null); // Clear any previous errors
                    
                    // Animate the upload icon when a file is selected
                    if (file && uploadIconRef.current) {
                      gsap.to(uploadIconRef.current, {
                        rotation: 720,
                        scale: 1.2,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.3)",
                        onComplete: () => {
                          gsap.to(uploadIconRef.current, {
                            scale: 1,
                            duration: 0.3
                          });
                        }
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-[#a0aec0] mt-1">
                Supported formats: JPEG, PNG, GIF, WebP. The app will extract text from your image.
              </div>
            </div>

            <div className="flex justify-start mt-4">
              <button
                type="submit"
                disabled={loading || ocrLoading || (!comment && !image)}
                className={`bg-[#6366f1] text-white border-none rounded-md py-3 px-8 text-base font-semibold cursor-pointer transition-all duration-300 relative overflow-hidden ${loading || ocrLoading ? 'bg-[#4b4b63]' : ''} ${(!loading && !ocrLoading && !(!comment && !image)) ? 'hover:bg-[#4f46e5] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)]' : ''} disabled:bg-[#4b4b63] disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {ocrLoading ? 'Extracting Text...' : loading ? 'Analyzing...' : 'Analyze Comment'}
              </button>
            </div>
          </form>

          {loading && (
            <div className="h-1.5 bg-[#232336] rounded-sm my-6 overflow-hidden">
              <div ref={progressBarRef} className="h-full bg-gradient-to-r from-[#6366f1] to-[#818cf8] w-0 rounded-sm"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-[#3b1827] border-l-4 border-[#e53e3e] p-4 rounded-md my-6 animate-[fadeIn_0.5s_ease-out]">
              <div className="text-2xl">⚠️</div>
              <div className="text-[#f56565]">{error}</div>
            </div>
          )}

          {result && (
            <div ref={resultRef} className="bg-[#232336] rounded-xl p-6 mt-8 shadow-[0_4px_20px_rgba(0,0,0,0.2)] border-l-4 border-[#6366f1]">
              <div className="text-xl font-semibold text-white mb-6 text-center">Analysis Results</div>

              <div className="mb-6 pb-6 border-b border-[#333344]">
                <div className="text-lg font-medium text-[#90caf9] mb-3">Sexism Score</div>
                <div className="h-3 bg-[#18181e] rounded-md overflow-hidden mb-2">
                  <div
                    ref={scoreRef}
                    className="h-full w-0 transition-[width] duration-[1.5s] ease-in-out"
                    style={{ backgroundColor: getScoreColor(result.sexism_score) }}
                  ></div>
                </div>
                <div className="text-right font-semibold text-lg">{(result.sexism_score * 100).toFixed(0)}%</div>
              </div>

              <div className="mb-6 pb-6 border-b border-[#333344]">
                <div className="text-lg font-medium text-[#90caf9] mb-3">Explanation</div>
                <div className="bg-[#2e2e42] p-4 rounded-md text-[#f48fb1] text-base leading-relaxed">{result.explanation}</div>
              </div>

              <div className="mb-6 pb-6 border-b border-[#333344]">
                <div className="text-lg font-medium text-[#90caf9] mb-3">Tags</div>
                <div className="flex flex-wrap gap-2.5">
                  {result.tags.map((tag, index) => (
                    <span key={index} className="bg-[#37306b] text-[#90caf9] rounded-2xl py-1 px-3 text-sm">#{tag}</span>
                  ))}
                </div>
              </div>

              <div ref={counterCommentsRef}>
                <div className="text-lg font-medium text-[#90caf9] mb-3">Counter Arguments</div>
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {result.counter_comments.map((cc, i) => (
                    <li key={i} className="counter-comment bg-[#2e2e42] p-4 rounded-md relative pl-6">
                      <span className="absolute left-3 text-[#6366f1]">•</span>{cc}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10">
                <Tooltip key="top-start" color="foreground" className="border-none text-[#d88fb0]" content="Speak out—help raise awareness about online misogyny." placement="top-start">
                  <Button 
                    className="capitalize" 
                    color="secondary"
                    onClick={handleLogComment}
                  >
                    LOG YOUR COMMENT
                  </Button>
                </Tooltip>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// Helper function to determine score color based on severity
function getScoreColor(score: number): string {
  if (score < 0.3) return "#4ade80"; // Green for low scores
  if (score < 0.7) return "#f59e0b"; // Amber for medium scores
  return "#ef4444"; // Red for high scores
}