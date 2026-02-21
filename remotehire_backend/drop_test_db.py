#!/usr/bin/env python
"""Script to drop test database before running tests"""
import psycopg2
import sys
from psycopg2 import sql

# Connection to PostgreSQL to drop test database
try:
    conn = psycopg2.connect(
        host="aws-1-ap-south-1.pooler.supabase.com",
        database="postgres",
        user="postgres.tsucrtsopyyqqccpbvxo",
        password="remohire.io",
        port=5432
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    # Terminate all connections to test database
    cur.execute("""
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'test_postgres'
        AND pid <> pg_backend_pid();
    """)
    
    # Drop test database
    cur.execute("DROP DATABASE IF EXISTS test_postgres;")
    cur.close()
    conn.close()
    print("Test database dropped successfully")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
