from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.memory import router as memory_router
from routes.system import router as system_router
from routes.files import router as files_router
import uvicorn

app = FastAPI(title="Velora AI Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

app.include_router(chat_router)
app.include_router(memory_router)
app.include_router(system_router)
app.include_router(files_router)

@app.get("/")
def home():
    return {"message":"Velora AI Online", "status":"running", "version":"2.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "velora-backend", "version":"2.0.0"}

if __name__ == "__main__":
    print("🚀 Starting Velora AI Backend v2.0...")
    print("📍 Backend URL: http://localhost:8001")
    print("📚 API Docs: http://localhost:8001/docs")
    print("✅ Features: AI Agents, System Stats, File Upload")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")