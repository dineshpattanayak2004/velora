from http.server import BaseHTTPRequestHandler
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

AGENT_PROMPTS = {
    1: "You are Velora, a general purpose AI assistant for everyday tasks. Be helpful, friendly, and concise.",
    2: "You are a Code Expert AI. Specialize in programming, debugging, code review, refactoring, and writing documentation.",
    3: "You are a Creative Writing AI. Specialize in stories, poetry, scripts, and creative ideas.",
    4: "You are a Data Analyst AI. Specialize in data analysis, insights, reports, and pattern recognition.",
    5: "You are a Music Composer AI. Specialize in music theory, composition, arrangement, and lyrics.",
    6: "You are a Document Assistant AI. Specialize in report writing, summaries, formatting, and templates.",
}


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = json.loads(self.rfile.read(content_length))

        message = post_data.get("message", "")
        agent_id = int(post_data.get("agent_id", 1))

        system_prompt = AGENT_PROMPTS.get(agent_id, AGENT_PROMPTS[1])
        prompt = f"{system_prompt}\n\nUser: {message}\nAI:"

        try:
            response = model.generate_content(prompt)
            reply = response.text
            result = {"reply": reply, "status": "success", "agent_id": agent_id}
        except Exception as e:
            result = {"reply": f"Error: {str(e)}", "status": "error", "agent_id": agent_id}

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())