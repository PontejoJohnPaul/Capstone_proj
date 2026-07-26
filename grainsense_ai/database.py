from sqlalchemy import create_engine

DB_HOST = "localhost"
DB_NAME = "grainsense_final_db"
DB_USER = "root"
DB_PASS = ""

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
