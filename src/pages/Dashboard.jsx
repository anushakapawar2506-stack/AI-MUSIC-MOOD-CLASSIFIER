import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* =========================
          TOP NAVBAR
      ========================== */}

      <header className="top-navbar">

        <div className="navbar-logo">
          🎵
          <span>
            AI Music Mood<br />
            Classifier
          </span>
        </div>

        <nav className="navbar-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/upload">
            Upload<br />
            Music
          </Link>

          <Link to="/history">
            History
          </Link>

          <Link to="/feedback">
            Feedback
          </Link>

          <Link to="/">
            Logout
          </Link>

        </nav>

      </header>


      {/* =========================
          ACTION BUTTONS
      ========================== */}

      <div className="dashboard-actions">

        <Link
          to="/mood-timeline"
          className="dashboard-action-btn"
        >
          📈 View
          <br />
          Mood Timeline
        </Link>

        <Link
          to="/upload"
          className="dashboard-action-btn"
        >
          🎵 Analyze
          <br />
          Another Song
        </Link>

        <Link
          to="/dashboard"
          className="dashboard-action-btn active-action"
        >
          🏠
          <br />
          Dashboard
        </Link>

        <Link
          to="/mood-transition"
          className="dashboard-action-btn"
        >
          🔄 View
          <br />
          Mood Transition
        </Link>

        <Link
          to="/confidence"
          className="dashboard-action-btn"
        >
          📊 View
          <br />
          Confidence Graph
        </Link>

        <Link
          to="/multi-mood"
          className="dashboard-action-btn"
        >
          🎭 View
          <br />
          Multi-Mood
          <br />
          Detection
        </Link>

        <Link
          to="/explainable-ai"
          className="dashboard-action-btn"
        >
          🧠 View
          <br />
          Explainable AI
        </Link>

        <Link
          to="/mood-intensity"
          className="dashboard-action-btn"
        >
          🎚️ View
          <br />
          Mood Intensity
        </Link>

        <Link
          to="/recommendations"
          className="dashboard-action-btn"
        >
          🎵 View Song
          <br />
          Recommendations
        </Link>

        <Link
          to="/feedback"
          className="dashboard-action-btn"
        >
          💬 Give
          <br />
          Feedback
        </Link>

      </div>


      {/* =========================
          MAIN DASHBOARD
      ========================== */}

      <main className="dashboard-main">


        {/* =========================
            WELCOME
        ========================== */}

        <section className="welcome-section">

          <h1>
            Welcome to AI Music Mood Classifier 🎵
          </h1>

          <p>
            Analyze your music and discover its emotional mood.
          </p>

        </section>


        {/* =========================
            ANALYZE MUSIC
        ========================== */}

        <section className="analyze-card">

          <div className="analyze-icon">
            🎧
          </div>

          <div className="analyze-content">

            <h2>
              Analyze Your Music
            </h2>

            <p>
              Upload an audio file and let AI identify the mood of your music.
            </p>

            <Link to="/upload">
              <button className="upload-button">
                🎵 Upload Music
              </button>
            </Link>

          </div>

        </section>


        {/* =========================
            AI MUSIC FEATURES
        ========================== */}

        <section className="features-section">

          <h2 className="features-heading">
            AI Music Features
          </h2>


          <div className="feature-grid">


            {/* Mood Detection */}

            <Link
              to="/mood-result"
              className="feature-card"
            >
              <div className="feature-icon">
                😊
              </div>

              <h3>
                Mood Detection
              </h3>

              <p>
                AI predicts the emotional mood of your song.
              </p>
            </Link>


            {/* Confidence */}

            <Link
              to="/confidence"
              className="feature-card"
            >
              <div className="feature-icon">
                📊
              </div>

              <h3>
                Confidence Score
              </h3>

              <p>
                View the confidence level of each AI prediction.
              </p>
            </Link>


            {/* Timeline */}

            <Link
              to="/mood-timeline"
              className="feature-card"
            >
              <div className="feature-icon">
                📈
              </div>

              <h3>
                Mood Timeline
              </h3>

              <p>
                Understand how mood changes throughout the song.
              </p>
            </Link>


            {/* Transition */}

            <Link
              to="/mood-transition"
              className="feature-card"
            >
              <div className="feature-icon">
                🔄
              </div>

              <h3>
                Mood Transition
              </h3>

              <p>
                Detect emotional transitions in your music.
              </p>
            </Link>


            {/* Multi Mood */}

            <Link
              to="/multi-mood"
              className="feature-card"
            >
              <div className="feature-icon">
                🎭
              </div>

              <h3>
                Multi-Mood Detection
              </h3>

              <p>
                Detect multiple moods present in a single song.
              </p>
            </Link>


            {/* Mood Intensity */}

            <Link
              to="/mood-intensity"
              className="feature-card"
            >
              <div className="feature-icon">
                🎚️
              </div>

              <h3>
                Mood Intensity
              </h3>

              <p>
                Detect Low, Medium or High mood intensity.
              </p>
            </Link>


            {/* Explainable AI */}

            <Link
              to="/explainable-ai"
              className="feature-card"
            >
              <div className="feature-icon">
                🧠
              </div>

              <h3>
                Explainable AI
              </h3>

              <p>
                Understand why AI predicted a particular mood.
              </p>
            </Link>


            {/* Lyrics */}

            <Link
              to="/lyrics"
              className="feature-card"
            >
              <div className="feature-icon">
                📝
              </div>

              <h3>
                Lyrics Analysis
              </h3>

              <p>
                Analyze the emotional meaning of song lyrics.
              </p>
            </Link>


            {/* Recommendations */}

            <Link
              to="/recommendations"
              className="feature-card"
            >
              <div className="feature-icon">
                🎵
              </div>

              <h3>
                Song Recommendations
              </h3>

              <p>
                Get song recommendations based on your mood.
              </p>
            </Link>


          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;