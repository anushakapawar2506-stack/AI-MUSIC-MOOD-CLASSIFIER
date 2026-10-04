import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MoodResult() {
  const [songName, setSongName] = useState("Uploaded Music");
  const [mood, setMood] = useState("Energetic");
  const [confidence, setConfidence] = useState(87);
  const [intensity, setIntensity] = useState("Low");
  const [probabilities, setProbabilities] = useState({});

  useEffect(() => {
    const savedSongName =
      localStorage.getItem("uploadedSongName");

    if (savedSongName) {
      setSongName(savedSongName);
    }

    const savedMoodData =
      localStorage.getItem("moodData");

    if (savedMoodData) {
      try {
        const data = JSON.parse(savedMoodData);

        // MOOD
        if (data.mood) {
          setMood(data.mood);
        }

        // CONFIDENCE
        if (data.confidence !== undefined) {
          setConfidence(Number(data.confidence));
        }

        // INTENSITY
        if (data.intensity) {
          setIntensity(data.intensity);
        }

        // PROBABILITIES
        if (data.probabilities) {
          setProbabilities(data.probabilities);
        }
      } catch (error) {
        console.error(
          "Error reading moodData:",
          error
        );
      }
    }
  }, []);

  // ==========================================
  // MOOD ICON
  // ==========================================

  const getMoodIcon = (currentMood) => {
    const moodName =
      String(currentMood).toLowerCase();

    if (moodName.includes("happy")) {
      return "😊";
    }

    if (moodName.includes("sad")) {
      return "😢";
    }

    if (moodName.includes("energetic")) {
      return "⚡";
    }

    if (moodName.includes("relaxed")) {
      return "😌";
    }

    if (moodName.includes("romantic")) {
      return "❤️";
    }

    if (moodName.includes("aggressive")) {
      return "🔥";
    }

    if (moodName.includes("dramatic")) {
      return "🎭";
    }

    return "🎵";
  };

  // ==========================================
  // INTENSITY ICON
  // ==========================================

  const getIntensityIcon = () => {
    const currentIntensity =
      String(intensity).toLowerCase();

    if (currentIntensity === "high") {
      return "🔥";
    }

    if (currentIntensity === "medium") {
      return "⚡";
    }

    return "🌿";
  };

  // ==========================================
  // INTENSITY CLASS
  // ==========================================

  const getIntensityClass = () => {
    const currentIntensity =
      String(intensity).toLowerCase();

    if (currentIntensity === "high") {
      return "high";
    }

    if (currentIntensity === "medium") {
      return "medium";
    }

    return "low";
  };

  // ==========================================
  // PROBABILITY VALUE
  // ==========================================

  const getProbability = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, number)
    );
  };

  const moodIcon = getMoodIcon(mood);

  const sortedProbabilities =
    Object.entries(probabilities).sort(
      ([, first], [, second]) =>
        Number(second) - Number(first)
    );

  return (
    <div className="professional-result-page">

      {/* =================================================
          NAVBAR
          ================================================= */}

      <nav className="result-navbar">

        <Link
          to="/dashboard"
          className="result-brand"
        >
          <span className="result-brand-icon">
            🎵
          </span>

          <span className="result-brand-text">
            <strong>
              AI Music Mood
            </strong>

            <small>
              Classifier
            </small>
          </span>
        </Link>

        <div className="result-nav-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/upload">
            Upload Music
          </Link>

          <Link to="/history">
            History
          </Link>

          <Link to="/feedback">
            Feedback
          </Link>

        </div>

      </nav>

      {/* =================================================
          MAIN
          ================================================= */}

      <main className="result-main-container">

        {/* BACK */}

        <Link
          to="/upload"
          className="result-back-link"
        >
          ← Back to Upload
        </Link>

        {/* =================================================
            HEADER
            ================================================= */}

        <section className="result-page-header">

          <div>

            <span className="result-eyebrow">
              AI MUSIC ANALYSIS
            </span>

            <h1>
              Music Mood Result
            </h1>

            <p>
              Your uploaded music has been
              analyzed using the AI mood
              classification system.
            </p>

          </div>

        </section>

        {/* =================================================
            SONG INFORMATION
            ================================================= */}

        <section className="song-info-card">

          <div className="song-info-icon">
            🎧
          </div>

          <div className="song-info-content">

            <span>
              ANALYZED SONG
            </span>

            <h2>
              {songName}
            </h2>

            <p>
              AI analysis completed successfully
            </p>

          </div>

          <div className="analysis-status">

            <span className="status-dot"></span>

            ANALYZED

          </div>

        </section>

        {/* =================================================
            MAIN RESULT
            ================================================= */}

        <section className="main-result-card">

          {/* MOOD */}

          <div className="result-mood-area">

            <div className="result-mood-icon">
              {moodIcon}
            </div>

            <div className="result-mood-content">

              <span className="result-label">
                DETECTED MOOD
              </span>

              <h2>
                {mood}
              </h2>

              <p>
                Primary emotional state detected
                by AI
              </p>

            </div>

          </div>

          {/* STATS */}

          <div className="result-stat-area">

            {/* CONFIDENCE */}

            <div className="result-stat">

              <span>
                AI CONFIDENCE
              </span>

              <strong>
                {confidence.toFixed(0)}%
              </strong>

            </div>

            <div className="result-stat-divider"></div>

            {/* INTENSITY */}

            <div className="result-stat">

              <span>
                MOOD INTENSITY
              </span>

              <strong
                className={`result-intensity-value ${getIntensityClass()}`}
              >
                {getIntensityIcon()}{" "}
                {intensity}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            PROBABILITY
            ================================================= */}

        <section className="probability-card">

          <div className="probability-header">

            <div>

              <span className="result-eyebrow">
                MODEL PREDICTION
              </span>

              <h2>
                Mood Probability
              </h2>

              <p>
                Probability distribution generated
                by the Random Forest classification
                model.
              </p>

            </div>

            <div className="probability-main-value">
              {confidence.toFixed(0)}%
            </div>

          </div>

          {sortedProbabilities.length > 0 ? (

            <div className="probability-list">

              {sortedProbabilities.map(
                ([moodName, value]) => {

                  const percentage =
                    getProbability(value);

                  return (
                    <div
                      className="probability-row"
                      key={moodName}
                    >

                      <div className="probability-row-top">

                        <span>
                          {getMoodIcon(
                            moodName
                          )}{" "}
                          {moodName}
                        </span>

                        <strong>
                          {percentage.toFixed(2)}%
                        </strong>

                      </div>

                      <div className="probability-bar">

                        <div
                          className="probability-fill"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        ></div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="probability-list">

              <div className="probability-row">

                <div className="probability-row-top">

                  <span>
                    {moodIcon} {mood}
                  </span>

                  <strong>
                    {confidence.toFixed(2)}%
                  </strong>

                </div>

                <div className="probability-bar">

                  <div
                    className="probability-fill"
                    style={{
                      width:
                        `${confidence}%`,
                    }}
                  ></div>

                </div>

              </div>

            </div>

          )}

        </section>

        {/* =================================================
            ANALYSIS DETAILS
            ================================================= */}

        <section className="analysis-detail-grid">

          {/* PRIMARY MOOD */}

          <div className="analysis-detail-card">

            <div className="analysis-detail-icon">
              {moodIcon}
            </div>

            <div>

              <span>
                PRIMARY MOOD
              </span>

              <strong>
                {mood}
              </strong>

              <p>
                Most probable emotional category
              </p>

            </div>

          </div>

          {/* CONFIDENCE */}

          <div className="analysis-detail-card">

            <div className="analysis-detail-icon">
              🎯
            </div>

            <div>

              <span>
                CONFIDENCE
              </span>

              <strong>
                {confidence.toFixed(0)}%
              </strong>

              <p>
                AI prediction confidence level
              </p>

            </div>

          </div>

          {/* =================================================
              INTENSITY
              ================================================= */}

          <div className="analysis-detail-card intensity-detail-card">

            <div className="analysis-detail-icon">
              {getIntensityIcon()}
            </div>

            <div>

              <span>
                MOOD INTENSITY
              </span>

              <strong
                className={`result-intensity-value ${getIntensityClass()}`}
              >
                {intensity}
              </strong>

              <p>
                Overall emotional intensity
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            RESULT TOOLS
            ================================================= */}

        <section className="result-tools-grid">

          <Link
            to="/confidence"
            className="result-tool-card"
          >
            <span>
              🎯
            </span>

            <div>

              <strong>
                Confidence Analysis
              </strong>

              <p>
                View detailed AI confidence
                information.
              </p>

            </div>

            <b>
              →
            </b>

          </Link>

          <Link
            to="/mood-timeline"
            className="result-tool-card"
          >
            <span>
              📈
            </span>

            <div>

              <strong>
                Mood Timeline
              </strong>

              <p>
                See how the mood changes
                throughout the song.
              </p>

            </div>

            <b>
              →
            </b>

          </Link>

          <Link
            to="/mood-transition"
            className="result-tool-card"
          >
            <span>
              🔄
            </span>

            <div>

              <strong>
                Mood Transition
              </strong>

              <p>
                Explore emotional transitions
                in the music.
              </p>

            </div>

            <b>
              →
            </b>

          </Link>

          <Link
            to="/multi-mood"
            className="result-tool-card"
          >
            <span>
              🎭
            </span>

            <div>

              <strong>
                Multi-Mood Detection
              </strong>

              <p>
                Explore multiple moods detected
                in the song.
              </p>

            </div>

            <b>
              →
            </b>

          </Link>

          <Link
            to="/explainable-ai"
            className="result-tool-card"
          >
            <span>
              🧠
            </span>

            <div>

              <strong>
                Explainable AI
              </strong>

              <p>
                Understand why the AI selected
                this mood.
              </p>

            </div>

            <b>
              →
            </b>

          </Link>

          <Link
            to="/recommendations"
            className="result-tool-card"
          >
            <span>
              🎧
            </span>

            <div>

              <strong>
                Recommendations
              </strong>

              <p>
                Discover music recommendations
                based on the detected mood.
              </p>

            </div>

            <b>
              →
            </b>

          </Link>

          <Link
            to="/mood-intensity"
            className="result-tool-card"
          >
            <span>
              🔥
            </span>

            <div>

              <strong>
                Mood Intensity
              </strong>

              <p>
                View detailed intensity analysis
                of the detected mood.
              </p>

            </div>

            <b>
              →
            </b>

          </Link>

        </section>

        {/* =================================================
            FEEDBACK
            ================================================= */}

        <section className="result-feedback-cta">

          <div>

            <span>
              HELP US IMPROVE
            </span>

            <h2>
              Was this prediction accurate?
            </h2>

            <p>
              Share your feedback about the
              AI mood prediction.
            </p>

          </div>

          <Link
            to="/feedback"
            className="result-feedback-button"
          >
            Give Feedback →
          </Link>

        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="result-footer">

          <strong>
            🎵 AI Music Mood Classifier
          </strong>

          <span>
            Intelligent Music Emotion Analysis
          </span>

        </footer>

      </main>

    </div>
  );
}

export default MoodResult;