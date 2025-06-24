from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.route import router
from routes.scan import router as scan_router
from dotenv import load_dotenv
import os

app = FastAPI()

load_dotenv()
APP_URL = os.getenv('APP_URL')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_URL],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)
app.include_router(scan_router)