import { Link } from "react-router-dom";

function MoodTransition() {

  const transitions = [
    {
      from: "Relaxed 😌",
      to: "Happy 😊",
      time: "0:45",
      reason: "Energy starts increasing"
    },
    {
      from: "Happy 😊",
      to: "Energetic ⚡",
      time: "2:15",
      reason: "Tempo and energy increase"
    },
    {
      from: "Energetic ⚡",
      to: "Happy 😊",
      time: "3:00",
      reason: "Energy becomes moderate"
    }
  ];

  return (
    <div className="transition-page">

      <div className="transition-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="transition-header">

          <div className="transition-icon">
            🔄
          </div>

          <h1>Mood Transition</h1>

          <p>
            Detect how the emotional mood changes throughout the song.
          </p>

        </div>

        <div className="transition-card">

          <h2>🎵 Your Uploaded Song</h2>

          <p className="transition-song">
            Song: <strong>Uploaded Music</strong>
          </p>

          <div className="transition-list">

            {transitions.map((item, index) => (

              <div
                className="transition-item"
                key={index}
              >

                <div className="transition-time">
                  {item.time}
                </div>

                <div className="transition-moods">

                  <div className="mood-box">
                    {item.from}
                  </div>

                  <div className="arrow">
                    →
                  </div>

                  <div className="mood-box">
                    {item.to}
                  </div>

                </div>

                <p className="transition-reason">
                  💡 {item.reason}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default MoodTransition;