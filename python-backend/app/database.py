import motor.motor_asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file from the same directory as this file (app/)
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

MONGODB_URI = os.getenv("MONGODB_URI")


if not MONGODB_URI:
    print("ERROR: MONGODB_URI not loaded! Check .env file.")
else:
    print("Loaded MONGODB_URI:", MONGODB_URI)

# Add SSL configuration parameters to handle SSL handshake issues
client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=30000,  # 30 seconds timeout
    connectTimeoutMS=30000,
    socketTimeoutMS=30000
)

db = client["quizDB"]  # database name
subjects_collection = db["subjects"]
