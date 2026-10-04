import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const features = [
    {
      icon: "😊",
      title: "Mood Detection",
      description:
        "Detect the primary emotional mood of your uploaded music.",
      path: "/mood-result",
    },
    {
      icon: "🎯",
      title: "Confidence Score",
      description:
        "View the AI confidence level for every mood prediction.",
      path: "/confidence",
    },
    {
      icon: "📈",
      title: "Mood Timeline",
      description:
        "Track how the emotional mood changes throughout the song.",
      path: "/mood-timeline",
    },
    {
      icon: "🔄",
      title: "Mood Transition",
      description:
        "Understand transitions between different emotional states.",
      path: "/mood-transition",
    },
    {
      icon: "🎭",
      title: "Multi-Mood Detection",
      description:
        "Discover multiple emotions detected within one music track.",
      path: "/multi-mood",
    },
    {
      icon: "⚡",
      title: "Mood Intensity",
      description:
        "Measure the intensity level of the detected musical emotion.",
      path: "/mood-intensity",
    },
    {
      icon: "🧠",
      title: "Explainable AI",
      description:
        "Understand why the AI selected a particular mood.",
      path: "/explainable-ai",
    },
    {
      icon: "🎧",
      title: "Recommendations",
      description:
        "Explore music recommendations based on the detected mood.",
      path: "/recommendations",
    },
    {
      icon: "📝",
      title: "Lyrics Analysis",
      description:
        "Analyze lyrics to identify emotional patterns and moods.",
      path: "/lyrics",
    },
  ];

  return (
    <div className="pro-dashboard">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <nav className="pro-navbar">

        <Link
          to="/dashboard"
          className="pro-brand"
        >
          <span className="pro-brand-icon">
            🎵
          </span>

          <span className="pro-brand-text">
            <strong>
              AI Music Mood
            </strong>

            <small>
              Classifier
            </small>
          </span>
        </Link>


        <div className="pro-nav-links">

          <Link
            to="/dashboard"
            className="active"
          >
            Dashboard
          </Link>

          <Link to="/upload">
            Upload Music
          </Link>

          <Link to="/history">
            History
          </Link>

          <Link to="/feedback">
            Feedback
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "none",
              background: "transparent",
              color: "#6f7486",
              padding: "9px 13px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="pro-main">


        {/* ===================================================
            HERO
            =================================================== */}

        <section className="pro-hero">

          <div className="pro-hero-content">

            <div className="pro-hero-badge">

              <span className="pro-status-dot"></span>

              AI SYSTEM ONLINE

            </div>


            <h1>
              Understand the Emotion
              Behind Music.
            </h1>


            <p>
              Upload your favorite music and let
              Artificial Intelligence analyze its
              emotional characteristics, mood,
              intensity and musical patterns.
            </p>


            <Link
              to="/upload"
              className="pro-hero-button"
            >
              🎵 Analyze Your Music
              <span>→</span>
            </Link>

          </div>

        </section>


        {/* ===================================================
            QUICK ANALYSIS
            =================================================== */}

        <section className="pro-quick-section">

          <div className="pro-quick-card">

            <div className="pro-quick-icon">
              🎧
            </div>


            <div className="pro-quick-content">

              <span>
                QUICK ANALYSIS
              </span>

              <h3>
                Ready to analyze a new song?
              </h3>

              <p>
                Upload an MP3, WAV, OGG or M4A
                audio file to start AI analysis.
              </p>

            </div>


            <Link
              to="/upload"
              className="pro-quick-button"
            >
              Upload Music
            </Link>

          </div>

        </section>


        {/* ===================================================
            FEATURES HEADER
            =================================================== */}

        <div className="pro-section-header">

          <div>

            <span className="pro-section-label">
              AI MUSIC ANALYSIS
            </span>

            <h2>
              Explore Features
            </h2>

            <p>
              Powerful AI tools to understand
              the emotional characteristics of music.
            </p>

          </div>

        </div>


        {/* ===================================================
            FEATURES GRID
            =================================================== */}

        <section className="pro-features-grid">

          {features.map((feature, index) => (

            <Link
              key={index}
              to={feature.path}
              className="pro-feature-card"
            >

              <div className="pro-feature-icon">
                {feature.icon}
              </div>


              <div className="pro-feature-content">

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

              </div>


              <span className="pro-feature-arrow">
                →
              </span>

            </Link>

          ))}

        </section>


        {/* ===================================================
            AI STATUS
            =================================================== */}

        <section className="pro-ai-status">

          <div className="pro-ai-status-icon">
            🤖
          </div>


          <div className="pro-ai-status-content">

            <h3>
              AI Mood Classification System
            </h3>

            <p>
              Random Forest based music mood
              prediction system is ready for analysis.
            </p>

          </div>


          <span className="pro-ai-online">
            ● ONLINE
          </span>

        </section>


        {/* ===================================================
            FOOTER
            =================================================== */}

        <footer className="pro-footer">

          <strong>
            🎵 AI Music Mood Classifier
          </strong>

          <span>
            Intelligent Music Emotion Analysis
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;