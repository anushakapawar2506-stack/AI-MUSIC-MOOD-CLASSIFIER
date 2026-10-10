import { useState } from "react";
import { Link } from "react-router-dom";

function Lyrics() {
  const [lyrics, setLyrics] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  // ------------------------------------------
  // SONG NAME
  // ------------------------------------------

  const songName =
    localStorage.getItem("uploadedSongName") ||
    localStorage.getItem("songName") ||
    "Uploaded Song";

  // ------------------------------------------
  // GET MOOD EMOJI
  // ------------------------------------------

  const getMoodEmoji = (mood) => {
    if (mood === "Happy") {
      return "😊";
    }

    if (mood === "Sad") {
      return "😢";
    }

    if (mood === "Relaxed") {
      return "😌";
    }

    if (mood === "Energetic") {
      return "⚡";
    }

    return "🎵";
  };

  // ------------------------------------------
  // ANALYZE LYRICS
  // ------------------------------------------

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
      
const response = await fetch(
  "https://ai-music-mood-backend.onrender.com/lyrics",
  {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            lyrics: lyrics,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Lyrics analysis failed."
        );
      }

      // Save result
      setAnalysisResult(data);
      setAnalyzed(true);

      // Save lyrics analysis
      localStorage.setItem(
        "lyricsAnalysis",
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        "Lyrics API Error:",
        error
      );

      setError(
        "Unable to analyze lyrics. Please make sure the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  return (
    <div className="lyrics-page">

      <div className="lyrics-container">

        {/* BACK BUTTON */}

        <Link
          to="/mood-result"
          className="back-link"
        >
          ← Back to Mood Result
        </Link>

        {/* HEADER */}

        <div className="lyrics-header">

          <div className="lyrics-icon">
            📝
          </div>

          <h1>
            Lyrics Analysis
          </h1>

          <p>
            Analyze song lyrics to understand
            their emotional meaning.
          </p>

        </div>

        {/* SONG CARD */}

        <div className="lyrics-song-card">

          <div className="lyrics-song-icon">
            🎵
          </div>

          <div>

            <span>
              YOUR UPLOADED SONG
            </span>

            <h2>
              {songName}
            </h2>

          </div>

        </div>

        {/* LYRICS INPUT */}

        <div className="lyrics-card">

          <h2>
            📝 Enter Song Lyrics
          </h2>

          <p className="lyrics-description">
            Paste the lyrics of your song
            below for AI-based emotional
            analysis.
          </p>

          <textarea
            className="lyrics-textarea"
            value={lyrics}
            onChange={(e) =>
              setLyrics(e.target.value)
            }
            placeholder="Enter or paste your song lyrics here..."
            rows="10"
          ></textarea>

          {/* ANALYZE BUTTON */}

          <button
            className="analyze-lyrics-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading
              ? "⏳ Analyzing Lyrics..."
              : "🤖 Analyze Lyrics"}
          </button>

          {/* ERROR */}

          {error && (
            <div className="lyrics-error">
              ❌ {error}
            </div>
          )}

        </div>

        {/* RESULT */}

        {analyzed &&
          analysisResult && (

          <div className="lyrics-result-card">

            {/* RESULT HEADER */}

            <div className="lyrics-result-title">

              <span>
                🤖
              </span>

              <div>

                <h2>
                  AI Lyrics Analysis
                </h2>

                <p>
                  Emotional analysis completed
                </p>

              </div>

            </div>

            {/* MOOD RESULT */}

            <div className="lyrics-mood-result">

              <div className="lyrics-mood-icon">

                {getMoodEmoji(
                  analysisResult.mood
                )}

              </div>

              <div>

                <span>
                  DETECTED MOOD
                </span>

                <h2>
                  {analysisResult.mood}
                </h2>

              </div>

            </div>

            {/* STATS */}

            <div className="lyrics-stats">

              {/* CONFIDENCE */}

              <div className="lyrics-stat">

                <span>
                  🎯
                </span>

                <div>

                  <small>
                    AI Confidence
                  </small>

                  <strong>
                    {analysisResult.confidence}%
                  </strong>

                </div>

              </div>

              {/* STATUS */}

              <div className="lyrics-stat">

                <span>
                  📝
                </span>

                <div>

                  <small>
                    Lyrics Status
                  </small>

                  <strong>
                    Analyzed
                  </strong>

                </div>

              </div>

            </div>

            {/* EMOTIONAL MEANING */}

            <div className="lyrics-emotion-box">

              <h3>
                💭 Emotional Meaning
              </h3>

              <p>
                {analysisResult.emotional_meaning}
              </p>

            </div>

            {/* KEYWORDS */}

            <div className="lyrics-keywords">

              <h3>
                🔑 Emotional Keywords
              </h3>

              <div className="keyword-list">

                {analysisResult.keywords &&
                analysisResult.keywords.length > 0 ? (

                  analysisResult.keywords.map(
                    (keyword, index) => (

                      <span
                        className="keyword-tag"
                        key={index}
                      >
                        {keyword}
                      </span>

                    )
                  )

                ) : (

                  <span className="keyword-tag">
                    No specific keywords found
                  </span>

                )}

              </div>

            </div>

            {/* LYRICS LENGTH */}

            <div className="lyrics-length">

              📝 Lyrics analyzed:

              <strong>
                {" "}
                {analysisResult.lyrics_length}
                {" "}
                characters
              </strong>

            </div>

          </div>

        )}

        {/* BOTTOM BUTTON */}

        <div className="lyrics-actions">

          <Link
            to="/mood-result"
            className="lyrics-back-btn"
          >
            ← Back to Mood Result
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Lyrics;