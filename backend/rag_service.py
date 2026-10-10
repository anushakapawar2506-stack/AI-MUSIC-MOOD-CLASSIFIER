
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
import os

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

KNOWLEDGE_FILE = os.path.join(
    BASE_DIR,
    "rag_data",
    "music_mood_knowledge.txt"
)

CHROMA_DIR = os.path.join(
    BASE_DIR,
    "rag_data",
    "chroma_db"
)

# Reuse these objects instead of recreating them
_embeddings = None
_vectorstore = None
_retriever = None


def get_embeddings():
    global _embeddings

    if _embeddings is None:
        _embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001"
        )

    return _embeddings


def create_rag_database():
    with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    documents = splitter.create_documents([text])

    embeddings = get_embeddings()

    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=CHROMA_DIR
    )

    print("RAG database created successfully.")
    print("Documents:", len(documents))
    print("Database:", CHROMA_DIR)

    return vectorstore


def get_vectorstore():
    global _vectorstore

    if _vectorstore is None:
        
if not os.path.isdir(CHROMA_DIR):
    print("RAG DEBUG - Chroma directory missing:", CHROMA_DIR)
    print("RAG DEBUG - Backend directory:", BASE_DIR)
    print("RAG DEBUG - rag_data exists:",
          os.path.isdir(os.path.join(BASE_DIR, "rag_data")))
    print("RAG DEBUG - Knowledge file exists:",
          os.path.isfile(KNOWLEDGE_FILE))
    print("RAG DEBUG - Backend files:", os.listdir(BASE_DIR))

    raise FileNotFoundError(
        "Chroma database not found: " + CHROMA_DIR
    )

        _vectorstore = Chroma(
            persist_directory=CHROMA_DIR,
            embedding_function=get_embeddings()
        )

    return _vectorstore


def get_retriever():
    global _retriever

    if _retriever is None:
        _retriever = get_vectorstore().as_retriever(
            search_kwargs={"k": 3}
        )

    return _retriever


def retrieve_music_knowledge(query):
    try:
        retriever = get_retriever()
        documents = retriever.invoke(query)

        if not documents:
            return ""

        return "\n\n".join(
            document.page_content
            for document in documents
        )

    except Exception as e:
        print("RAG retrieval error:", e)
        return ""


if __name__ == "__main__":
    create_rag_database()
