import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Lyrics from "./pages/Lyrics";
import MoodResult from "./pages/MoodResult";
import History from "./pages/History";
import MoodTimeline from "./pages/MoodTimeline";
import MoodTransition from "./pages/MoodTransition";
import Confidence from "./pages/Confidence";
import MultiMood from "./pages/MultiMood";
import ExplainableAI from "./pages/ExplainableAI";
import MoodIntensity from "./pages/MoodIntensity";
import Recommendations from "./pages/Recommendations";
import Feedback from "./pages/Feedback";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/upload" element={<Upload />} />

        <Route path="/lyrics" element={<Lyrics />} />

        <Route path="/mood-result" element={<MoodResult />} />

        <Route path="/history" element={<History />} />

        <Route path="/mood-timeline" element={<MoodTimeline />} />

        <Route path="/mood-transition" element={<MoodTransition />} />

        <Route path="/confidence" element={<Confidence />} />

        <Route path="/multi-mood" element={<MultiMood />} />

        <Route path="/explainable-ai" element={<ExplainableAI />} />

        <Route path="/mood-intensity" element={<MoodIntensity />} />

        <Route path="/recommendations" element={<Recommendations />} />

        <Route path="/feedback" element={<Feedback />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
