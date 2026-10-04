import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function Recommendations() {
  const [songName, setSongName] = useState("Uploaded Song");
  const [mood, setMood] = useState("Happy");
  const [audioUrl, setAudioUrl] = useState("");
  const [playingIndex, setPlayingIndex] = useState(null);
  const [audioError, setAudioError] = useState("");

  const audioRef = useRef(null);

  // ==========================================
  // LOAD SONG + MOOD + AUDIO
  // ==========================================

  useEffect(() => {
    const savedSongName = localStorage.getItem("uploadedSongName");

    if (savedSongName) {
      setSongName(savedSongName);
    }

    const savedMoodData = localStorage.getItem("moodData");

    if (savedMoodData) {
      try {
        const data = JSON.parse(savedMoodData);

        if (data.mood) {
          setMood(data.mood);
        }
      } catch (error) {
        console.error("Mood data error:", error);
      }
    }

    const savedAudioUrl = localStorage.getItem("uploadedAudioUrl");

    if (savedAudioUrl) {
      setAudioUrl(savedAudioUrl);
    }
  }, []);

  // ==========================================
  // MOOD EMOJI
  // ==========================================

  const getMoodEmoji = () => {
    const currentMood = mood.toLowerCase();

    if (currentMood === "happy") return "😊";
    if (currentMood === "sad") return "😢";
    if (currentMood === "relaxed") return "😌";
    if (currentMood === "energetic") return "⚡";

    return "🎵";
  };

  // ==========================================
  // RECOMMENDATIONS
  // ==========================================

  const getRecommendations = () => {
    const currentMood = mood.toLowerCase();

    if (currentMood === "sad") {
      return [
        {
          name: "Peaceful Moments",
          mood: "😌 Relaxed",
          description:
            "Calm and soothing music for peaceful moments.",
          icon: "😌",
        },
        {
          name: "Healing Vibes",
          mood: "🎵 Emotional",
          description:
            "Soft emotional music with a comforting feeling.",
          icon: "💙",
        },
        {
          name: "Calm Escape",
          mood: "😌 Relaxed",
          description:
            "Gentle music to create a calm atmosphere.",
          icon: "🌙",
        },
      ];
    }

    if (currentMood === "relaxed") {
      return [
        {
          name: "Peaceful Vibes",
          mood: "😌 Relaxed",
          description:
            "Calm and peaceful music for relaxation.",
          icon: "😌",
        },
        {
          name: "Chill Moments",
          mood: "🎵 Chill",
          description:
            "Soft and soothing music for a peaceful mood.",
          icon: "🌿",
        },
        {
          name: "Dreamy Music",
          mood: "😌 Relaxed",
          description:
            "Gentle melodies with a relaxing atmosphere.",
          icon: "🌙",
        },
      ];
    }

    if (currentMood === "energetic") {
      return [
        {
          name: "Energetic Beats",
          mood: "⚡ Energetic",
          description:
            "High-energy music to keep you active.",
          icon: "⚡",
        },
        {
          name: "Power Music",
          mood: "🔥 Powerful",
          description:
            "Dynamic music with an energetic feeling.",
          icon: "🔥",
        },
        {
          name: "Workout Vibes",
          mood: "🏃 Active",
          description:
            "Fast-paced music for an active mood.",
          icon: "🏃",
        },
      ];
    }

    return [
      {
        name: "Happy Vibes",
        mood: "😊 Happy",
        description:
          "Positive and cheerful music.",
        icon: "😊",
      },
      {
        name: "Feel Good Music",
        mood: "😊 Happy",
        description:
          "Relaxing and positive vibes.",
        icon: "🎶",
      },
      {
        name: "Energetic Beats",
        mood: "⚡ Energetic",
        description:
          "High-energy music for an active mood.",
        icon: "⚡",
      },
    ];
  };

  const recommendations = getRecommendations();

  // ==========================================
  // PLAY RECOMMENDATION
  // ==========================================

  const handlePlay = async (index) => {
    setAudioError("");

    const audio = audioRef.current;

    if (!audio) {
      setAudioError("Audio player is not available.");
      return;
    }

    if (!audioUrl) {
      setAudioError(
        "Uploaded audio is not available. Please upload the song again."
      );
      return;
    }

    // Same song → Pause
    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
      return;
    }

    try {
      // Stop previous playback
      audio.pause();

      // Reset player
      audio.currentTime = 0;

      // Set uploaded audio
      audio.src = audioUrl;

      // Make sure browser loads the audio
      audio.load();

      // Play
      await audio.play();

      setPlayingIndex(index);
    } catch (error) {
      console.error("Audio playback error:", error);

      setPlayingIndex(null);

      setAudioError(
        "Unable to play this audio. Please upload the song again and try."
      );
    }
  };

  // ==========================================
  // AUDIO ENDED
  // ==========================================

  const handleEnded = () => {
    setPlayingIndex(null);
  };

  // ==========================================
  // AUDIO ERROR
  // ==========================================

  const handleAudioError = () => {
    console.error("Audio element error");

    setPlayingIndex(null);

    setAudioError(
      "Audio file could not be loaded. Please upload the song again."
    );
  };

  // ==========================================
  // STOP AUDIO WHEN PAGE CLOSES
  // ==========================================

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="recommendations-page">

      <div className="recommendations-container">

        {/* BACK */}

        <Link
          to="/mood-result"
          className="recommendations-back"
        >
          ← Back to Mood Result
        </Link>

        {/* HEADER */}

        <div className="recommendations-header">

          <div className="recommendations-icon">
            🎵
          </div>

          <h1>
            Song Recommendations
          </h1>

          <p>
            Discover music recommendations
            based on your detected mood.
          </p>

        </div>

        {/* UPLOADED SONG */}

        <div className="recommendation-source-card">

          <div className="source-icon">
            🎶
          </div>

          <div>

            <span>
              YOUR UPLOADED SONG
            </span>

            <h3>
              {songName}
            </h3>

          </div>

        </div>

        {/* DETECTED MOOD */}

        <div className="recommendation-mood-card">

          <div>

            <span>
              DETECTED MOOD
            </span>

            <h2>
              {getMoodEmoji()} {mood}
            </h2>

          </div>

          <div className="mood-status">
            🤖 AI Analyzed
          </div>

        </div>

        {/* RECOMMENDATIONS */}

        <div className="recommendation-list">

          <div className="recommendation-subtitle">

            <h2>
              🎧 Recommended Songs
            </h2>

            <p>
              Music suggestions matching
              your detected mood.
            </p>

          </div>

          <div className="recommendation-grid">

            {recommendations.map((song, index) => (

              <div
                className="recommendation-card"
                key={index}
              >

                {/* COVER */}

                <div className="recommendation-cover">

                  <span>
                    {song.icon}
                  </span>

                  <div className="cover-note">
                    ♪
                  </div>

                </div>

                {/* INFO */}

                <div className="recommendation-info">

                  <h3>
                    {song.name}
                  </h3>

                  <span className="mood-tag">
                    {song.mood}
                  </span>

                  <p>
                    {song.description}
                  </p>

                  {/* PLAY */}

                  <button
                    className="play-recommendation"
                    onClick={() =>
                      handlePlay(index)
                    }
                  >
                    {playingIndex === index
                      ? "⏸ Pause"
                      : "▶ Play"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* AUDIO PLAYER */}

        <audio
          ref={audioRef}
          controls
          preload="metadata"
          onEnded={handleEnded}
          onError={handleAudioError}
          style={{
            width: "100%",
            marginTop: "20px",
          }}
        />

        {/* ERROR */}

        {audioError && (

          <div
            style={{
              marginTop: "15px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#fff1f1",
              color: "#c62828",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            ⚠️ {audioError}
          </div>

        )}

        {/* AI INFORMATION */}

        <div className="recommendation-info-box">

          <div>
            🧠
          </div>

          <div>

            <strong>
              AI Recommendation
            </strong>

            <p>
              These recommendations are
              selected according to the
              emotional mood detected from
              your uploaded music.
            </p>

          </div>

        </div>

        {/* BACK TO DASHBOARD */}

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
          }}
        >

          <Link
            to="/dashboard"
            className="result-action-btn"
          >
            🏠
            <span>
              Back to Dashboard
            </span>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Recommendations;