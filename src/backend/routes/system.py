import os
from fastapi import APIRouter
from pydantic import BaseModel
import psutil
from datetime import datetime
import platform

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    agent_id: int = 1

AGENT_PROMPTS = {
    1: "You are Velora, a general purpose AI assistant for everyday tasks. Be helpful, friendly, and concise.",
    2: "You are a Code Expert AI. Specialize in programming, debugging, code review, refactoring, and writing documentation. Use code blocks with language tags.",
    3: "You are a Creative Writing AI. Specialize in stories, poetry, scripts, brainstorming creative ideas, and narrative development.",
    4: "You are a Data Analyst AI. Specialize in data analysis, insights generation, reports, pattern recognition, and data visualization descriptions.",
    5: "You are a Music Composer AI. Specialize in music theory, composition, arrangement, songwriting, and music education.",
    6: "You are a Document Assistant AI. Specialize in report writing, summaries, formatting, templates, and document management.",
}

@router.post("/chat-with-agent")
async def chat_with_agent(data: ChatRequest):
    try:
        recent_conversations = []
        try:
            from memory.memory import memory_bank
            recent_conversations = memory_bank.memories["conversation_history"][-5:]
        except Exception:
            pass

        context = "\n".join([
            f"User: {conv['user_message']}\nAI: {conv['ai_response']}"
            for conv in recent_conversations
        ])

        system_prompt = AGENT_PROMPTS.get(data.agent_id, AGENT_PROMPTS[1])
        prompt = f"{system_prompt}\n\nPrevious context:\n{context if context else 'No previous context'}\n\nUser: {data.message}\nAI:"

        import google.generativeai as genai
        import os
        from dotenv import load_dotenv
        load_dotenv()
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        reply = response.text

        try:
            from memory.memory import memory_bank
            memory_bank.add_conversation(
                user_message=data.message,
                ai_response=reply,
                context={"agent_id": data.agent_id}
            )
        except Exception:
            pass

        return {"reply": reply, "status": "success", "agent_id": data.agent_id}
    except Exception as e:
        return {"reply": f"Error: {str(e)}", "status": "error", "agent_id": data.agent_id}

@router.get("/system-stats")
async def get_system_stats():
    try:
        cpu_percent = psutil.cpu_percent(interval=0.5)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()

        memory = psutil.virtual_memory()
        memory_total = memory.total / (1024 ** 3)
        memory_used = memory.used / (1024 ** 3)
        memory_percent = memory.percent

        disk_root = os.path.expanduser('~') if os.name != 'nt' else os.path.splitdrive(os.getcwd())[0] + '\\'
        disk = psutil.disk_usage(disk_root)
        disk_total = disk.total / (1024 ** 3)
        disk_used = disk.used / (1024 ** 3)
        disk_percent = disk.percent

        battery = psutil.sensors_battery()
        battery_data = {}
        if battery:
            battery_data = {
                "percent": battery.percent,
                "power_plugged": battery.power_plugged,
                "time_left": str(battery.secsleft) if battery.secsleft != -1 else "Unknown"
            }
        else:
            battery_data = {
                "percent": None,
                "power_plugged": None,
                "time_left": "No Battery"
            }

        net = psutil.net_io_counters()

        process = psutil.Process()
        process_memory = process.memory_info().rss / (1024 ** 2)

        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "cpu": {
                "percent": cpu_percent,
                "cores": cpu_count,
                "frequency": f"{cpu_freq.current:.2f} MHz" if cpu_freq else "N/A"
            },
            "memory": {
                "percent": memory_percent,
                "total_gb": round(memory_total, 2),
                "used_gb": round(memory_used, 2),
                "available_gb": round((memory_total - memory_used), 2)
            },
            "disk": {
                "percent": disk_percent,
                "total_gb": round(disk_total, 2),
                "used_gb": round(disk_used, 2)
            },
            "battery": battery_data,
            "process": {
                "memory_mb": round(process_memory, 2)
            },
            "system": {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "architecture": platform.machine()
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "velora-backend",
        "timestamp": datetime.now().isoformat()
    }