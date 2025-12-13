import mysql.connector
from config import Config

def get_db_connection():
    """Create and return database connection"""
    return mysql.connector.connect(**Config.MYSQL_CONFIG)

def execute_query(query, params=None, fetch=True):
    """Execute database query"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(query, params or ())
        if fetch:
            result = cursor.fetchall()
            return result
        else:
            conn.commit()
            return cursor.lastrowid
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()
