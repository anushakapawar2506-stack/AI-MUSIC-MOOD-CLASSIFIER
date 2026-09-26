import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Upload() {
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = () => {
  if (!file) {
    return;
  }

  const newPrediction = {
    song: file.name,
    mood: "Happy 😊",
    confidence: "87%",
    intensity: "High",
    date: new Date().toLocaleDateString("en-IN"),
  };

  const oldHistory =
    JSON.parse(localStorage.getItem("predictionHistory")) || [];

  const updatedHistory = [
    newPrediction,
    ...oldHistory,
  ];

  localStorage.setItem(
    "predictionHistory",
    JSON.stringify(updatedHistory)
  );

  navigate("/mood-result");
};
  return (
    <div className="upload-page">

      <div className="upload-container">

        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="upload-header">

          <div className="upload-icon">
            🎵
          </div>

          <h1>Upload Your Music</h1>

          <p>
            Upload an audio file and let AI analyze its mood.
          </p>

        </div>

        <div className="upload-card">

          <div className="upload-box">

            <div className="upload-symbol">
              🎧
            </div>

            <h2>Select Music File</h2>

            <p>
              Supported formats: MP3, WAV
            </p>

            <input
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              onChange={handleFileChange}
            />

          </div>

          {file && (
            <div className="selected-file">

              <span>🎵</span>

              <div>

                <strong>
                  {file.name}
                </strong>

                <p>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>

              </div>

            </div>
          )}

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={!file}
          >
            🧠 Analyze Music
          </button>

        </div>

        <div className="upload-info">

          <h2>What happens after upload?</h2>

          <div className="process-grid">

            <div>
              <span>1️⃣</span>
              <h3>Audio Upload</h3>
              <p>
                Your selected music file is received.
              </p>
            </div>

            <div>
              <span>2️⃣</span>
              <h3>Feature Extraction</h3>
              <p>
                MFCC, tempo, RMS and spectral features
                are extracted.
              </p>
            </div>

            <div>
              <span>3️⃣</span>
              <h3>AI Prediction</h3>
              <p>
                The trained AI model predicts the music mood.
              </p>
            </div>

            <div>
              <span>4️⃣</span>
              <h3>Mood Result</h3>
              <p>
                Mood, confidence and other insights
                are displayed.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Upload;