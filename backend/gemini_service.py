
import os
import gc
import logging
from pathlib import Path

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Support both package and direct-module imports
try:
    from backend.rag_service import retrieve_music_knowledge
except ImportError:
    from rag_service import retrieve_music_knowledge


# ==========================================
# CONFIGURATION
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

# Load environment files if available.
# Production environment variables are read directly from os.environ.
load_dotenv(PROJECT_DIR / ".env", override=False)
load_dotenv(BASE_DIR / ".env", override=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Read environment variable NAMES, not the API key itself.
API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
)

llm = None


# ==========================================
# INITIALIZE GEMINI
# ==========================================

if API_KEY:
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash-lite",
            google_api_key=API_KEY,
            temperature=0.3,
            max_retries=1,
            timeout=20,
        )

        logger.info("Gemini client initialized successfully.")

    except Exception:
        logger.exception("Gemini initialization failed.")
        llm = None
else:
    logger.warning(
        "Gemini API key missing. Fallback explanation will be used."
    )


# ==========================================
# FALLBACK EXPLANATION
# ==========================================

def fallback_explanation(
    mood,
    confidence,
    intensity,
    tempo,
    rms,
    zcr,
    centroid,
):
    return (
        f"The song is classified as {mood} with "
        f"{confidence}% confidence. "
        f"Its intensity is {intensity} and its tempo is "
        f"{tempo} BPM. "
        f"Its RMS energy is {rms}, and its zero crossing rate "
        f"is {zcr}. "
        f"The spectral centroid is {centroid}."
    )


# ==========================================
# GENERATE MOOD EXPLANATION
# ==========================================

def generate_mood_explanation(
    mood,
    confidence,
    intensity,
    tempo,
    rms,
    zcr,
    centroid,
):
    rag_context = ""

    try:
        if llm is None:
            raise RuntimeError("Gemini client is unavailable.")

        # Retrieve relevant music knowledge using RAG
        try:
            query = (
                f"Explain the musical characteristics associated "
                f"with the {mood} mood."
            )

            retrieved = retrieve_music_knowledge(query)
            rag_context = str(retrieved or "")[:1500]

        except Exception:
            logger.exception("RAG retrieval failed.")
            rag_context = ""

        # Prepare the prompt
        prompt = f"""
You are an AI Music Mood Analysis Assistant.

Explain the predicted mood in simple English.
Give exactly four short sentences.
Use the supplied values accurately.
Do not invent audio features.
Do not claim the prediction is always correct.

Relevant music knowledge:
{rag_context}

Audio analysis:
Mood: {mood}
Confidence: {confidence}%
Intensity: {intensity}
Tempo: {tempo} BPM
RMS Energy: {rms}
Zero Crossing Rate: {zcr}
Spectral Centroid: {centroid}
"""

        # Call Gemini
        response = llm.invoke(prompt)
        content = getattr(response, "content", response)

        # Handle text and list-based responses
        if isinstance(content, list):
            parts = []

            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict):
                    text_part = item.get("text")
                    if text_part:
                        parts.append(str(text_part))

            content = " ".join(parts)

        result = str(content).strip()

        if result:
            return result

        raise ValueError("Gemini returned an empty explanation.")

    except Exception:
        logger.exception("Gemini/RAG explanation failed.")

        return fallback_explanation(
            mood,
            confidence,
            intensity,
            tempo,
            rms,
            zcr,
            centroid,
        )

    finally:
        gc.collect()
