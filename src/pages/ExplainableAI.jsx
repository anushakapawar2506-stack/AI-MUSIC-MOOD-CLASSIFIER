
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ExplainableAI() {
  const [songName, setSongName] = useState("Uploaded Music");
  const [mood, setMood] = useState("Happy");
  const [confidence, setConfidence] = useState(87);
  const [intensity, setIntensity] = useState("High");

  const [features, setFeatures] = useState({
    rms: 0,
    tempo: 0,
    zcr: 0,
    spectral_centroid: 0,
  });

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

        if (data.mood) {
          setMood(data.mood);
        }

        if (data.confidence !== undefined) {
          setConfidence(data.confidence);
        }

        if (data.intensity) {
          setIntensity(data.intensity);
        }

        if (data.features) {
          setFeatures(data.features);
        }
      } catch (error) {
        console.error(
          "Explainable AI data error:",
          error
        );
      }
    }
  }, []);

  const getMoodEmoji = () => {
    const currentMood = String(mood).toLowerCase();

    if (currentMood === "happy") return "😊";
    if (currentMood === "sad") return "😢";
    if (currentMood === "relaxed") return "😌";
    if (currentMood === "energetic") return "⚡";
    if (currentMood === "aggressive") return "🔥";
    if (currentMood === "romantic") return "❤️";
    if (currentMood === "dramatic") return "🎭";

    return "🎵";
  };

  const getExplanation = () => {
    const currentMood = String(mood).toLowerCase();

    if (currentMood === "happy") {
      return "The song shows a relatively high energy level and fast tempo. These audio characteristics contributed to the Happy mood prediction.";
    }

    if (currentMood === "energetic") {
      return "The song has high energy and a fast tempo. These characteristics strongly contributed to the Energetic mood prediction.";
    }

    if (currentMood === "relaxed") {
      return "The song has moderate energy and a comparatively lower tempo. These characteristics contributed to the Relaxed mood prediction.";
    }

    if (currentMood === "sad") {
      return "The song has lower energy characteristics. These audio features contributed to the Sad mood prediction.";
    }

    if (currentMood === "aggressive") {
      return "The song contains relatively high energy and fast rhythmic characteristics. These audio features contributed to the Aggressive mood prediction.";
    }

    if (currentMood === "romantic") {
      return "The musical characteristics and overall audio pattern contributed to the Romantic mood prediction.";
    }

    if (currentMood === "dramatic") {
      return "The combination of musical energy and spectral characteristics contributed to the Dramatic mood prediction.";
    }

    return "The audio features were analyzed to determine the predicted mood.";
  };

  return (
    <div className="explainable-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="explainable-navbar">

        <Link
          to="/dashboard"
          className="explainable-brand"
        >
          <span className="explainable-brand-icon">
            🎵
          </span>

          <span className="explainable-brand-text">
            <strong>AI Music Mood</strong>
            <small>Classifier</small>
          </span>
        </Link>

        <div className="explainable-nav-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/upload">
            Upload Music
          </Link>

          <Link to="/history">
            History
          </Link>

          <Link
            to="/feedback"
          >
            Feedback
          </Link>

        </div>

      </nav>


      {/* =========================
          MAIN
      ========================= */}

      <main className="explainable-main">

        <Link
          to="/mood-result"
          className="explainable-back"
        >
          ← Back to Mood Result
        </Link>


        {/* =========================
            HEADER
        ========================= */}

        <section className="explainable-header">

          <span className="explainable-label">
            EXPLAINABLE ARTIFICIAL INTELLIGENCE
          </span>

          <h1>
            Explainable AI
          </h1>

          <p>
            Understand why the AI predicted this
            mood from your music.
          </p>

        </section>


        {/* =========================
            SONG CARD
        ========================= */}

        <section className="explainable-song-card">

          <div className="explainable-song-icon">
            🎶
          </div>

          <div className="explainable-song-info">

            <span>
              YOUR UPLOADED SONG
            </span>

            <h3>
              {songName}
            </h3>

          </div>

        </section>


        {/* =========================
            PREDICTION
        ========================= */}

        <section className="explainable-prediction">

          <span className="explainable-prediction-label">
            AI PREDICTED MOOD
          </span>

          <div className="explainable-prediction-content">

            <div className="explainable-mood">

              <div className="explainable-mood-icon">
                {getMoodEmoji()}
              </div>

              <div>
                <h2>
                  {mood}
                </h2>

                <p>
                  Primary emotional classification
                </p>
              </div>

            </div>


            <div className="explainable-prediction-stats">

              <div className="explainable-prediction-stat">

                <span>
                  CONFIDENCE
                </span>

                <strong>
                  {confidence}%
                </strong>

              </div>


              <div className="explainable-prediction-stat">

                <span>
                  INTENSITY
                </span>

                <strong>
                  {intensity}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            AUDIO FEATURES
        ========================= */}

        <div className="explainable-section-title">

          <h2>
            🎧 Audio Features
          </h2>

          <p>
            Musical characteristics analyzed by the AI model.
          </p>

        </div>


        <section className="explainable-features">

          <div className="explainable-feature-card">

            <div className="explainable-feature-icon">
              ⚡
            </div>

            <span>
              TEMPO
            </span>

            <strong>
              {Number(features.tempo || 0).toFixed(0)}
            </strong>

            <small>
              BPM
            </small>

          </div>


          <div className="explainable-feature-card">

            <div className="explainable-feature-icon">
              🔊
            </div>

            <span>
              RMS ENERGY
            </span>

            <strong>
              {Number(features.rms || 0).toFixed(4)}
            </strong>

            <small>
              Energy level
            </small>

          </div>


          <div className="explainable-feature-card">

            <div className="explainable-feature-icon">
              📈
            </div>

            <span>
              ZERO CROSSING RATE
            </span>

            <strong>
              {Number(features.zcr || 0).toFixed(4)}
            </strong>

            <small>
              Signal variation
            </small>

          </div>


          <div className="explainable-feature-card">

            <div className="explainable-feature-icon">
              🎧
            </div>

            <span>
              SPECTRAL CENTROID
            </span>

            <strong>
              {Number(
                features.spectral_centroid || 0
              ).toFixed(2)}
            </strong>

            <small>
              Hz
            </small>

          </div>

        </section>


        {/* =========================
            WHY AI PREDICTED
        ========================= */}

        <div className="explainable-section-title">

          <h2>
            💡 Why did AI predict {mood}?
          </h2>

          <p>
            AI-generated explanation based on
            analyzed audio characteristics.
          </p>

        </div>


        <section className="explainable-reason-card">

          <div className="explainable-reason-top">

            <div className="explainable-reason-icon">
              🧠
            </div>

            <div>

              <h3>
                AI Decision Reasoning
              </h3>

              <p>
                The model evaluated multiple
                audio characteristics.
              </p>

            </div>

          </div>

          <p>
            {getExplanation()}
          </p>

        </section>


        {/* =========================
            DECISION SUMMARY
        ========================= */}

        <div className="explainable-section-title">

          <h2>
            🔍 AI Decision Summary
          </h2>

          <p>
            Final information used for the mood classification.
          </p>

        </div>


        <section className="explainable-summary">

          <div className="explainable-summary-grid">

            <div className="explainable-summary-item">

              <span>
                MOOD
              </span>

              <strong>
                {getMoodEmoji()} {mood}
              </strong>

            </div>


            <div className="explainable-summary-item">

              <span>
                CONFIDENCE
              </span>

              <strong>
                {confidence}%
              </strong>

            </div>


            <div className="explainable-summary-item">

              <span>
                INTENSITY
              </span>

              <strong>
                {intensity}
              </strong>

            </div>


            <div className="explainable-summary-item success">

              <span>
                AUDIO FEATURES
              </span>

              <strong>
                Analyzed ✓
              </strong>

            </div>

          </div>

        </section>


        {/* =========================
            NEXT ANALYSIS
        ========================= */}

        <div className="explainable-section-title">

          <h2>
            Continue Analysis
          </h2>

          <p>
            Explore more insights from your music.
          </p>

        </div>


        <section className="explainable-actions">

          <Link
            to="/confidence"
            className="explainable-action"
          >

            <div className="explainable-action-left">

              <div className="explainable-action-icon">
                🎯
              </div>

              <strong>
                Confidence Analysis
              </strong>

            </div>

            <span>
              →
            </span>

          </Link>


          <Link
            to="/mood-timeline"
            className="explainable-action"
          >

            <div className="explainable-action-left">

              <div className="explainable-action-icon">
                📈
              </div>

              <strong>
                Mood Timeline
              </strong>

            </div>

            <span>
              →
            </span>

          </Link>


          <Link
            to="/mood-intensity"
            className="explainable-action"
          >

            <div className="explainable-action-left">

              <div className="explainable-action-icon">
                ⚡
              </div>

              <strong>
                Mood Intensity
              </strong>

            </div>

            <span>
              →
            </span>

          </Link>

        </section>


        {/* =========================
            FOOTER
        ========================= */}

        <footer className="explainable-footer">

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

export default ExplainableAI;
