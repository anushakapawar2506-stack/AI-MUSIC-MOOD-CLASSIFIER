
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // GET HISTORY FROM SQLITE
  // =========================================
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:5000/history"
      );

      console.log("History API Response:", response.data);

      if (response.data.success) {
        // Backend sends history data as "predictions"
        setHistory(response.data.predictions || []);
      } else {
        setError("Unable to load prediction history.");
      }
    } catch (err) {
      console.error("History Error:", err);

      setError(
        "Backend connection failed. Make sure Flask server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // =========================================
  // MOOD EMOJI
  // =========================================
  const getMoodEmoji = (mood) => {
    const currentMood = String(mood || "").toLowerCase();

    if (currentMood === "happy") return "😊";
    if (currentMood === "sad") return "😢";
    if (currentMood === "relaxed") return "😌";
    if (currentMood === "energetic") return "⚡";
    if (currentMood === "aggressive") return "🔥";
    if (currentMood === "romantic") return "❤️";
    if (currentMood === "dramatic") return "🎭";

    return "🎵";
  };

  // =========================================
  // MOOD CLASS
  // =========================================
  const getMoodClass = (mood) => {
    const currentMood = String(mood || "").toLowerCase();

    if (currentMood === "happy") return "history-mood-happy";
    if (currentMood === "sad") return "history-mood-sad";
    if (currentMood === "relaxed") return "history-mood-relaxed";
    if (currentMood === "energetic") return "history-mood-energetic";
    if (currentMood === "aggressive") return "history-mood-aggressive";
    if (currentMood === "romantic") return "history-mood-romantic";
    if (currentMood === "dramatic") return "history-mood-dramatic";

    return "history-mood-default";
  };

  // =========================================
  // INTENSITY CLASS
  // =========================================
  const getIntensityClass = (intensity) => {
    const currentIntensity = String(
      intensity || ""
    ).toLowerCase();

    if (currentIntensity === "high") {
      return "history-intensity-high";
    }

    if (currentIntensity === "medium") {
      return "history-intensity-medium";
    }

    return "history-intensity-low";
  };

  // =========================================
  // DELETE ONE PREDICTION
  // =========================================
  const deleteHistoryItem = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prediction?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://127.0.0.1:5000/history/${id}`
      );

      if (response.data.success) {
        setHistory((prevHistory) =>
          prevHistory.filter(
            (item) => item.id !== id
          )
        );
      }
    } catch (err) {
      console.error("Delete Error:", err);

      alert("❌ Failed to delete prediction.");
    }
  };

  // =========================================
  // CLEAR ALL HISTORY
  // =========================================
  const clearAllHistory = async () => {
    if (history.length === 0) {
      alert("There is no history to clear.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to clear all prediction history?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(
        "http://127.0.0.1:5000/history"
      );

      if (response.data.success) {
        setHistory([]);
      }
    } catch (err) {
      console.error(
        "Clear History Error:",
        err
      );

      alert("❌ Failed to clear history.");
    }
  };

  return (
    <div className="pro-history-page">

      {/* =========================================
          NAVBAR
          ========================================= */}
      <nav className="history-navbar">

        <Link
          to="/dashboard"
          className="history-brand"
        >
          <span className="history-brand-icon">
            🎵
          </span>

          <span className="history-brand-text">
            <strong>AI Music Mood</strong>
            <small>Classifier</small>
          </span>
        </Link>

        <div className="history-nav-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/upload">
            Upload Music
          </Link>

          <Link
            to="/history"
            className="active"
          >
            History
          </Link>

          <Link to="/feedback">
            Feedback
          </Link>

        </div>

      </nav>

      {/* =========================================
          MAIN CONTENT
          ========================================= */}
      <main className="history-main">

        {/* BACK */}
        <Link
          to="/dashboard"
          className="history-back-link"
        >
          ← Back to Dashboard
        </Link>

        {/* =========================================
            PAGE HEADER
            ========================================= */}
        <section className="history-page-header">

          <div className="history-title-area">

            <div className="history-title-icon">
              📜
            </div>

            <div>

              <span className="history-section-label">
                MUSIC ANALYTICS
              </span>

              <h1>
                Prediction History
              </h1>

              <p>
                View and manage your previously
                analyzed music and AI mood predictions.
              </p>

            </div>

          </div>

          <button
            className="history-clear-btn"
            onClick={clearAllHistory}
            disabled={history.length === 0}
          >
            <span>🗑️</span>
            Clear All
          </button>

        </section>

        {/* =========================================
            SUMMARY CARDS
            ========================================= */}
        <section className="history-stats">

          <div className="history-stat-card">

            <div className="history-stat-icon purple">
              📊
            </div>

            <div>
              <span>Total Predictions</span>

              <strong>
                {history.length}
              </strong>
            </div>

          </div>

          <div className="history-stat-card">

            <div className="history-stat-icon blue">
              🎵
            </div>

            <div>
              <span>Music Analyses</span>

              <strong>
                {history.length}
              </strong>
            </div>

          </div>

          <div className="history-stat-card">

            <div className="history-stat-icon green">
              🤖
            </div>

            <div>
              <span>AI Analysis</span>

              <strong>
                Ready
              </strong>
            </div>

          </div>

        </section>

        {/* =========================================
            LOADING
            ========================================= */}
        {loading && (
          <div className="history-status-card">

            <div className="history-loading-icon">
              ⏳
            </div>

            <h3>
              Loading Prediction History
            </h3>

            <p>
              Please wait while we retrieve your
              previous AI analyses.
            </p>

          </div>
        )}

        {/* =========================================
            ERROR
            ========================================= */}
        {!loading && error && (
          <div className="history-error-card">

            <div className="history-error-icon">
              ⚠️
            </div>

            <div>

              <h3>
                Unable to Load History
              </h3>

              <p>
                {error}
              </p>

              <button
                className="history-retry-btn"
                onClick={fetchHistory}
              >
                🔄 Try Again
              </button>

            </div>

          </div>
        )}

        {/* =========================================
            EMPTY HISTORY
            ========================================= */}
        {!loading &&
          !error &&
          history.length === 0 && (

            <section className="history-empty-card">

              <div className="history-empty-icon">
                🎵
              </div>

              <span className="history-empty-label">
                NO ANALYSIS FOUND
              </span>

              <h2>
                No Prediction History
              </h2>

              <p>
                Your analyzed songs and AI mood
                predictions will appear here.
              </p>

              <Link
                to="/upload"
                className="history-upload-btn"
              >
                <span>🎵</span>
                Upload Music
                <span>→</span>
              </Link>

            </section>
          )}

        {/* =========================================
            HISTORY TABLE
            ========================================= */}
        {!loading &&
          !error &&
          history.length > 0 && (

            <section className="history-data-section">

              <div className="history-data-header">

                <div>

                  <span>
                    ANALYSIS RECORDS
                  </span>

                  <h2>
                    Your Predictions
                  </h2>

                </div>

                <div className="history-record-count">
                  {history.length} Records
                </div>

              </div>

              <div className="history-table-wrapper">

                <table className="history-table">

                  <thead>

                    <tr>
                      <th>Music</th>
                      <th>Detected Mood</th>
                      <th>Confidence</th>
                      <th>Intensity</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {history.map((item) => (

                      <tr key={item.id}>

                        {/* MUSIC */}
                        <td>

                          <div className="history-song-cell">

                            <div className="history-song-icon">
                              🎵
                            </div>

                            <div>

                              <strong>
                                {item.song}
                              </strong>

                              <span>
                                AI Music Analysis
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* MOOD */}
                        <td>

                          <span
                            className={`history-mood-badge ${getMoodClass(
                              item.mood
                            )}`}
                          >

                            <span>
                              {getMoodEmoji(item.mood)}
                            </span>

                            {item.mood}

                          </span>

                        </td>

                        {/* CONFIDENCE */}
                        <td>

                          <div className="history-confidence">

                            <strong>
                              {String(
                                item.confidence || ""
                              ).replace("%", "")}
                              %
                            </strong>

                            <div className="history-confidence-bar">

                              <span
                                style={{
                                  width: `${Math.min(
                                    Number(
                                      String(
                                        item.confidence || "0"
                                      ).replace("%", "")
                                    ) || 0,
                                    100
                                  )}%`,
                                }}
                              ></span>

                            </div>

                          </div>

                        </td>

                        {/* INTENSITY */}
                        <td>

                          <span
                            className={`history-intensity-badge ${getIntensityClass(
                              item.intensity
                            )}`}
                          >
                            {item.intensity || "Low"}
                          </span>

                        </td>

                        {/* DATE */}
                        <td>

                          <span className="history-date">
                            📅 {item.date}
                          </span>

                        </td>

                        {/* DELETE */}
                        <td>

                          <button
                            className="history-delete-btn"
                            onClick={() =>
                              deleteHistoryItem(
                                item.id
                              )
                            }
                            title="Delete prediction"
                          >
                            🗑️

                            <span>
                              Delete
                            </span>

                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>
          )}

        {/* =========================================
            FOOTER
            ========================================= */}
        <footer className="history-footer">

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

export default History;
