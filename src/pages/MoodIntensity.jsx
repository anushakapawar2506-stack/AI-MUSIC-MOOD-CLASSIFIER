import { Link } from "react-router-dom";

function MoodIntensity() {
  return (
    <div className="intensity-page">

      <div className="intensity-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="intensity-header">

          <div className="intensity-icon">
            🎚️
          </div>

          <h1>Mood Intensity</h1>

          <p>
            Detect how strongly the predicted mood is expressed in the song.
          </p>

        </div>

        <div className="intensity-card">

          <h2>🎵 Your Uploaded Song</h2>

          <p className="intensity-song">
            AI Mood Intensity Analysis
          </p>

          <div className="mood-result-box">

            <span>Detected Mood</span>

            <h3>😊 Happy</h3>

            <div className="intensity-info">

              <span>Mood Intensity</span>

              <strong>High</strong>

            </div>

            <div className="intensity-bar">

              <div
                className="intensity-fill"
                style={{ width: "82%" }}
              ></div>

            </div>

            <div className="intensity-score">
              Intensity Score: <strong>82%</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MoodIntensity;