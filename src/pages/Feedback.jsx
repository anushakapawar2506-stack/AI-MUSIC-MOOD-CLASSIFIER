import { useState } from "react";
import { Link } from "react-router-dom";

function Feedback() {
  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!feedbackType) {
      alert("Please select your feedback.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="feedback-page">

      <div className="feedback-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="feedback-header">

          <div className="feedback-icon">
            💬
          </div>

          <h1>User Feedback</h1>

          <p>
            Tell us how accurate the AI mood prediction was.
          </p>

        </div>

        <div className="feedback-card">

          {!submitted ? (
            <form onSubmit={handleSubmit}>

              <div className="feedback-song">
                <span>🎵 Your Uploaded Song</span>
                <h2>AI Mood Prediction</h2>
                <p>Predicted Mood: 😊 Happy</p>
              </div>

              <h3 className="feedback-question">
                Was this mood prediction helpful?
              </h3>

              <div className="feedback-options">

                <button
                  type="button"
                  className={
                    feedbackType === "accurate"
                      ? "feedback-option selected"
                      : "feedback-option"
                  }
                  onClick={() => setFeedbackType("accurate")}
                >
                  😊
                  <span>Yes, accurate</span>
                </button>

                <button
                  type="button"
                  className={
                    feedbackType === "partial"
                      ? "feedback-option selected"
                      : "feedback-option"
                  }
                  onClick={() => setFeedbackType("partial")}
                >
                  😐
                  <span>Partially accurate</span>
                </button>

                <button
                  type="button"
                  className={
                    feedbackType === "not-accurate"
                      ? "feedback-option selected"
                      : "feedback-option"
                  }
                  onClick={() => setFeedbackType("not-accurate")}
                >
                  😕
                  <span>Not accurate</span>
                </button>

              </div>

              <label className="feedback-label">
                Your Feedback
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback here..."
                rows="5"
              ></textarea>

              <button
                type="submit"
                className="submit-feedback"
              >
                Submit Feedback
              </button>

            </form>
          ) : (

            <div className="feedback-success">

              <div className="success-icon">
                ✅
              </div>

              <h2>
                Thank You!
              </h2>

              <p>
                Your feedback has been submitted successfully.
              </p>

              <Link to="/dashboard">
                <button className="dashboard-button">
                  🏠 Back to Dashboard
                </button>
              </Link>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Feedback;