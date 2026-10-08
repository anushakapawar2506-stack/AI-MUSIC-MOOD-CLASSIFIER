import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MultiMood() {
  const [songName, setSongName] = useState("Uploaded Song");
  const [moods, setMoods] = useState([]);
  const [journey, setJourney] = useState([]);
  const [dominantMood, setDominantMood] = useState("");
  const [moodChanges, setMoodChanges] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ==============================
    // GET UPLOADED SONG NAME
    // ==============================

    const savedSong =
      localStorage.getItem("uploadedSongName");

    if (savedSong) {
      setSongName(savedSong);
    }

    // ==============================
    // GET MULTI-MOOD DATA
    // ==============================

    const savedMultiMoodData =
      localStorage.getItem("multiMoodData");

    if (savedMultiMoodData) {
      try {
        const data =
          JSON.parse(savedMultiMoodData);

        console.log(
          "🎭 MULTI-MOOD DATA:",
          data
        );

        // ==========================================
        // BACKEND ACTUAL STRUCTURE:
        //
        // data.scores = {
        //   Energetic: 100,
        //   Happy: 97,
        //   Relaxed: 22,
        //   Sad: 25
        // }
        // ==========================================

        if (
          data.scores &&
          typeof data.scores === "object"
        ) {
          const moodArray =
            Object.entries(data.scores)
              .map(
                ([mood, percentage]) => ({
                  mood,
                  percentage: Number(
                    percentage
                  ) || 0
                })
              )
              .sort(
                (a, b) =>
                  b.percentage -
                  a.percentage
              );

          setMoods(moodArray);

          // Create emotional journey
          const detectedJourney =
            moodArray
              .filter(
                (item) =>
                  item.percentage > 50
              )
              .map(
                (item) => item.mood
              );

          setJourney(
            detectedJourney
          );
        }

        // ==========================================
        // DOMINANT MOOD
        // ==========================================

        if (data.dominant_mood) {
          setDominantMood(
            data.dominant_mood
          );
        }

        // ==========================================
        // MOOD CHANGES
        // ==========================================

        if (
          data.mood_changes !==
            undefined &&
          data.mood_changes !== null
        ) {
          setMoodChanges(
            Number(
              data.mood_changes
            ) || 0
          );
        }

      } catch (error) {
        console.error(
          "❌ Multi-Mood data parsing error:",
          error
        );
      }
    } else {
      console.warn(
        "⚠️ multiMoodData not found in localStorage"
      );
    }

    setLoading(false);
  }, []);

  // ==============================
  // MOOD EMOJI
  // ==============================

  const getMoodEmoji = (mood) => {
    const moodName =
      String(mood || "").toLowerCase();

    if (moodName === "happy") return "😊";
    if (moodName === "sad") return "😢";
    if (moodName === "relaxed") return "😌";
    if (moodName === "energetic") return "⚡";
    if (moodName === "aggressive") return "🔥";
    if (moodName === "romantic") return "❤️";
    if (moodName === "dramatic") return "🎭";

    return "🎵";
  };

  // ==============================
  // MOOD DESCRIPTION
  // ==============================

  const getMoodDescription = (mood) => {
    const moodName =
      String(mood || "").toLowerCase();

    if (moodName === "happy") {
      return "Positive and cheerful feeling";
    }

    if (moodName === "sad") {
      return "Emotional and low-energy feeling";
    }

    if (moodName === "relaxed") {
      return "Calm and peaceful feeling";
    }

    if (moodName === "energetic") {
      return "High-energy and active feeling";
    }

    if (moodName === "aggressive") {
      return "Strong and intense emotional feeling";
    }

    if (moodName === "romantic") {
      return "Warm and affectionate emotional feeling";
    }

    if (moodName === "dramatic") {
      return "Intense and expressive emotional feeling";
    }

    return "Detected emotional mood";
  };

  return (
    <div className="mood-result-page">

      <div className="mood-result-container">

        {/* ==============================
            BACK
        ============================== */}

        <Link
          to="/dashboard"
          className="result-back"
        >
          ← Back to Dashboard
        </Link>

        {/* ==============================
            HEADER
        ============================== */}

        <div className="result-header">

          <div className="result-main-icon">
            🎭
          </div>

          <h1>
            Multi-Mood Detection
          </h1>

          <p>
            Detect multiple emotional moods present
            throughout your uploaded song.
          </p>

        </div>

        {/* ==============================
            SONG CARD
        ============================== */}

        <div className="song-result-card">

          <div className="song-icon">
            🎵
          </div>

          <div>

            <span>
              ANALYZED SONG
            </span>

            <h3>
              {songName}
            </h3>

          </div>

        </div>

        {/* ==============================
            LOADING
        ============================== */}

        {loading ? (

          <div className="analysis-card">

            <h2>
              ⏳ Loading Analysis...
            </h2>

            <p>
              Please wait while the Multi-Mood
              result is being loaded.
            </p>

          </div>

        ) : moods.length === 0 ? (

          /* ==============================
             NO DATA
          ============================== */

          <div className="analysis-card">

            <h2>
              🎭 No Multi-Mood Data
            </h2>

            <p>
              Please upload and analyze a music
              file first.
            </p>

            <Link
              to="/upload"
              className="result-action-btn"
              style={{
                display: "inline-flex",
                marginTop: "20px"
              }}
            >
              🎵
              <span>
                Upload Music
              </span>
            </Link>

          </div>

        ) : (

          <>

            {/* ==============================
                DOMINANT MOOD
            ============================== */}

            <div className="analysis-card">

              <h2>
                👑 Dominant Mood
              </h2>

              <div
                style={{
                  textAlign: "center",
                  padding: "20px"
                }}
              >

                <div
                  style={{
                    fontSize: "55px"
                  }}
                >
                  {getMoodEmoji(
                    dominantMood
                  )}
                </div>

                <h2
                  style={{
                    marginTop: "10px"
                  }}
                >
                  {dominantMood}
                </h2>

                <p>
                  This is the strongest emotional
                  mood detected in the song.
                </p>

              </div>

            </div>


            {/* ==============================
                DETECTED MOODS
            ============================== */}

            <div className="analysis-card">

              <h2>
                🎭 Detected Moods
              </h2>

              <p>
                The AI detected multiple emotional
                moods in the uploaded song.
              </p>

              <div className="multi-mood-list">

                {moods.map(
                  (item, index) => {

                    const moodName =
                      item.mood ||
                      "Unknown";

                    const percentage =
                      Number(
                        item.percentage
                      ) || 0;

                    return (

                      <div
                        className="multi-mood-item"
                        key={`${moodName}-${index}`}
                      >

                        {/* MOOD ICON */}

                        <div className="multi-mood-icon">

                          {getMoodEmoji(
                            moodName
                          )}

                        </div>

                        {/* MOOD INFO */}

                        <div className="multi-mood-info">

                          <div className="multi-mood-title">

                            <strong>
                              {moodName}
                            </strong>

                            <span>
                              {percentage.toFixed(
                                0
                              )}%
                            </span>

                          </div>

                          {/* PROGRESS BAR */}

                          <div className="multi-mood-bar">

                            <div
                              className="multi-mood-progress"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    percentage
                                  )
                                )}%`
                              }}
                            />

                          </div>

                          <small>
                            {getMoodDescription(
                              moodName
                            )}
                          </small>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>


            {/* ==============================
                ANALYSIS SUMMARY
            ============================== */}

            <div className="analysis-card">

              <h2>
                📊 Analysis Summary
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "15px",
                  marginTop: "20px"
                }}
              >

                {/* DETECTED MOODS */}

                <div
                  style={{
                    padding: "18px",
                    background: "#f8f8ff",
                    borderRadius: "15px",
                    textAlign: "center"
                  }}
                >

                  <strong
                    style={{
                      display: "block",
                      fontSize: "25px",
                      color: "#667eea"
                    }}
                  >
                    {moods.length}
                  </strong>

                  <span>
                    Detected Moods
                  </span>

                </div>


                {/* MOOD CHANGES */}

                <div
                  style={{
                    padding: "18px",
                    background: "#f8f8ff",
                    borderRadius: "15px",
                    textAlign: "center"
                  }}
                >

                  <strong
                    style={{
                      display: "block",
                      fontSize: "25px",
                      color: "#667eea"
                    }}
                  >
                    {moodChanges}
                  </strong>

                  <span>
                    Mood Changes
                  </span>

                </div>


                {/* DOMINANT MOOD */}

                <div
                  style={{
                    padding: "18px",
                    background: "#f8f8ff",
                    borderRadius: "15px",
                    textAlign: "center"
                  }}
                >

                  <strong
                    style={{
                      display: "block",
                      fontSize: "25px",
                      color: "#667eea"
                    }}
                  >
                    {dominantMood || "—"}
                  </strong>

                  <span>
                    Dominant Mood
                  </span>

                </div>

              </div>

            </div>


            {/* ==============================
                EMOTIONAL JOURNEY
            ============================== */}

            {journey.length > 0 && (

              <div className="analysis-card">

                <h2>
                  🧠 Emotional Journey
                </h2>

                <p>
                  Strong emotional moods detected
                  throughout the analysis.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "20px",
                    fontSize: "20px",
                    fontWeight: "600"
                  }}
                >

                  {journey.map(
                    (mood, index) => (

                      <span
                        key={`${mood}-${index}`}
                      >

                        {index > 0 &&
                          " → "}

                        {getMoodEmoji(
                          mood
                        )}{" "}

                        {mood}

                      </span>

                    )
                  )}

                </div>

              </div>

            )}

          </>

        )}

        {/* ==============================
            ACTION BUTTONS
        ============================== */}

        <div className="result-actions">

          <Link
            to="/mood-result"
            className="result-action-btn"
          >
            😊
            <span>
              Mood Result
            </span>
          </Link>

          <Link
            to="/mood-timeline"
            className="result-action-btn"
          >
            📈
            <span>
              Mood Timeline
            </span>
          </Link>

          <Link
            to="/mood-transition"
            className="result-action-btn"
          >
            🔄
            <span>
              Mood Transition
            </span>
          </Link>

          <Link
            to="/feedback"
            className="result-feature-btn"
          >
            💬
            <span>
              Give Feedback
            </span>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default MultiMood;