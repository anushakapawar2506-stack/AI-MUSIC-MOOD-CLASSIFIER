import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MoodTransition() {
  const [songName, setSongName] = useState("Uploaded Music");
  const [transitionData, setTransitionData] = useState(null);

  useEffect(() => {
    const savedSongName =
      localStorage.getItem("uploadedSongName");

    const savedTransitionData =
      localStorage.getItem("moodTransitionData");

    const savedMoodData =
      localStorage.getItem("moodData");

    if (savedSongName) {
      setSongName(savedSongName);
    }

    if (savedTransitionData) {
      try {
        setTransitionData(
          JSON.parse(savedTransitionData)
        );
      } catch (error) {
        console.error(
          "Error reading transition data:",
          error
        );
      }
    } else if (savedMoodData) {
      try {
        const moodData =
          JSON.parse(savedMoodData);

        setTransitionData({
          success: true,
          transitions: [],
          confidence:
            moodData.confidence || 0,
        });
      } catch (error) {
        console.error(
          "Error reading mood data:",
          error
        );
      }
    }
  }, []);

  // ==========================================
  // MOOD EMOJI
  // ==========================================

  const getMoodEmoji = (mood) => {
    const moodName =
      String(mood || "").toLowerCase();

    if (moodName.includes("happy")) return "😊";
    if (moodName.includes("sad")) return "😢";
    if (moodName.includes("relaxed")) return "😌";
    if (moodName.includes("energetic")) return "⚡";
    if (moodName.includes("aggressive")) return "🔥";
    if (moodName.includes("romantic")) return "❤️";
    if (moodName.includes("dramatic")) return "🎭";

    return "🎵";
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (seconds) => {
    const totalSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const remainingSeconds =
      Math.floor(totalSeconds % 60);

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  // ==========================================
  // GET ACTUAL TRANSITION TIME
  // ==========================================

  const getTransitionTime = (transition) => {

    // ------------------------------------------
    // BACKEND "at" VALUE
    // ------------------------------------------

    if (
      transition.at !== undefined &&
      transition.at !== null
    ) {
      const transitionStart =
        Number(transition.at);

      const transitionEnd =
        transition.end !== undefined &&
        transition.end !== null
          ? Number(transition.end)
          : transitionStart + 10;

      return `${formatTime(
        transitionStart
      )} – ${formatTime(
        transitionEnd
      )}`;
    }

    // ------------------------------------------
    // BACKEND START / END
    // ------------------------------------------

    const start =
      transition.start ??
      transition.start_time ??
      transition.from_time ??
      transition.section_start;

    const end =
      transition.end ??
      transition.end_time ??
      transition.to_time ??
      transition.section_end;

    if (
      start !== undefined &&
      start !== null &&
      end !== undefined &&
      end !== null
    ) {
      return `${formatTime(
        start
      )} – ${formatTime(
        end
      )}`;
    }

    // ------------------------------------------
    // OTHER TIMESTAMP
    // ------------------------------------------

    if (transition.time) {
      return transition.time;
    }

    if (transition.timestamp) {
      return transition.timestamp;
    }

    // ------------------------------------------
    // FINAL FALLBACK
    // ------------------------------------------

    return "Transition time unavailable";
  };

  // ==========================================
  // DATA
  // ==========================================

  const transitions =
    transitionData?.transitions || [];

  const confidence =
    transitionData?.confidence ??
    JSON.parse(
      localStorage.getItem("moodData") || "{}"
    )?.confidence ??
    0;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mood-transition-page">

      <div className="mood-transition-container">

        {/* BACK */}

        <Link
          to="/mood-result"
          className="mood-transition-back"
        >
          ← Back to Mood Result
        </Link>

        {/* HEADER */}

        <div className="mood-transition-header">

          <div className="mood-transition-icon">
            🔄
          </div>

          <h1>
            Mood Transition
          </h1>

          <p>
            Detect how the emotional mood changes
            throughout the song.
          </p>

        </div>

        {/* SONG CARD */}

        <div className="transition-song-card">

          <div className="transition-song-icon">
            🎵
          </div>

          <div>

            <h3>
              Your Uploaded Song
            </h3>

            <p>
              Song:{" "}
              <strong>
                {songName}
              </strong>
            </p>

          </div>

        </div>

        {/* TRANSITIONS */}

        {transitions.length === 0 ? (

          <div className="transition-empty-card">

            <div className="empty-icon">
              🎵
            </div>

            <h3>
              No Major Mood Transition Detected
            </h3>

            <p>
              The song maintains a relatively
              consistent emotional mood.
            </p>

          </div>

        ) : (

          <div className="transition-list">

            {transitions.map(
              (transition, index) => {

                const transitionConfidence =
                  transition.confidence !==
                  undefined &&
                  transition.confidence !== null
                    ? Number(
                        transition.confidence
                      )
                    : Number(confidence);

                return (

                  <div
                    className="transition-card"
                    key={index}
                  >

                    {/* ACTUAL TIME */}

                    <div className="transition-time">

                      ⏱️{" "}
                      {getTransitionTime(
                        transition
                      )}

                    </div>

                    {/* TRANSITION FLOW */}

                    <div className="transition-moods">

                      <span className="mood-badge">

                        {getMoodEmoji(
                          transition.from
                        )}{" "}

                        {transition.from}

                      </span>

                      <span className="transition-arrow">
                        →
                      </span>

                      <span className="mood-badge">

                        {getMoodEmoji(
                          transition.to
                        )}{" "}

                        {transition.to}

                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="transition-description">

                      💡 Emotional features changed
                      during this analyzed section.

                    </p>

                    {/* CONFIDENCE */}

                    <div className="transition-confidence">

                      🎯 Transition Confidence:{" "}

                      <strong>
                        {transitionConfidence.toFixed(
                          0
                        )}
                        %
                      </strong>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* OVERALL CONFIDENCE */}

        <div className="overall-transition-confidence">

          <span>
            🎯 Overall Analysis Confidence
          </span>

          <strong>
            {Number(confidence).toFixed(0)}%
          </strong>

        </div>

      </div>

    </div>
  );
}

export default MoodTransition;