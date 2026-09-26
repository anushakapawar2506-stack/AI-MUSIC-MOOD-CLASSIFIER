import { useState } from "react";
import { Link } from "react-router-dom";

function Lyrics() {

  const [songName, setSongName] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [result, setResult] = useState(null);

  const analyzeLyrics = (e) => {
    e.preventDefault();

    if (!songName || !lyrics) {
      alert("Please enter song name and lyrics");
      return;
    }

    // Temporary frontend result
    // Later this will connect to Python AI backend

    setResult({
      mood: "Happy",
      confidence: "87%",
      intensity: "High"
    });
  };

  return (

    <div className="lyrics-page">

      {/* Header */}

      <div className="lyrics-header">

        <Link to="/dashboard">
          ← Back to Dashboard
        </Link>

        <h1>
          📝 Lyrics Analysis
        </h1>

        <p>
          Analyze the emotional mood of your song lyrics
        </p>

      </div>


      {/* Main Card */}

      <div className="lyrics-card">

        <form onSubmit={analyzeLyrics}>

          {/* Song Name */}

          <label>
            Song Name
          </label>

          <input
            type="text"
            placeholder="Enter song name"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
          />


          {/* Lyrics */}

          <label>
            Song Lyrics
          </label>

          <textarea
            placeholder="Paste or type your song lyrics here..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows="10"
          />


          {/* Analyze Button */}

          <button
            type="submit"
            className="analyze-lyrics-button"
          >
            🧠 Analyze Lyrics
          </button>

        </form>


        {/* Result */}

        {result && (

          <div className="lyrics-result">

            <h2>
              🎵 Lyrics Mood Result
            </h2>

            <div className="result-item">

              <span>
                Detected Mood
              </span>

              <strong>
                😊 {result.mood}
              </strong>

            </div>


            <div className="result-item">

              <span>
                Confidence
              </span>

              <strong>
                📊 {result.confidence}
              </strong>

            </div>


            <div className="result-item">

              <span>
                Mood Intensity
              </span>

              <strong>
                🎚️ {result.intensity}
              </strong>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default Lyrics;