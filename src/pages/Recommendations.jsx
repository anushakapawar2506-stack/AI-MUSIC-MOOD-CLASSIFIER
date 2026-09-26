import { Link } from "react-router-dom";

function Recommendations() {

  const songs = [
    {
      name: "Happy Vibes",
      mood: "😊 Happy",
      description: "Positive and cheerful music"
    },
    {
      name: "Feel Good Music",
      mood: "😊 Happy",
      description: "Relaxing and positive vibes"
    },
    {
      name: "Energetic Beats",
      mood: "⚡ Energetic",
      description: "High-energy music"
    }
  ];

  return (
    <div className="recommend-page">

      <div className="recommend-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="recommend-header">

          <div className="recommend-icon">
            🎵
          </div>

          <h1>Song Recommendations</h1>

          <p>
            Music recommendations based on your detected mood.
          </p>

        </div>

        <div className="recommend-card">

          <div className="detected-mood">
            <span>Your Detected Mood</span>
            <h2>😊 Happy</h2>
          </div>

          <h2 className="recommend-title">
            Recommended Songs
          </h2>

          <div className="song-list">

            {songs.map((song, index) => (

              <div className="song-card" key={index}>

                <div className="song-icon">
                  🎵
                </div>

                <div className="song-info">

                  <h3>{song.name}</h3>

                  <span>{song.mood}</span>

                  <p>{song.description}</p>

                </div>

                <button className="play-button">
                  ▶ Play
                </button>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Recommendations;