from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Import your routers
from routes.bp_scan import router as bpScan_router
from routes.vuln_scan import router as vuln_scan_router
from routes.vuln_scan_individual_file import router as vuln_scan_individual_file_router
from routes.bp_scan_individual_file import router as bp_scan_individual_file_router
from routes.custom_rule_test_scan import router as custom_rule_test_router
from routes.customRule_scan import router as custom_rule_scan_router
from routes.publishRule import router as publish_rule_router

# Load environment variables from .env file
load_dotenv()
APP_URL = os.getenv('APP_URL', '*')  # Default to * if not set


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(bpScan_router)
app.include_router(vuln_scan_router)
app.include_router(vuln_scan_individual_file_router)
app.include_router(bp_scan_individual_file_router)
app.include_router(custom_rule_test_router)
app.include_router(custom_rule_scan_router)
app.include_router(publish_rule_router)

# Run the app when called directly
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))  # Use PORT from Render, default to 8000
    uvicorn.run("main:app", host="0.0.0.0", port=port)
