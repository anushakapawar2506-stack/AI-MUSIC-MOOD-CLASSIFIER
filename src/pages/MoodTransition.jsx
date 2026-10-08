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
        const data = JSON.parse(savedTransitionData);

        console.log(
          "🔄 MOOD TRANSITION DATA:",
          data
        );

        setTransitionData(data);
      } catch (error) {
        console.error(
          "❌ Error reading transition data:",
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
          "❌ Error reading mood data:",
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
  // GET TRANSITION TIME
  // ==========================================

  const getTransitionTime = (transition) => {
    const start =
      transition?.start ??
      transition?.start_time ??
      transition?.startTime ??
      transition?.from_time ??
      transition?.section_start ??
      0;

    const end =
      transition?.end ??
      transition?.end_time ??
      transition?.endTime ??
      transition?.to_time ??
      transition?.section_end;

    if (
      end !== undefined &&
      end !== null
    ) {
      return `${formatTime(start)} – ${formatTime(end)}`;
    }

    return `${formatTime(start)} – ${formatTime(
      Number(start) + 10
    )}`;
  };

  // ==========================================
  // GET MOOD
  // ==========================================

  const getMood = (transition) => {
    return (
      transition?.mood ||
      transition?.current_mood ||
      transition?.currentMood ||
      "Unknown"
    );
  };

  // ==========================================
  // DATA
  // ==========================================

  const transitions =
    Array.isArray(
      transitionData?.transitions
    )
      ? transitionData.transitions
      : [];

  let confidence =
    transitionData?.confidence;

  if (
    confidence === undefined ||
    confidence === null
  ) {
    try {
      const savedMoodData =
        JSON.parse(
          localStorage.getItem(
            "moodData"
          ) || "{}"
        );

      confidence =
        savedMoodData?.confidence || 0;
    } catch {
      confidence = 0;
    }
  }

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

                const currentMood =
                  getMood(transition);

                const nextMood =
                  transitions[index + 1]
                    ? getMood(
                        transitions[index + 1]
                      )
                    : currentMood;

                const transitionConfidence =
                  transition?.confidence !==
                    undefined &&
                  transition?.confidence !==
                    null
                    ? Number(
                        transition.confidence
                      )
                    : Number(confidence) || 0;

                /*
                 * IMPORTANT:
                 *
                 * Backend returns:
                 *
                 * {
                 *   start: 0,
                 *   end: 10,
                 *   mood: "Happy",
                 *   confidence: 84
                 * }
                 *
                 * Therefore:
                 *
                 * currentMood = current section mood
                 * nextMood = next section mood
                 */

                const hasMoodChange =
                  index <
                    transitions.length - 1 &&
                  String(
                    currentMood
                  ).toLowerCase() !==
                    String(
                      nextMood
                    ).toLowerCase();

                return (

                  <div
                    className="transition-card"
                    key={index}
                  >

                    {/* TIME */}

                    <div className="transition-time">

                      ⏱️{" "}
                      {getTransitionTime(
                        transition
                      )}

                    </div>

                    {/* MOOD FLOW */}

                    <div className="transition-moods">

                      <span className="mood-badge">

                        {getMoodEmoji(
                          currentMood
                        )}{" "}

                        {currentMood}

                      </span>

                      <span className="transition-arrow">
                        →
                      </span>

                      <span className="mood-badge">

                        {getMoodEmoji(
                          nextMood
                        )}{" "}

                        {nextMood}

                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="transition-description">

                      {hasMoodChange
                        ? "💡 Emotional mood changed between these analyzed sections."
                        : "💡 Emotional features were analyzed during this section."}

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
            {Number(
              confidence || 0
            ).toFixed(0)}
            %
          </strong>

        </div>

      </div>

    </div>
  );
}

export default MoodTransition;