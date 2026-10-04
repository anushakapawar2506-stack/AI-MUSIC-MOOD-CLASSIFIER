import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);

      // Save uploaded song name
      localStorage.setItem(
        "uploadedSongName",
        selectedFile.name
      );

      // IMPORTANT:
      // Do NOT save URL.createObjectURL() to localStorage.
      // Backend URL will be saved after successful upload.

      localStorage.removeItem("uploadedAudioUrl");

      // Remove previous analysis data
      localStorage.removeItem("moodData");
      localStorage.removeItem("moodTransitionData");
      localStorage.removeItem("multiMoodData");
    }
  };

  // ==========================================
  // ANALYZE MUSIC
  // ==========================================

  const handleAnalyze = async () => {
    if (analyzing) {
      return;
    }

    if (!file) {
      alert("Please select a music file first.");
      return;
    }

    try {
      setAnalyzing(true);

      // ==========================================
      // CLEAR OLD DATA
      // ==========================================

      localStorage.removeItem("moodData");
      localStorage.removeItem("moodTransitionData");
      localStorage.removeItem("multiMoodData");
      localStorage.removeItem("uploadedAudioUrl");

      // ==========================================
      // 1. MOOD ANALYSIS
      // ==========================================

      console.log("================================");
      console.log("🎵 STARTING MOOD ANALYSIS");
      console.log("================================");

      const moodFormData = new FormData();

      moodFormData.append(
        "file",
        file
      );

      const moodResponse = await axios.post(
        "http://127.0.0.1:5000/mood",
        moodFormData
      );

      const moodData = moodResponse.data;

      console.log(
        "✅ MOOD RESPONSE:",
        moodData
      );

      if (!moodData.success) {
        throw new Error(
          moodData.error ||
          "Mood analysis failed."
        );
      }

      // ==========================================
      // SAVE MOOD DATA
      // ==========================================

      localStorage.setItem(
        "moodData",
        JSON.stringify(moodData)
      );

      console.log(
        "✅ Mood data saved."
      );

      // ==========================================
      // SAVE REAL BACKEND AUDIO URL
      // ==========================================

      if (!moodData.filename) {
        throw new Error(
          "Backend did not return uploaded filename."
        );
      }

      const backendAudioUrl =
        `http://127.0.0.1:5000/uploads/${encodeURIComponent(
          moodData.filename
        )}`;

      localStorage.setItem(
        "uploadedAudioUrl",
        backendAudioUrl
      );

      console.log(
        "🎵 BACKEND AUDIO URL:",
        backendAudioUrl
      );

      // ==========================================
      // 2. MOOD TRANSITION + SECTIONS
      // ==========================================

      console.log("================================");
      console.log("🎵 STARTING MOOD TRANSITION");
      console.log("================================");

      const transitionFormData =
        new FormData();

      transitionFormData.append(
        "file",
        file
      );

      const transitionResponse =
        await axios.post(
          "http://127.0.0.1:5000/mood-transition",
          transitionFormData
        );

      const transitionData =
        transitionResponse.data;

      console.log(
        "✅ TRANSITION RESPONSE:",
        transitionData
      );

      if (!transitionData.success) {
        throw new Error(
          transitionData.error ||
          "Mood transition analysis failed."
        );
      }

      if (
        !Array.isArray(
          transitionData.sections
        )
      ) {
        throw new Error(
          "Backend did not return sections data."
        );
      }

      // ==========================================
      // SAVE TIMELINE DATA
      // ==========================================

      localStorage.setItem(
        "moodTransitionData",
        JSON.stringify(
          transitionData
        )
      );

      console.log(
        "✅ Mood transition data saved."
      );

      // ==========================================
      // 3. MULTI-MOOD ANALYSIS
      // ==========================================

      console.log("================================");
      console.log("🎵 STARTING MULTI-MOOD ANALYSIS");
      console.log("================================");

      const multiMoodFormData =
        new FormData();

      multiMoodFormData.append(
        "file",
        file
      );

      const multiMoodResponse =
        await axios.post(
          "http://127.0.0.1:5000/multi-mood",
          multiMoodFormData
        );

      const multiMoodData =
        multiMoodResponse.data;

      console.log(
        "✅ MULTI-MOOD RESPONSE:",
        multiMoodData
      );

      if (!multiMoodData.success) {
        throw new Error(
          multiMoodData.error ||
          "Multi-Mood analysis failed."
        );
      }

      if (
        !Array.isArray(
          multiMoodData.moods
        )
      ) {
        throw new Error(
          "Backend did not return Multi-Mood data."
        );
      }

      // ==========================================
      // SAVE MULTI-MOOD DATA
      // ==========================================

      localStorage.setItem(
        "multiMoodData",
        JSON.stringify(
          multiMoodData
        )
      );

      console.log(
        "✅ Multi-Mood data saved."
      );

      // ==========================================
      // 4. SAVE SONG NAME
      // ==========================================

      localStorage.setItem(
        "uploadedSongName",
        file.name
      );

      // ==========================================
      // 5. VERIFY BACKEND AUDIO URL
      // ==========================================

      const savedAudioUrl =
        localStorage.getItem(
          "uploadedAudioUrl"
        );

      console.log(
        "✅ AUDIO URL SAVED:",
        savedAudioUrl
      );

      // ==========================================
      // 6. SAVE HISTORY
      // ==========================================

      const newPrediction = {
        id: Date.now(),

        song: file.name,

        mood:
          moodData.mood ||
          "Unknown",

        confidence:
          moodData.confidence !==
          undefined
            ? `${moodData.confidence}%`
            : "0%",

        intensity:
          moodData.intensity ||
          "Medium",

        date:
          new Date().toLocaleDateString(
            "en-IN"
          )
      };

      // Get old history
      const oldHistory =
        JSON.parse(
          localStorage.getItem(
            "predictionHistory"
          )
        ) || [];

      // ==========================================
      // DUPLICATE PROTECTION
      // ==========================================

      const lastPrediction =
        oldHistory[0];

      const isSameRecentPrediction =
        lastPrediction &&
        lastPrediction.song ===
          newPrediction.song &&
        lastPrediction.mood ===
          newPrediction.mood &&
        lastPrediction.confidence ===
          newPrediction.confidence &&
        lastPrediction.intensity ===
          newPrediction.intensity;

      let updatedHistory;

      if (isSameRecentPrediction) {
        console.log(
          "⚠️ Duplicate recent prediction prevented."
        );

        updatedHistory =
          oldHistory;
      } else {
        updatedHistory = [
          newPrediction,
          ...oldHistory
        ];
      }

      // Save history
      localStorage.setItem(
        "predictionHistory",
        JSON.stringify(
          updatedHistory
        )
      );

      // ==========================================
      // FINAL DEBUG
      // ==========================================

      console.log(
        "================================"
      );

      console.log(
        "✅ FINAL ANALYSIS COMPLETE"
      );

      console.log(
        "================================"
      );

      console.log(
        "FINAL SAVED HISTORY:",
        JSON.parse(
          localStorage.getItem(
            "predictionHistory"
          )
        )
      );

      console.log(
        "FINAL SAVED MOOD DATA:",
        JSON.parse(
          localStorage.getItem(
            "moodData"
          )
        )
      );

      console.log(
        "FINAL SAVED TIMELINE:",
        JSON.parse(
          localStorage.getItem(
            "moodTransitionData"
          )
        )
      );

      console.log(
        "FINAL SAVED MULTI-MOOD:",
        JSON.parse(
          localStorage.getItem(
            "multiMoodData"
          )
        )
      );

      console.log(
        "FINAL SAVED AUDIO URL:",
        localStorage.getItem(
          "uploadedAudioUrl"
        )
      );

      // ==========================================
      // 7. GO TO MOOD RESULT
      // ==========================================

      navigate(
        "/mood-result"
      );

    } catch (error) {

      // ==========================================
      // ERROR DEBUGGING
      // ==========================================

      console.error(
        "================================"
      );

      console.error(
        "❌ ANALYSIS ERROR"
      );

      console.error(
        "================================"
      );

      console.error(
        error
      );

      // ==========================================
      // BACKEND RESPONSE ERROR
      // ==========================================

      if (error.response) {

        console.error(
          "❌ STATUS:",
          error.response.status
        );

        console.error(
          "❌ BACKEND RESPONSE:",
          error.response.data
        );

        const backendMessage =
          typeof error.response.data ===
          "object"
            ? JSON.stringify(
                error.response.data
              )
            : error.response.data;

        alert(
          "❌ Analysis failed.\n\n" +
          "Backend Error:\n" +
          backendMessage
        );

      }

      // ==========================================
      // NO RESPONSE FROM FLASK
      // ==========================================

      else if (error.request) {

        console.error(
          "❌ NO RESPONSE FROM FLASK:"
        );

        console.error(
          error.request
        );

        alert(
          "❌ Flask server response मिळाला नाही.\n\n" +
          "Please check:\n" +
          "http://127.0.0.1:5000"
        );

      }

      // ==========================================
      // FRONTEND ERROR
      // ==========================================

      else {

        console.error(
          "❌ ERROR MESSAGE:",
          error.message
        );

        alert(
          "❌ Analysis failed:\n\n" +
          error.message
        );
      }

    } finally {

      setAnalyzing(false);

    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="upload-page">

      <div className="upload-container">

        {/* BACK BUTTON */}

        <Link
          to="/dashboard"
          className="back-link"
        >
          ← Back to Dashboard
        </Link>

        {/* HEADER */}

        <div className="upload-header">

          <div className="upload-icon">
            🎵
          </div>

          <h1>
            Upload Your Music
          </h1>

          <p>
            Upload an audio file and let AI
            analyze its mood.
          </p>

        </div>

        {/* UPLOAD CARD */}

        <div className="upload-card">

          <div className="upload-box">

            <div className="upload-symbol">
              🎧
            </div>

            <h2>
              Select Music File
            </h2>

            <p>
              Supported formats:
              MP3, WAV, OGG, M4A
            </p>

            <input
              type="file"
              accept=".mp3,.wav,.ogg,.m4a,audio/*"
              onChange={
                handleFileChange
              }
            />

          </div>

          {/* SELECTED FILE */}

          {file && (
            <div className="selected-file">

              <span>
                🎵
              </span>

              <div>

                <strong>
                  {file.name}
                </strong>

                <p>
                  {(
                    file.size /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </p>

              </div>

            </div>
          )}

          {/* ANALYZE BUTTON */}

          <button
            className="analyze-button"
            onClick={
              handleAnalyze
            }
            disabled={
              !file ||
              analyzing
            }
          >

            {analyzing
              ? "⏳ Analyzing..."
              : "🧠 Analyze Music"}

          </button>

        </div>

        {/* INFORMATION */}

        <div className="upload-info">

          <h2>
            What happens after upload?
          </h2>

          <div className="process-grid">

            <div>

              <span>
                1️⃣
              </span>

              <h3>
                Audio Upload
              </h3>

              <p>
                Your selected music file
                is received.
              </p>

            </div>

            <div>

              <span>
                2️⃣
              </span>

              <h3>
                Audio Feature Extraction
              </h3>

              <p>
                Tempo, RMS, ZCR and
                spectral features are
                extracted.
              </p>

            </div>

            <div>

              <span>
                3️⃣
              </span>

              <h3>
                AI Mood Prediction
              </h3>

              <p>
                The system predicts the
                mood of the music.
              </p>

            </div>

            <div>

              <span>
                4️⃣
              </span>

              <h3>
                Mood Result
              </h3>

              <p>
                Mood, confidence,
                intensity and timeline
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