
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

    try {
      // 1. Read Multi-Mood data
      const savedMultiMoodData =
        localStorage.getItem("multiMoodData");

      if (savedMultiMoodData) {
        const data = JSON.parse(savedMultiMoodData);

        console.log("MULTI-MOOD DATA:", data);

        if (
          data.scores &&
          typeof data.scores === "object" &&
          !Array.isArray(data.scores)
        ) {
          const moodArray = Object.entries(data.scores)
            .map(([mood, percentage]) => ({
              mood,
              percentage: Math.max(
                0,
                Math.min(100, Number(percentage) || 0)
              ),
            }))
            .sort((a, b) => b.percentage - a.percentage);

          setMoods(moodArray);

          setDominantMood(
            data.dominant_mood || moodArray[0]?.mood || ""
          );
        }
      }

      // 2. Calculate actual chronological mood changes
      const savedTransitionData =
        localStorage.getItem("moodTransitionData");

      let calculatedChanges = null;

      if (savedTransitionData) {
        const transitionData = JSON.parse(savedTransitionData);

        console.log("MOOD TRANSITION DATA:", transitionData);

        // Prefer chronological sections/segments because
        // repeated transitions may not represent separate changes.
        const sections = [
          ...(Array.isArray(transitionData.sections)
            ? transitionData.sections
            : []),
          ...(Array.isArray(transitionData.segments)
            ? transitionData.segments
            : []),
        ];

        const getSectionMood = (item) =>
          item.mood ??
          item.predicted_mood ??
          item.predictedMood ??
          item.detected_mood ??
          item.detectedMood ??
          item.dominant_mood ??
          item.dominantMood ??
          item.emotion ??
          null;

        const sectionMoods = sections
          .map(getSectionMood)
          .filter(
            (mood) =>
              typeof mood === "string" && mood.trim() !== ""
          );

        if (sectionMoods.length > 0) {
          calculatedChanges = 0;

          for (let i = 1; i < sectionMoods.length; i++) {
            if (
              sectionMoods[i].trim().toLowerCase() !==
              sectionMoods[i - 1].trim().toLowerCase()
            ) {
              calculatedChanges++;
            }
          }
        } else {
          // Fallback to explicit transition pairs.
          const transitions = Array.isArray(
            transitionData.transitions
          )
            ? transitionData.transitions
            : [];

          const pairs = transitions
            .map((item) => ({
              from:
                item.from_mood ??
                item.fromMood ??
                item.from ??
                item.previous_mood ??
                item.previousMood ??
                item.start_mood ??
                item.startMood,

              to:
                item.to_mood ??
                item.toMood ??
                item.to ??
                item.next_mood ??
                item.nextMood ??
                item.current_mood ??
                item.currentMood ??
                item.end_mood ??
                item.endMood,
            }))
            .filter(
              (item) =>
                typeof item.from === "string" &&
                typeof item.to === "string"
            );

          if (pairs.length > 0) {
            calculatedChanges = pairs.filter(
              (item) =>
                item.from.trim().toLowerCase() !==
                item.to.trim().toLowerCase()
            ).length;
          }
        }
      }

      // 3. Use chronological calculation first.
      // If unavailable, use the backend count if provided.
      if (calculatedChanges !== null) {
        setMoodChanges(calculatedChanges);
      } else {
        const savedMultiMoodData =
          localStorage.getItem("multiMoodData");

        if (savedMultiMoodData) {
          const data = JSON.parse(savedMultiMoodData);

          const backendCount =
            data.mood_changes ?? data.moodChanges;

          if (
            backendCount !== undefined &&
            backendCount !== null &&
            Number.isFinite(Number(backendCount))
          ) {
            setMoodChanges(
              Math.max(0, Number(backendCount))
            );
          }
        }

        if (calculatedChanges === null) {
          console.warn(
            "Chronological mood changes unavailable."
          );
        }
      }
    } catch (error) {
      console.error("Multi-Mood parsing error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mood emoji
  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: "😊",
      sad: "😢",
      relaxed: "😌",
      energetic: "⚡",
      aggressive: "🔥",
      romantic: "❤️",
      dramatic: "🎭",
    };

    return (
      emojis[String(mood || "").toLowerCase()] || "🎵"
    );
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

  // These are scores, not chronological transitions.
  const strongestMoods = moods.slice(0, 2);

  return (
    <div className="mood-result-page">
      <div className="mood-result-container">
        <Link to="/dashboard" className="result-back">
          ← Back to Dashboard
        </Link>

        <div className="result-header">
          <div className="result-main-icon">🎭</div>
          <h1>Multi-Mood Detection</h1>
          <p>
            Detect multiple emotional moods present
            throughout your uploaded song.
          </p>
        </div>

        <div className="song-result-card">
          <div className="song-icon">🎵</div>
          <div>
            <span>ANALYZED SONG</span>
            <h3>{songName}</h3>
          </div>
        </div>

        {loading ? (
          <div className="analysis-card">
            <h2>⏳ Loading Analysis...</h2>
            <p>Please wait while the result is loaded.</p>
          </div>
        ) : moods.length === 0 ? (
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
                {moods.map((item) => (
                  <div
                    className="multi-mood-item"
                    key={item.mood}
                  >
                    <div className="multi-mood-icon">
                      {getMoodEmoji(item.mood)}
                    </div>

                    <div className="multi-mood-info">
                      <div className="multi-mood-title">
                        <strong>{item.mood}</strong>
                        <span>
                          {item.percentage.toFixed(0)}%
                        </span>
                      </div>

                      <div className="multi-mood-bar">
                        <div
                          className="multi-mood-progress"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>

                      <small>
                        {getMoodDescription(item.mood)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ANALYSIS SUMMARY */}
            <div className="analysis-card">
              <h2>📊 Analysis Summary</h2>

              <div style={summaryGridStyle}>
                <div style={summaryCardStyle}>
                  <strong style={summaryValueStyle}>
                    {moods.length}
                  </strong>
                  <span>Detected Moods</span>
                </div>

                <div style={summaryCardStyle}>
                  <strong style={summaryValueStyle}>
                    {moodChanges ?? "—"}
                  </strong>
                  <span>Mood Changes</span>
                </div>

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

              {moodChanges === null && (
                <p style={{ marginTop: "14px" }}>
                  Chronological mood-change data is
                  unavailable. Analyze the song again
                  to refresh its transition data.
                </p>
              )}
            </div>

            {/* EMOTIONAL PROFILE */}
            <div className="analysis-card">
              <h2>🧠 Emotional Profile</h2>

              <p>
                These are the strongest moods according
                to their multi-mood scores. They are not
                chronological transitions.
              </p>

              <div style={profileGridStyle}>
                {strongestMoods.map((item) => (
                  <div
                    key={item.mood}
                    style={profileCardStyle}
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

              <p style={{ fontSize: "14px", marginTop: "18px" }}>
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

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "15px",
  marginTop: "20px",
};

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

const profileGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
  marginTop: "20px",
};

const profileCardStyle = {
  padding: "12px 18px",
  background: "#f8f8ff",
  borderRadius: "12px",
  textAlign: "center",
  fontWeight: "600",
};

export default MultiMood;
