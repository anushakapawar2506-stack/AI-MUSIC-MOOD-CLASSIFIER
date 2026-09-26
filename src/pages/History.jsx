import { Link } from "react-router-dom";

function History() {

  const history =
    JSON.parse(localStorage.getItem("predictionHistory")) || [];

  return (
    <div className="history-page">

      <div className="history-container">

        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="history-header">

          <div className="history-icon">
            📜
          </div>

          <h1>
            Prediction History
          </h1>

          <p>
            View your previously analyzed music and mood predictions.
          </p>

        </div>


        {history.length === 0 ? (

          <div className="history-empty">

            <div>
              🎵
            </div>

            <h2>
              No Predictions Yet
            </h2>

            <p>
              Upload and analyze a song to see it here.
            </p>

            <Link to="/upload">
              <button>
                🎵 Upload Music
              </button>
            </Link>

          </div>

        ) : (

          <div className="history-card">

            <div className="history-table">

              <div className="history-row history-heading">

                <div>
                  Song
                </div>

                <div>
                  Mood
                </div>

                <div>
                  Confidence
                </div>

                <div>
                  Intensity
                </div>

                <div>
                  Date
                </div>

              </div>


              {history.map((item, index) => (

                <div
                  className="history-row"
                  key={index}
                >

                  <div className="song-name">
                    🎵 {item.song}
                  </div>

                  <div>
                    {item.mood}
                  </div>

                  <div className="confidence">
                    📊 {item.confidence}
                  </div>

                  <div>
                    🎚️ {item.intensity}
                  </div>

                  <div>
                    {item.date}
                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default History;