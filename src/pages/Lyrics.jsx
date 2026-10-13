
import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://ai-music-mood-backend.onrender.com";

function Lyrics() {
  const [lyrics, setLyrics] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  const songName =
    localStorage.getItem("uploadedSongName") ||
    localStorage.getItem("songName") ||
    "Uploaded Song";

  const getMoodEmoji = (mood) => {
    if (mood === "Happy") return "😊";
    if (mood === "Sad") return "😢";
    if (mood === "Relaxed") return "😌";
    if (mood === "Energetic") return "⚡";
    return "🎵";
  };

  const handleAnalyze = async () => {
    if (!lyrics.trim()) {
      alert("Please enter song lyrics.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalyzed(false);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${API_URL}/lyrics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lyrics: lyrics.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.error || `Lyrics analysis failed (${response.status}).`
        );
      }

      setAnalysisResult(data);
      setAnalyzed(true);

      localStorage.setItem(
        "lyricsAnalysis",
        JSON.stringify(data)
      );
    } catch (err) {
      console.error("Lyrics API Error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Backend connection failed. Check the backend URL and CORS settings."
          : err.message || "Unable to analyze lyrics."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lyrics-page">
      <div className="lyrics-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="lyrics-header">
          <div className="lyrics-icon">📝</div>
          <h1>Lyrics Analysis</h1>
          <p>
            Analyze song lyrics to understand their emotional meaning.
          </p>
        </div>

        <div className="lyrics-song-card">
          <div className="lyrics-song-icon">🎵</div>
          <div>
            <span>YOUR UPLOADED SONG</span>
            <h2>{songName}</h2>
          </div>
        </div>

        <div className="lyrics-card">
          <h2>📝 Enter Song Lyrics</h2>

          <p className="lyrics-description">
            Paste the lyrics of your song below for AI-based emotional analysis.
          </p>

          <textarea
            className="lyrics-textarea"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Enter or paste your song lyrics here..."
            rows={10}
          />

          <button
            className="analyze-lyrics-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "⏳ Analyzing Lyrics..." : "🤖 Analyze Lyrics"}
          </button>

          {error && (
            <div className="lyrics-error">
              ❌ {error}
            </div>
          )}
        </div>

        {analyzed && analysisResult && (
          <div className="lyrics-result-card">

            <div className="lyrics-result-title">
              <span>🤖</span>
              <div>
                <h2>AI Lyrics Analysis</h2>
                <p>Emotional analysis completed</p>
              </div>
            </div>

            <div className="lyrics-mood-result">
              <div className="lyrics-mood-icon">
                {getMoodEmoji(analysisResult.mood)}
              </div>
              <div>
                <span>DETECTED MOOD</span>
                <h2>{analysisResult.mood || "Unknown"}</h2>
              </div>
            </div>

            <div className="lyrics-stats">
              <div className="lyrics-stat">
                <span>🎯</span>
                <div>
                  <small>AI Confidence</small>
                  <strong>
                    {analysisResult.confidence ?? "N/A"}
                    {analysisResult.confidence != null ? "%" : ""}
                  </strong>
                </div>
              </div>

              <div className="lyrics-stat">
                <span>📝</span>
                <div>
                  <small>Lyrics Status</small>
                  <strong>Analyzed</strong>
                </div>
              </div>
            </div>

            <div className="lyrics-emotion-box">
              <h3>💭 Emotional Meaning</h3>
              <p>
                {analysisResult.emotional_meaning ||
                  "No emotional explanation provided."}
              </p>
            </div>

            <div className="lyrics-keywords">
              <h3>🔑 Emotional Keywords</h3>
              <div className="keyword-list">
                {Array.isArray(analysisResult.keywords) &&
                analysisResult.keywords.length > 0 ? (
                  analysisResult.keywords.map((keyword, index) => (
                    <span className="keyword-tag" key={index}>
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="keyword-tag">
                    No specific keywords found
                  </span>
                )}
              </div>
            </div>

            <div className="lyrics-length">
              📝 Lyrics analyzed:
              <strong>
                {" "}
                {analysisResult.lyrics_length ?? lyrics.length}
                {" "}characters
              </strong>
            </div>
          </div>
        )}

        <div className="lyrics-actions">
          <Link to="/mood-result" className="lyrics-back-btn">
            ← Back to Mood Result
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Lyrics;