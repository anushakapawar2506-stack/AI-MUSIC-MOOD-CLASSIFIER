
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MoodIntensity() {

  const [songName, setSongName] =
    useState("Uploaded Music");

  const [mood, setMood] =
    useState("Happy");

  const [intensity, setIntensity] =
    useState("High");


  useEffect(() => {

    const savedSongName =
      localStorage.getItem("uploadedSongName");

    if (savedSongName) {
      setSongName(savedSongName);
    }


    const savedMoodData =
      localStorage.getItem("moodData");

    if (savedMoodData) {

      try {

        const data =
          JSON.parse(savedMoodData);

        if (data.mood) {
          setMood(data.mood);
        }

        if (data.intensity) {
          setIntensity(data.intensity);
        }

      } catch (error) {

        console.error(
          "Mood intensity data error:",
          error
        );

      }

    }

  }, []);


  const getMoodEmoji = () => {

    if (mood === "Happy") {
      return "😊";
    }

    if (mood === "Sad") {
      return "😢";
    }

    if (mood === "Relaxed") {
      return "😌";
    }

    if (mood === "Energetic") {
      return "⚡";
    }

    return "🎵";

  };


  const getIntensityScore = () => {

    if (intensity === "High") {
      return 85;
    }

    if (intensity === "Medium") {
      return 65;
    }

    return 40;

  };


  const intensityScore =
    getIntensityScore();


  const getDescription = () => {

    if (intensity === "High") {

      return "The detected mood is expressed strongly throughout the analyzed audio.";

    }

    if (intensity === "Medium") {

      return "The detected mood is moderately expressed throughout the analyzed audio.";

    }

    return "The detected mood is expressed softly throughout the analyzed audio.";

  };


  return (

    <div className="intensity-page">

      <div className="intensity-container">


        {/* BACK */}

        <Link
          to="/mood-result"
          className="back-link"
        >
          ← Back to Mood Result
        </Link>


        {/* HEADER */}

        <div className="intensity-header">

          <div className="intensity-icon">
            🎚️
          </div>

          <h1>
            Mood Intensity
          </h1>

          <p>
            Detect how strongly the predicted mood
            is expressed in the song.
          </p>

        </div>


        {/* SONG */}

        <div className="intensity-song-card">

          <div className="intensity-song-icon">
            🎶
          </div>

          <div className="intensity-song-info">

            <span>
              YOUR UPLOADED SONG
            </span>

            <h3>
              {songName}
            </h3>

          </div>

        </div>


        {/* MAIN CARD */}

        <div className="intensity-main-card">

          <div className="detected-label">
            DETECTED MOOD
          </div>


          <div className="mood-large-emoji">
            {getMoodEmoji()}
          </div>


          <h2>
            {mood}
          </h2>


          {/* BADGE */}

          <div className="intensity-badge">

            <span className="badge-fire">
              🔥
            </span>

            <span>
              {intensity} Intensity
            </span>

          </div>


          {/* SCORE */}

          <div className="score-section">

            <div className="score-header">

              <span>
                Intensity Score
              </span>

              <strong>
                {intensityScore}%
              </strong>

            </div>


            <div className="score-bar">

              <div
                className="score-fill"
                style={{
                  width:
                    `${intensityScore}%`
                }}
              />

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="intensity-description">

            <span className="description-icon">
              💡
            </span>

            <p>
              {getDescription()}
            </p>

          </div>

        </div>


        {/* LEVELS */}

        <div className="intensity-levels-card">

          <h2>
            📊 Intensity Levels
          </h2>


          <div className="levels-grid">


            <div
              className={
                intensity === "Low"
                  ? "level-item active"
                  : "level-item"
              }
            >

              <span>
                🌱
              </span>

              <div>

                <strong>
                  Low
                </strong>

                <small>
                  0–50%
                </small>

              </div>

            </div>


            <div
              className={
                intensity === "Medium"
                  ? "level-item active"
                  : "level-item"
              }
            >

              <span>
                🌤️
              </span>

              <div>

                <strong>
                  Medium
                </strong>

                <small>
                  51–75%
                </small>

              </div>

            </div>


            <div
              className={
                intensity === "High"
                  ? "level-item active"
                  : "level-item"
              }
            >

              <span>
                🔥
              </span>

              <div>

                <strong>
                  High
                </strong>

                <small>
                  76–100%
                </small>

              </div>

            </div>


          </div>

        </div>


        {/* AI INSIGHT */}

        <div className="intensity-insight">

          <span>
            🧠
          </span>

          <div>

            <strong>
              AI Intensity Insight
            </strong>

            <p>
              The intensity level represents how strongly
              the detected emotional characteristics are
              present in the analyzed audio.
            </p>

          </div>

        </div>


      </div>

    </div>

  );

}

export default MoodIntensity;
