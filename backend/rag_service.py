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


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001"
    )


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


def get_retriever():

    embeddings = get_embeddings()

    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )

    return vectorstore.as_retriever(
        search_kwargs={"k": 3}
    )


def retrieve_music_knowledge(query):

    retriever = get_retriever()

    documents = retriever.invoke(query)

    if not documents:
        return ""

    return "\n\n".join(
        document.page_content
        for document in documents
    )


if __name__ == "__main__":
    create_rag_database()
