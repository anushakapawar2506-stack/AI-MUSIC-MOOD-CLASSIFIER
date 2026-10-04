import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Confidence() {
  const [songName, setSongName] =
    useState("Uploaded Music");

  const [mood, setMood] =
    useState("Unknown");

  const [confidence, setConfidence] =
    useState(0);

  const [intensity, setIntensity] =
    useState("Unknown");

  const [features, setFeatures] =
    useState(null);

  useEffect(() => {
    const savedSongName =
      localStorage.getItem(
        "uploadedSongName"
      );

    if (savedSongName) {
      setSongName(savedSongName);
    }

    const savedMoodData =
      localStorage.getItem(
        "moodData"
      );

    if (savedMoodData) {
      try {
        const data =
          JSON.parse(savedMoodData);

        setMood(
          data.mood || "Unknown"
        );

        setConfidence(
          Number(data.confidence) || 0
        );

        setIntensity(
          data.intensity || "Unknown"
        );

        setFeatures(
          data.features || null
        );

      } catch (error) {
        console.error(
          "Confidence data error:",
          error
        );
      }
    }
  }, []);

  const getMoodEmoji = () => {
    switch (mood) {
      case "Happy":
        return "😊";

      case "Sad":
        return "😔";

      case "Relaxed":
        return "😌";

      case "Energetic":
        return "⚡";

      default:
        return "🎵";
    }
  };

  return (
    <div className="confidence-page">

      <div className="confidence-container">

        <Link
          to="/mood-result"
          className="back-link"
        >
          ← Back to Mood Result
        </Link>

        {/* HEADER */}

        <div className="confidence-header">

          <div className="confidence-icon">
            🎯
          </div>

          <h1>
            Confidence Score
          </h1>

          <p>
            AI confidence level for the
            predicted music mood.
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="confidence-card">

          <h2>
            🎵 Your Uploaded Song
          </h2>

          <div className="confidence-song">

            <span>🎶</span>

            <strong>
              {songName}
            </strong>

          </div>

          {/* RESULT */}

          <div className="confidence-result">

            <div
              className="confidence-circle"
              style={{
                background: `conic-gradient(
                  #667eea ${confidence * 3.6}deg,
                  #e8e5f5 ${confidence * 3.6}deg
                )`,
              }}
            >

              <div className="confidence-circle-inner">

                <span>
                  {confidence}%
                </span>

                <small>
                  Confidence
                </small>

              </div>

            </div>

            <div className="confidence-mood">

              <div className="confidence-mood-emoji">
                {getMoodEmoji()}
              </div>

              <h2>
                {mood}
              </h2>

              <p>
                Predicted Music Mood
              </p>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="confidence-progress-section">

            <div className="confidence-progress-header">

              <span>
                AI Confidence
              </span>

              <strong>
                {confidence}%
              </strong>

            </div>

            <div className="confidence-bar-container">

              <div
                className="confidence-bar"
                style={{
                  width: `${confidence}%`,
                }}
              >
              </div>

            </div>

          </div>

          {/* STATS */}

          <div className="confidence-stats">

            <div className="confidence-stat">

              <span>
                🎭 Mood
              </span>

              <strong>
                {mood}
              </strong>

            </div>

            <div className="confidence-stat">

              <span>
                🎚️ Intensity
              </span>

              <strong>
                {intensity}
              </strong>

            </div>

            <div className="confidence-stat">

              <span>
                🎯 Confidence
              </span>

              <strong>
                {confidence}%
              </strong>

            </div>

          </div>

          {/* FEATURES */}

          {features && (

            <div className="confidence-features">

              <h3>
                🎵 Audio Features Used
              </h3>

              <div className="confidence-feature-grid">

                <div>
                  <span>
                    🔊 RMS Energy
                  </span>

                  <strong>
                    {features.rms}
                  </strong>
                </div>

                <div>
                  <span>
                    🎵 Tempo
                  </span>

                  <strong>
                    {features.tempo} BPM
                  </strong>
                </div>

                <div>
                  <span>
                    📊 ZCR
                  </span>

                  <strong>
                    {features.zcr}
                  </strong>
                </div>

                <div>
                  <span>
                    🌊 Spectral Centroid
                  </span>

                  <strong>
                    {features.spectral_centroid} Hz
                  </strong>
                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Confidence;
