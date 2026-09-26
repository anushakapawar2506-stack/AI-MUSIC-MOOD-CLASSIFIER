import { Link } from "react-router-dom";

function ExplainableAI() {
  const features = [
    {
      icon: "🎵",
      name: "Tempo",
      value: "High",
      explanation: "Higher tempo can indicate an energetic musical pattern."
    },
    {
      icon: "🔊",
      name: "Energy / RMS",
      value: "Medium-High",
      explanation: "The audio contains a relatively strong energy level."
    },
    {
      icon: "🎼",
      name: "MFCC",
      value: "Positive Pattern",
      explanation: "MFCC features contribute to the detected emotional pattern."
    },
    {
      icon: "🎹",
      name: "Spectral Features",
      value: "Bright",
      explanation: "Spectral characteristics indicate brighter sound content."
    }
  ];

  return (
    <div className="explainable-page">

      <div className="explainable-container">

        <Link to="/mood-result" className="back-link">
          ← Back to Mood Result
        </Link>

        <div className="explainable-header">

          <div className="explainable-icon">
            🧠
          </div>

          <h1>Explainable AI</h1>

          <p>
            Understand why the AI predicted this mood.
          </p>

        </div>

        <div className="explainable-card">

          <h2>🎵 Your Uploaded Song</h2>

          <div className="prediction-box">

            <span>Predicted Mood</span>

            <h3>😊 Happy</h3>

            <strong>87% Confidence</strong>

          </div>

          <h2 className="why-title">
            Why did AI predict Happy?
          </h2>

          <div className="feature-list">

            {features.map((feature, index) => (

              <div
                className="explain-feature"
                key={index}
              >

                <div className="feature-icon">
                  {feature.icon}
                </div>

                <div className="feature-content">

                  <div className="feature-top">

                    <h3>
                      {feature.name}
                    </h3>

                    <span>
                      {feature.value}
                    </span>

                  </div>

                  <p>
                    {feature.explanation}
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

export default ExplainableAI;