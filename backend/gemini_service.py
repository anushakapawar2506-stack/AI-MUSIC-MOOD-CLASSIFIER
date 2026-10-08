from dotenv import load_dotenv
import os

from langchain_google_genai import ChatGoogleGenerativeAI

from rag_service import retrieve_music_knowledge

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    google_api_key=API_KEY,
    temperature=0.3,
    max_retries=2,
    timeout=60
)


def generate_mood_explanation(
    mood,
    confidence,
    intensity,
    tempo,
    rms,
    zcr,
    centroid
):
    try:

        # ==========================================
        # RAG KNOWLEDGE RETRIEVAL
        # ==========================================

        query = f"""
        Explain the music mood {mood}.
        What musical characteristics support this mood?
        """

        rag_context = retrieve_music_knowledge(query)

        if not rag_context:
            rag_context = "No additional music knowledge was retrieved."


        # ==========================================
        # GEMINI PROMPT
        # ==========================================

        prompt = f"""
You are an AI Music Mood Analysis Assistant.

Use the retrieved music knowledge below together with the
audio analysis features to explain the predicted mood.

Retrieved Music Knowledge:
{rag_context}

Music Analysis:
Mood: {mood}
Confidence: {confidence}%
Intensity: {intensity}
Tempo: {tempo} BPM
RMS Energy: {rms}
Zero Crossing Rate: {zcr}
Spectral Centroid: {centroid}

Instructions:
- Explain why the song received this mood.
- Connect the audio features with the retrieved music knowledge.
- Use simple English.
- Give only 4 short sentences.
- Do not invent audio features.
"""

        response = llm.invoke(prompt)

        if hasattr(response, "content"):
            content = response.content

            if isinstance(content, list):
                text_parts = []

                for item in content:
                    if isinstance(item, dict) and "text" in item:
                        text_parts.append(item["text"])
                    elif isinstance(item, str):
                        text_parts.append(item)

                return " ".join(text_parts).strip()

            return str(content).strip()

        return str(response).strip()


    except Exception as e:

        print("Gemini/RAG explanation error:", e)

        # Safe fallback
        return (
            f"The song is classified as {mood} with {confidence}% confidence. "
            f"Its intensity is {intensity} and its tempo is {tempo} BPM. "
            f"The RMS energy is {rms}, indicating the overall energy level of the audio. "
            f"The spectral features support the predicted {mood} mood."
        )
