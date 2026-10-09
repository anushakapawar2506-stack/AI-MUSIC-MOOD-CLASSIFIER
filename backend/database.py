
import sqlite3
import os
import logging

# ==========================================
# DATABASE CONFIGURATION
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "music_mood.db")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_connection():
    conn = sqlite3.connect(DATABASE, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


# ==========================================
# CREATE HISTORY TABLE
# ==========================================

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
        logger.info("Prediction history table is ready.")

    except sqlite3.Error:
        logger.exception("Failed to create prediction history table.")
        raise

    finally:
        conn.close()


# ==========================================
# SAVE PREDICTION
# ==========================================

def save_prediction(song, mood, confidence, intensity, date):
    conn = get_connection()

    try:
        cursor = conn.execute("""
            INSERT INTO prediction_history
                (song, mood, confidence, intensity, date)
            VALUES (?, ?, ?, ?, ?)
        """, (
            str(song),
            str(mood),
            str(confidence),
            str(intensity),
            str(date)
        ))

        conn.commit()

        prediction_id = cursor.lastrowid

        logger.info(
            "Prediction saved successfully. ID=%s, Song=%s, Mood=%s",
            prediction_id,
            song,
            mood
        )

        return prediction_id

    except sqlite3.Error:
        conn.rollback()
        logger.exception("Failed to save prediction for song: %s", song)
        raise

    finally:
        conn.close()


# ==========================================
# GET ALL PREDICTIONS
# ==========================================

def get_predictions():
    conn = get_connection()

    try:
        rows = conn.execute("""
            SELECT id, song, mood, confidence, intensity, date
            FROM prediction_history
            ORDER BY id DESC
        """).fetchall()

        predictions = [dict(row) for row in rows]

        logger.info(
            "Retrieved %s prediction history records.",
            len(predictions)
        )

        return predictions

    except sqlite3.Error:
        logger.exception("Failed to retrieve prediction history.")
        raise

    finally:
        conn.close()


# ==========================================
# DELETE ONE PREDICTION
# ==========================================

def delete_prediction(prediction_id):
    conn = get_connection()

    try:
        cursor = conn.execute("""
            DELETE FROM prediction_history
            WHERE id = ?
        """, (prediction_id,))

        conn.commit()

        logger.info(
            "Deleted %s prediction record(s).",
            cursor.rowcount
        )

        return cursor.rowcount

    except sqlite3.Error:
        conn.rollback()
        logger.exception("Failed to delete prediction ID=%s", prediction_id)
        raise

    finally:
        conn.close()


# ==========================================
# CLEAR ALL PREDICTIONS
# ==========================================

def clear_predictions():
    conn = get_connection()

    try:
        cursor = conn.execute("""
            DELETE FROM prediction_history
        """)

        deleted_count = cursor.rowcount
        conn.commit()

        logger.info(
            "Cleared %s prediction history record(s).",
            deleted_count
        )

        return deleted_count

    except sqlite3.Error:
        conn.rollback()
        logger.exception("Failed to clear prediction history.")
        raise

    finally:
        conn.close()


# ==========================================
# INITIALIZE DATABASE
# ==========================================

create_history_table()