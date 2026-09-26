import { Link } from "react-router-dom";

function MoodTimeline() {

  const history =
    JSON.parse(localStorage.getItem("predictionHistory")) || [];

  const latestSong =
    history.length > 0
      ? history[0]
      : null;

  const songName =
    latestSong
      ? latestSong.song
      : "No song uploaded";

  const timeline = [
    {
      time: "0:00",
      mood: "Relaxed 😌",
      intensity: "Medium"
    },
    {
      time: "0:45",
      mood: "Happy 😊",
      intensity: "Medium"
    },
    {
      time: "1:30",
      mood: "Happy 😊",
      intensity: "High"
    },
    {
      time: "2:15",
      mood: "Energetic ⚡",
      intensity: "High"
    },
    {
      time: "3:00",
      mood: "Happy 😊",
      intensity: "Medium"
    }
  ];

  return (
    <div className="timeline-page">

      <div className="timeline-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="timeline-header">

          <div className="timeline-icon">
            📈
          </div>

          <h1>
            Mood Timeline
          </h1>

          <p>
            Understand how the mood changes throughout the song.
          </p>

        </div>


        <div className="timeline-card">

          <h2>
            🎵 {songName}
          </h2>


          <div className="timeline">

            {timeline.map((item, index) => (

              <div
                className="timeline-item"
                key={index}
              >

                <div className="timeline-dot">
                  {index + 1}
                </div>


                <div className="timeline-content">

                  <span className="timeline-time">
                    {item.time}
                  </span>

                  <h3>
                    {item.mood}
                  </h3>

                  <p>
                    Intensity:{" "}
                    <strong>
                      {item.intensity}
                    </strong>
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default MoodTimeline;