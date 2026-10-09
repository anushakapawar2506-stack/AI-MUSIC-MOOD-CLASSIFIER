
import sqlite3
import os

# Always use the database file inside the backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "music_mood.db")


# DATABASE CONNECTION
def get_connection():
    conn = sqlite3.connect(DATABASE, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


# CREATE HISTORY TABLE
def create_history_table():
    conn = get_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS prediction_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                song TEXT NOT NULL,
                mood TEXT NOT NULL,
                confidence TEXT NOT NULL,
                intensity TEXT NOT NULL,
                date TEXT NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()


# SAVE PREDICTION
def save_prediction(song, mood, confidence, intensity, date):
    conn = get_connection()
    try:
        conn.execute("""
            INSERT INTO prediction_history
            (song, mood, confidence, intensity, date)
            VALUES (?, ?, ?, ?, ?)
        """, (song, mood, str(confidence), intensity, date))
        conn.commit()
    finally:
        conn.close()


# GET ALL PREDICTIONS
def get_predictions():
    conn = get_connection()
    try:
        rows = conn.execute("""
            SELECT *
            FROM prediction_history
            ORDER BY id DESC
        """).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


# DELETE ONE PREDICTION
def delete_prediction(prediction_id):
    conn = get_connection()
    try:
        cursor = conn.execute(
            "DELETE FROM prediction_history WHERE id = ?",
            (prediction_id,)
        )
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()


# CLEAR ALL PREDICTIONS
def clear_predictions():
    conn = get_connection()
    try:
        conn.execute("DELETE FROM prediction_history")
        conn.commit()
    finally:
        conn.close()