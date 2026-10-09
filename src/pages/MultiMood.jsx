
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MultiMood() {
  const [songName, setSongName] = useState("Uploaded Song");
  const [moods, setMoods] = useState([]);
  const [dominantMood, setDominantMood] = useState("");
  const [moodChanges, setMoodChanges] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedSong = localStorage.getItem("uploadedSongName");

      if (savedSong) {
        setSongName(savedSong);
      }

      // ------------------------------------------
      // 1. Read Multi-Mood scores
      // ------------------------------------------
      const savedMultiMoodData =
        localStorage.getItem("multiMoodData");

      let multiMoodData = null;

      if (savedMultiMoodData) {
        multiMoodData = JSON.parse(savedMultiMoodData);

        console.log("MULTI-MOOD DATA:", multiMoodData);

        const scores =
          multiMoodData.scores ??
          multiMoodData.moods ??
          multiMoodData.mood_scores;

        if (
          scores &&
          typeof scores === "object" &&
          !Array.isArray(scores)
        ) {
          const moodArray = Object.entries(scores)
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
            multiMoodData.dominant_mood ??
              multiMoodData.dominantMood ??
              moodArray[0]?.mood ??
              ""
          );
        }
      }

      // ------------------------------------------
      // 2. Read chronological Mood Transition data
      // ------------------------------------------
      const savedTransitionData =
        localStorage.getItem("moodTransitionData");

      let transitionData = null;
      let calculatedChanges = null;

      if (savedTransitionData) {
        transitionData = JSON.parse(savedTransitionData);

        console.log("MOOD TRANSITION DATA:", transitionData);
      }

      if (
        transitionData &&
        typeof transitionData === "object"
      ) {
        // Support common response formats.
        const possibleSectionArrays = [
          transitionData.sections,
          transitionData.segments,
          transitionData.timeline,
          transitionData.mood_timeline,
          transitionData.moodTimeline,
          transitionData.results,
        ];

        let sections = possibleSectionArrays.find(
          (value) => Array.isArray(value) && value.length > 0
        );

        // Some APIs nest the chronological data.
        if (!sections && transitionData.data) {
          const nested = transitionData.data;

          if (Array.isArray(nested)) {
            sections = nested;
          } else if (typeof nested === "object") {
            sections =
              nested.sections ??
              nested.segments ??
              nested.timeline ??
              nested.mood_timeline ??
              nested.moodTimeline;
          }
        }

        const getMood = (item) => {
          if (typeof item === "string") {
            return item.trim();
          }

          if (!item || typeof item !== "object") {
            return "";
          }

          const value =
            item.mood ??
            item.predicted_mood ??
            item.predictedMood ??
            item.detected_mood ??
            item.detectedMood ??
            item.dominant_mood ??
            item.dominantMood ??
            item.emotion ??
            item.label ??
            item.prediction;

          return typeof value === "string" ? value.trim() : "";
        };

        if (Array.isArray(sections) && sections.length > 0) {
          const chronologicalMoods = sections
            .map(getMood)
            .filter(Boolean);

          if (chronologicalMoods.length > 0) {
            calculatedChanges = 0;

            for (
              let index = 1;
              index < chronologicalMoods.length;
              index++
            ) {
              const previous =
                chronologicalMoods[index - 1].toLowerCase();

              const current =
                chronologicalMoods[index].toLowerCase();

              if (previous !== current) {
                calculatedChanges++;
              }
            }

            console.log(
              "Chronological moods:",
              chronologicalMoods
            );

            console.log(
              "Calculated mood changes:",
              calculatedChanges
            );
          }
        }

        // Fallback: count changes from explicit transition pairs.
        // Use this only when section/timeline data is unavailable.
        if (calculatedChanges === null) {
          const possibleTransitionArrays = [
            transitionData.transitions,
            transitionData.mood_transitions,
            transitionData.moodTransitions,
          ];

          let transitions = possibleTransitionArrays.find(
            (value) => Array.isArray(value) && value.length > 0
          );

          if (!transitions && Array.isArray(transitionData.data)) {
            transitions = transitionData.data;
          }

          if (Array.isArray(transitions) && transitions.length > 0) {
            const pairs = transitions
              .map((item) => {
                if (!item || typeof item !== "object") {
                  return null;
                }

                const from =
                  item.from_mood ??
                  item.fromMood ??
                  item.from ??
                  item.previous_mood ??
                  item.previousMood ??
                  item.start_mood ??
                  item.startMood;

                const to =
                  item.to_mood ??
                  item.toMood ??
                  item.to ??
                  item.next_mood ??
                  item.nextMood ??
                  item.current_mood ??
                  item.currentMood ??
                  item.end_mood ??
                  item.endMood;

                if (
                  typeof from !== "string" ||
                  typeof to !== "string"
                ) {
                  return null;
                }

                return {
                  from: from.trim(),
                  to: to.trim(),
                };
              })
              .filter(Boolean);

            if (pairs.length > 0) {
              calculatedChanges = pairs.filter(
                (pair) =>
                  pair.from.toLowerCase() !==
                  pair.to.toLowerCase()
              ).length;
            }
          }
        }
      }

      // ------------------------------------------
      // 3. Set count
      // Do not trust multiMoodData.mood_changes as
      // a chronological count when sequence is absent.
      // ------------------------------------------
      if (calculatedChanges !== null) {
        setMoodChanges(calculatedChanges);
      } else {
        setMoodChanges(null);

        console.warn("Chronological mood changes unavailable.", {
          transitionDataKeys:
            transitionData && typeof transitionData === "object"
              ? Object.keys(transitionData)
              : [],
          multiMoodDataKeys:
            multiMoodData && typeof multiMoodData === "object"
              ? Object.keys(multiMoodData)
              : [],
        });
      }
    } catch (error) {
      console.error("Multi-Mood parsing error:", error);
      setMoodChanges(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------
  // Mood emoji
  // ------------------------------------------
  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: "😊",
      sad: "😢",
      relaxed: "😌",
      energetic: "⚡",
      aggressive: "🔥",
      romantic: "❤️",
      dramatic: "🎭",
      neutral: "😐",
    };

    return emojis[String(mood || "").toLowerCase()] || "🎵";
  };

  // ------------------------------------------
  // Mood description
  // ------------------------------------------
  const getMoodDescription = (mood) => {
    const descriptions = {
      happy: "Positive and cheerful feeling",
      sad: "Emotional and low-energy feeling",
      relaxed: "Calm and peaceful feeling",
      energetic: "High-energy and active feeling",
      aggressive: "Strong and intense emotional feeling",
      romantic: "Warm and affectionate emotional feeling",
      dramatic: "Intense and expressive emotional feeling",
      neutral: "Balanced or neutral emotional feeling",
    };

    return (
      descriptions[String(mood || "").toLowerCase()] ||
      "Detected emotional mood"
    );
  };

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
            Detect multiple emotional moods present throughout
            your uploaded song.
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
            <p>Please upload and analyze a music file first.</p>
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
                  {dominantMood || "Unknown"}
                </h2>

                <p>
                  This is the strongest emotional mood detected
                  in the song.
                </p>
              </div>
            </div>

            {/* DETECTED MOODS */}
            <div className="analysis-card">
              <h2>🎭 Detected Moods</h2>
              <p>
                The AI detected multiple emotional moods in the
                uploaded song.
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
                  Chronological mood-change data is unavailable.
                  Open Mood Timeline or Mood Transition to inspect
                  the song's chronological results.
                </p>
              )}
            </div>

            {/* EMOTIONAL PROFILE */}
            <div className="analysis-card">
              <h2>🧠 Emotional Profile</h2>

              <p>
                These are the strongest moods according to their
                multi-mood scores. They are not chronological
                transitions.
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

              <p
                style={{
                  fontSize: "14px",
                  marginTop: "18px",
                }}
              >
                To see when a mood changes during the song, open
                Mood Timeline or Mood Transition.
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
