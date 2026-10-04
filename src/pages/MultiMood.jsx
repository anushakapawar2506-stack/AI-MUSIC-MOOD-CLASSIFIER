import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MultiMood() {
  const [songName, setSongName] = useState("Uploaded Song");
  const [moods, setMoods] = useState([]);
  const [journey, setJourney] = useState([]);
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

        // Dynamic moods
        if (Array.isArray(data.moods)) {
          setMoods(data.moods);
        }

        // Dynamic journey
        if (Array.isArray(data.journey)) {
          setJourney(data.journey);
        }
      } catch (error) {
        console.error(
          "Multi-Mood data parsing error:",
          error
        );
      }
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

  // ==============================
  // CALCULATE ACTUAL MOOD CHANGES
  // ==============================

  const getMoodChanges = () => {
    if (!Array.isArray(journey) || journey.length < 2) {
      return 0;
    }

    let changes = 0;

    for (let i = 1; i < journey.length; i++) {
      const previousMood =
        String(
          journey[i - 1]?.mood || ""
        ).toLowerCase();

      const currentMood =
        String(
          journey[i]?.mood || ""
        ).toLowerCase();

      if (
        previousMood &&
        currentMood &&
        previousMood !== currentMood
      ) {
        changes++;
      }
    }

    return changes;
  };

  const moodChanges = getMoodChanges();

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
                DETECTED MOODS
            ============================== */}

            <div className="analysis-card">

              <h2>
                🎭 Detected Moods
              </h2>

              <p>
                The AI detected multiple moods in
                different parts of your song.
              </p>

              <div className="multi-mood-list">

                {moods.map((item, index) => {

                  const moodName =
                    item.mood || "Unknown";

                  const percentage =
                    Number(
                      item.percentage || 0
                    );

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
                            {percentage}%
                          </span>

                        </div>

                        {/* PROGRESS BAR */}

                        <div className="multi-mood-bar">

                          <div
                            className="multi-mood-progress"
                            style={{
                              width:
                                `${percentage}%`
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
                })}

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

                {/* ACTUAL MOOD CHANGES */}

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

              </div>

            </div>

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