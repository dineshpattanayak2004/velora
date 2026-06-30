from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from memory.memory import memory_bank

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

router = APIRouter()


AGENT_PROMPTS = {
    1: "You are Velora, a general purpose AI assistant for everyday tasks. Be helpful, friendly, and concise.",
    2: "You are a Code Expert AI. Specialize in programming, debugging, code review, refactoring, and writing documentation.",
    3: "You are a Creative Writing AI. Specialize in stories, poetry, scripts, and creative ideas.",
    4: "You are a Data Analyst AI. Specialize in data analysis, insights, reports, and pattern recognition.",
    5: "You are a Music Composer AI. Specialize in music theory, composition, arrangement, and lyrics.",
    6: "You are a Document Assistant AI. Specialize in report writing, summaries, formatting, and templates.",
}

class ChatRequest(BaseModel):
    message: str
    agent_id: int = 1

@router.post("/chat")
async def chat(data: ChatRequest):

    try:
        # Get conversation history for context
        recent_conversations = memory_bank.memories["conversation_history"][-5:]
        context = "\n".join([
            f"User: {conv['user_message']}\nAI: {conv['ai_response']}"
            for conv in recent_conversations
        ])

        # Build prompt with context
        system_prompt = AGENT_PROMPTS.get(data.agent_id, AGENT_PROMPTS[1])

        if not context:
            context = "No previous context"

        prompt = f"""{system_prompt}

Previous context:
{context}

User: {data.message}
AI:"""

        response = model.generate_content(
            prompt
        )

        reply = response.text

        # Store conversation in memory
        memory_bank.add_conversation(
            user_message=data.message,
            ai_response=reply,
            context={"agent_id": data.agent_id}
        )

        # Extract and store facts from conversation
        extract_and_store_facts(data.message, reply)

        return {
            "reply": reply,
            "status": "success",
            "agent_id": data.agent_id
        }
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return {
            "reply": f"Error: {str(e)}",
            "status": "error",
            "agent_id": data.agent_id
        }

def extract_and_store_facts(user_message: str, ai_response: str):
    """Extract important facts from conversation and store in memory"""
    # Simple keyword-based fact extraction
    user_lower = user_message.lower()

    # Check for personal information
    if "my name is" in user_lower:
        name = user_lower.split("my name is")[-1].strip().split()[0]
        memory_bank.add_fact("personal", f"User's name is {name}", {"type": "name"})

    if "i am" in user_lower or "i'm" in user_lower:
        memory_bank.add_fact("personal", f"User mentioned: {user_message}", {"type": "self_description"})

    # Check for preferences
    if "i like" in user_lower or "i love" in user_lower:
        memory_bank.add_fact("preferences", user_message, {"type": "preference"})

    if "i don't like" in user_lower or "i hate" in user_lower:
        memory_bank.add_fact("preferences", user_message, {"type": "dislike"})

    # Check for work-related info
    if "i work" in user_lower or "my job" in user_lower:
        memory_bank.add_fact("work", user_message, {"type": "work_info"})
    
    # Check for location
    if "i live in" in user_lower or "i'm from" in user_lower:
        memory_bank.add_fact("personal", user_message, {"type": "location"})
    
    # Check for hobbies
    if "my hobby is" in user_lower or "i enjoy" in user_lower:
        memory_bank.add_fact("preferences", user_message, {"type": "hobby"})
