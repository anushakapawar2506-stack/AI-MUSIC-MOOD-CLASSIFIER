import React from "react";

function MoodResult() {
  return (
    <div className="mood-result-page">

      {/* Page Header */}
      <div className="mood-result-header">
        <h1>😊 Mood Result</h1>

        <p>
          AI has analyzed your uploaded song and predicted its emotional mood.
        </p>
      </div>


      {/* Uploaded Song */}
      <div className="song-result-card">

        <div className="song-icon">
          🎵
        </div>

        <div className="song-info">
          <h2>Your Uploaded Song</h2>

          <p>
            Song: <strong>Uploaded Music</strong>
          </p>
        </div>

      </div>


      {/* Main Mood */}
      <div className="main-mood-card">

        <p className="result-label">
          AI Predicted Mood
        </p>

        <div className="main-mood">
          😊
        </div>

        <h2>Happy</h2>

        <p className="mood-description">
          The AI model detected a positive and cheerful emotional pattern
          in your uploaded song.
        </p>

        <div className="confidence-result">
          Confidence: <strong>87%</strong>
        </div>

      </div>


      {/* Mood Details */}
      <div className="mood-details">

        <h2>🎭 Mood Analysis</h2>

        <div className="mood-detail-grid">

          {/* Happy */}
          <div className="mood-detail-card">

            <div className="detail-top">
              <span>😊 Happy</span>
              <strong>87%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "87%" }}
              ></div>
            </div>

            <p>
              Positive and cheerful emotion detected.
            </p>

          </div>


          {/* Relaxed */}
          <div className="mood-detail-card">

            <div className="detail-top">
              <span>😌 Relaxed</span>
              <strong>72%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "72%" }}
              ></div>
            </div>

            <p>
              Calm and peaceful emotion detected.
            </p>

          </div>


          {/* Energetic */}
          <div className="mood-detail-card">

            <div className="detail-top">
              <span>⚡ Energetic</span>
              <strong>65%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "65%" }}
              ></div>
            </div>

            <p>
              High-energy emotional pattern detected.
            </p>

          </div>


          {/* Sad */}
          <div className="mood-detail-card">

            <div className="detail-top">
              <span>😢 Sad</span>
              <strong>31%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "31%" }}
              ></div>
            </div>

            <p>
              Low level of sad emotional pattern detected.
            </p>

          </div>

        </div>

      </div>


      {/* Result Actions */}
      <div className="result-actions">

        <button
          onClick={() => {
            window.location.href = "/mood-timeline";
          }}
        >
          📈 Mood Timeline
        </button>

        <button
          onClick={() => {
            window.location.href = "/mood-transition";
          }}
        >
          🔄 Mood Transition
        </button>

        <button
          onClick={() => {
            window.location.href = "/confidence";
          }}
        >
          📊 Confidence Graph
        </button>

        <button
          onClick={() => {
            window.location.href = "/multi-mood";
          }}
        >
          🎭 Multi-Mood
        </button>

        <button
          onClick={() => {
            window.location.href = "/mood-intensity";
          }}
        >
          🎚️ Mood Intensity
        </button>

      </div>


      {/* Bottom Buttons */}
      <div className="result-bottom-actions">

        <button
          onClick={() => {
            window.location.href = "/upload";
          }}
        >
          🎵 Analyze Another Song
        </button>

        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          🏠 Back to Dashboard
        </button>

      </div>

    </div>
  );
}

export default MoodResult;