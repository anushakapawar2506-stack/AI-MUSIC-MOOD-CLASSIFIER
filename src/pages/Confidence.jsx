import { Link } from "react-router-dom";

function Confidence() {

  const moods = [
    {
      mood: "Happy 😊",
      confidence: 87
    },
    {
      mood: "Relaxed 😌",
      confidence: 72
    },
    {
      mood: "Energetic ⚡",
      confidence: 65
    },
    {
      mood: "Sad 😢",
      confidence: 31
    }
  ];

  return (
    <div className="confidence-page">

      <div className="confidence-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="confidence-header">

          <div className="confidence-icon">
            📊
          </div>

          <h1>
            Mood Confidence
          </h1>

          <p>
            View the AI confidence level for each predicted mood.
          </p>

        </div>


        <div className="confidence-card">

          <h2>
            🎵 Your Uploaded Song
          </h2>

          <p className="confidence-song">
            AI Mood Prediction Analysis
          </p>


          <div className="confidence-list">

            {moods.map((item, index) => (

              <div
                className="confidence-item"
                key={index}
              >

                <div className="confidence-info">

                  <span className="confidence-mood">
                    {item.mood}
                  </span>

                  <span className="confidence-value">
                    {item.confidence}%
                  </span>

                </div>


                <div className="confidence-bar">

                  <div
                    className="confidence-fill"
                    style={{
                      width: `${item.confidence}%`
                    }}
                  ></div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Confidence;