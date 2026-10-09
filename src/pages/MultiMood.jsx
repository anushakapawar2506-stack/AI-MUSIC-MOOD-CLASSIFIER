
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MultiMood() {
  const [songName, setSongName] = useState("Uploaded Song");
  const [moods, setMoods] = useState([]);
  const [dominantMood, setDominantMood] = useState("");
  const [moodChanges, setMoodChanges] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSong = localStorage.getItem("uploadedSongName");

    if (savedSong) {
      setSongName(savedSong);
    }

    const savedMultiMoodData =
      localStorage.getItem("multiMoodData");

    if (!savedMultiMoodData) {
      console.warn("Multi-Mood data not found.");
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(savedMultiMoodData);

      console.log("MULTI-MOOD DATA:", data);

      // 1. Read mood scores
      if (
        data.scores &&
        typeof data.scores === "object" &&
        !Array.isArray(data.scores)
      ) {
        const moodArray = Object.entries(data.scores)
          .map(([mood, percentage]) => ({
            mood,
            percentage: Number(percentage) || 0,
          }))
          .sort((a, b) => b.percentage - a.percentage);

        setMoods(moodArray);

        // Use backend dominant mood, or fall back to
        // the highest-scoring mood.
        setDominantMood(
          data.dominant_mood || moodArray[0]?.mood || ""
        );
      } else {
        console.warn("Valid mood scores were not found.");
      }

      // 2. Read actual mood-change count from backend.
      // Do not calculate transitions from sorted mood scores.
      if (
        data.mood_changes !== undefined &&
        data.mood_changes !== null &&
        Number.isFinite(Number(data.mood_changes))
      ) {
        setMoodChanges(
          Math.max(0, Number(data.mood_changes))
        );
      }
    } catch (error) {
      console.error("Multi-Mood parsing error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mood emoji
  const getMoodEmoji = (mood) => {
    const name = String(mood || "").toLowerCase();

    const emojis = {
      happy: "😊",
      sad: "😢",
      relaxed: "😌",
      energetic: "⚡",
      aggressive: "🔥",
      romantic: "❤️",
      dramatic: "🎭",
    };

    return emojis[name] || "🎵";
  };

  // Mood description
  const getMoodDescription = (mood) => {
    const descriptions = {
      happy: "Positive and cheerful feeling",
      sad: "Emotional and low-energy feeling",
      relaxed: "Calm and peaceful feeling",
      energetic: "High-energy and active feeling",
      aggressive: "Strong and intense emotional feeling",
      romantic: "Warm and affectionate emotional feeling",
      dramatic: "Intense and expressive emotional feeling",
    };

    return (
      descriptions[String(mood || "").toLowerCase()] ||
      "Detected emotional mood"
    );
  };

  // Show the top two scores as a profile, not as
  // a chronological mood journey.
  const strongestMoods = moods.slice(0, 2);

  return (
    <div className="mood-result-page">
      <div className="mood-result-container">

        {/* BACK */}
        <Link to="/dashboard" className="result-back">
          ← Back to Dashboard
        </Link>

        {/* HEADER */}
        <div className="result-header">
          <div className="result-main-icon">🎭</div>

          <h1>Multi-Mood Detection</h1>

          <p>
            Detect multiple emotional moods present
            throughout your uploaded song.
          </p>
        </div>

        {/* SONG CARD */}
        <div className="song-result-card">
          <div className="song-icon">🎵</div>

          <div>
            <span>ANALYZED SONG</span>
            <h3>{songName}</h3>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="analysis-card">
            <h2>⏳ Loading Analysis...</h2>
            <p>Please wait while the result is loaded.</p>
          </div>
        ) : moods.length === 0 ? (
          /* NO DATA */
          <div className="analysis-card">
            <h2>🎭 No Multi-Mood Data</h2>

            <p>
              Please upload and analyze a music file first.
            </p>

            <Link
              to="/upload"
              className="result-action-btn"
              style={{
                display: "inline-flex",
                marginTop: "20px",
              }}
            >
              🎵 <span>Upload Music</span>
            </Link>
          </div>
        ) : (
          <>
            {/* DOMINANT MOOD */}
            <div className="analysis-card">
              <h2>👑 Dominant Mood</h2>

              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "55px" }}>
                  {getMoodEmoji(dominantMood)}
                </div>

                <h2 style={{ marginTop: "10px" }}>
                  {dominantMood}
                </h2>

                <p>
                  This is the strongest emotional mood
                  detected in the song.
                </p>
              </div>
            </div>

            {/* DETECTED MOODS */}
            <div className="analysis-card">
              <h2>🎭 Detected Moods</h2>

              <p>
                The AI detected multiple emotional moods
                in the uploaded song.
              </p>

              <div className="multi-mood-list">
                {moods.map((item, index) => {
                  const moodName = item.mood || "Unknown";
                  const percentage = Math.max(
                    0,
                    Math.min(100, item.percentage)
                  );

                  return (
                    <div
                      className="multi-mood-item"
                      key={`${moodName}-${index}`}
                    >
                      <div className="multi-mood-icon">
                        {getMoodEmoji(moodName)}
                      </div>

                      <div className="multi-mood-info">
                        <div className="multi-mood-title">
                          <strong>{moodName}</strong>

                          <span>
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>

                        <div className="multi-mood-bar">
                          <div
                            className="multi-mood-progress"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <small>
                          {getMoodDescription(moodName)}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ANALYSIS SUMMARY */}
            <div className="analysis-card">
              <h2>📊 Analysis Summary</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "15px",
                  marginTop: "20px",
                }}
              >
                {/* DETECTED MOODS */}
                <div style={summaryCardStyle}>
                  <strong style={summaryValueStyle}>
                    {moods.length}
                  </strong>
                  <span>Detected Moods</span>
                </div>

                {/* MOOD CHANGES */}
                <div style={summaryCardStyle}>
                  <strong style={summaryValueStyle}>
                    {moodChanges ?? "—"}
                  </strong>
                  <span>Mood Changes</span>
                </div>

                {/* DOMINANT MOOD */}
                <div style={summaryCardStyle}>
                  <strong
                    style={{
                      ...summaryValueStyle,
                      fontSize: "20px",
                    }}
                  >
                    {dominantMood || "—"}
                  </strong>
                  <span>Dominant Mood</span>
                </div>
              </div>
            </div>

            {/* EMOTIONAL PROFILE */}
            <div className="analysis-card">
              <h2>🧠 Emotional Profile</h2>

              <p>
                These are the strongest moods according to
                their multi-mood scores. They are not
                chronological transitions.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {strongestMoods.map((item) => (
                  <div
                    key={item.mood}
                    style={{
                      padding: "12px 18px",
                      background: "#f8f8ff",
                      borderRadius: "12px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    <div style={{ fontSize: "28px" }}>
                      {getMoodEmoji(item.mood)}
                    </div>

                    <div>{item.mood}</div>

                    <div
                      style={{
                        color: "#667eea",
                        marginTop: "4px",
                      }}
                    >
                      {item.percentage.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: "14px",
                  marginTop: "18px",
                }}
              >
                To see when a mood changes during the song,
                open Mood Timeline or Mood Transition.
              </p>
            </div>
          </>
        )}

        {/* NAVIGATION */}
        <div className="result-actions">
          <Link
            to="/mood-result"
            className="result-action-btn"
          >
            😊 <span>Mood Result</span>
          </Link>

          <Link
            to="/mood-timeline"
            className="result-action-btn"
          >
            📈 <span>Mood Timeline</span>
          </Link>

          <Link
            to="/mood-transition"
            className="result-action-btn"
          >
            🔄 <span>Mood Transition</span>
          </Link>

          <Link
            to="/feedback"
            className="result-feature-btn"
          >
            💬 <span>Give Feedback</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const summaryCardStyle = {
  padding: "18px",
  background: "#f8f8ff",
  borderRadius: "15px",
  textAlign: "center",
};

const summaryValueStyle = {
  display: "block",
  fontSize: "25px",
  color: "#667eea",
  marginBottom: "5px",
};

export default MultiMood;