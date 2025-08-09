from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

DATABASE_URL = settings.DATABASE_URL

# print("Using DB URL:", DATABASE_URL)

engine = create_engine(DATABASE_URL)

Sessionlocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base= declarative_base()

def get_db():
    db= Sessionlocal()
    try :
        yield db
    finally : 
        db.close()