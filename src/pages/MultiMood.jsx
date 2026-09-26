import { Link } from "react-router-dom";

function MultiMood() {

  const moods = [
    {
      mood: "Happy 😊",
      percentage: 87,
      description: "Positive and cheerful emotion detected."
    },
    {
      mood: "Relaxed 😌",
      percentage: 72,
      description: "Calm and peaceful emotion detected."
    },
    {
      mood: "Energetic ⚡",
      percentage: 65,
      description: "High-energy emotion detected."
    }
  ];

  return (
    <div className="multi-mood-page">

      <div className="multi-mood-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="multi-mood-header">

          <div className="multi-mood-icon">
            🎭
          </div>

          <h1>
            Multi-Mood Detection
          </h1>

          <p>
            Detect multiple moods present in the same song.
          </p>

        </div>

        <div className="multi-mood-card">

          <h2>
            🎵 Your Uploaded Song
          </h2>

          <p className="multi-mood-song">
            Multiple emotional moods detected
          </p>

          <div className="multi-mood-list">

            {moods.map((item, index) => (

              <div
                className="multi-mood-item"
                key={index}
              >

                <div className="multi-mood-info">

                  <span className="multi-mood-name">
                    {item.mood}
                  </span>

                  <span className="multi-mood-percentage">
                    {item.percentage}%
                  </span>

                </div>

                <div className="multi-mood-bar">

                  <div
                    className="multi-mood-fill"
                    style={{
                      width: `${item.percentage}%`
                    }}
                  ></div>

                </div>

                <p>
                  {item.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default MultiMood;