from http.server import BaseHTTPRequestHandler
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

# Import Gemini
import google.generativeai as genai
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

# In-memory storage (since Vercel can't write to disk persistently)
MEMORY_STORE = {
    "user_preferences": {},
    "facts": [],
    "conversation_history": [],
    "relationships": {}
}


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_GET(self):
        path = self.path

        # /api/health
        if path == "/api/health" or path == "/health":
            return self._json_response({"status": "healthy", "service": "velora-backend"})

        # /api/system-stats
        if path == "/api/system-stats":
            return self._json_response({
                "status": "success",
                "cpu": {"percent": 0, "cores": 0, "frequency": "N/A"},
                "memory": {"percent": 0, "total_gb": 0, "used_gb": 0, "available_gb": 0},
                "disk": {"percent": 0, "total_gb": 0, "used_gb": 0},
                "battery": {"percent": None, "power_plugged": None, "time_left": "No Battery"},
                "process": {"memory_mb": 0},
                "system": {"platform": "Vercel Serverless", "platform_version": "", "architecture": ""},
                "note": "Serverless environment - limited system stats available"
            })

        # /api/memories/stats
        if path == "/api/memories/stats":
            stats = {
                "total_facts": len(MEMORY_STORE["facts"]),
                "total_conversations": len(MEMORY_STORE["conversation_history"]),
                "total_preferences": len(MEMORY_STORE["user_preferences"]),
                "total_relationships": len(MEMORY_STORE["relationships"]),
                "categories": list(set(f["category"] for f in MEMORY_STORE["facts"]))
            }
            return self._json_response(stats)

        # /api/memories/all
        if path == "/api/memories/all":
            return self._json_response(MEMORY_STORE)

        # /api/memories/facts/{category}
        match = re.match(r"^/api/memories/facts/(.+)$", path)
        if match:
            category = match.group(1)
            facts = [f for f in MEMORY_STORE["facts"] if f["category"] == category]
            return self._json_response({"facts": facts})

        # /api/memories/search?query=
        if path.startswith("/api/memories/search"):
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(path).query).get("query", [""])[0].lower()
            results = [f for f in MEMORY_STORE["facts"] if query in f["fact"].lower() or query in f["category"].lower()]
            return self._json_response({"results": results})

        # /api/memories/preference/{key}
        match = re.match(r"^/api/memories/preference/(.+)$", path)
        if match:
            key = match.group(1)
            value = MEMORY_STORE["user_preferences"].get(key, {}).get("value")
            return self._json_response({"key": key, "value": value})

        # /api/memories/relationships/{entity}
        match = re.match(r"^/api/memories/relationships/(.+)$", path)
        if match:
            entity = match.group(1)
            rels = [r for r in MEMORY_STORE["relationships"].values() if r["entity1"] == entity or r["entity2"] == entity]
            return self._json_response({"entity": entity, "relationships": rels})

        # Fallback
        self._json_response({"error": "Not found"}, 404)

    def do_POST(self):
        path = self.path
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = {}
        if content_length > 0:
            try:
                post_data = json.loads(self.rfile.read(content_length))
            except Exception:
                pass

        # POST /api/chat
        if path == "/api/chat":
            return self._handle_chat(post_data)

        # POST /api/memories/fact
        if path == "/api/memories/fact":
            return self._handle_add_fact(post_data)

        # POST /api/memories/conversation
        if path == "/api/memories/conversation":
            return self._handle_add_conversation(post_data)

        # POST /api/memories/preference
        if path == "/api/memories/preference":
            return self._handle_set_preference(post_data)

        # POST /api/memories/relationship
        if path == "/api/memories/relationship":
            return self._handle_add_relationship(post_data)

        # Fallback
        self._json_response({"error": "Not found"}, 404)

    def do_DELETE(self):
        path = self.path

        # DELETE /api/memories/clear?category=
        if path.startswith("/api/memories/clear"):
            from urllib.parse import urlparse, parse_qs
            category = parse_qs(urlparse(path).query).get("category", [None])[0]
            if category:
                if category in MEMORY_STORE:
                    MEMORY_STORE[category] = [] if isinstance(MEMORY_STORE[category], list) else {}
            else:
                MEMORY_STORE["user_preferences"] = {}
                MEMORY_STORE["facts"] = []
                MEMORY_STORE["conversation_history"] = []
                MEMORY_STORE["relationships"] = {}
            return self._json_response({"success": True, "message": f"Cleared {category if category else 'all'} memories"})

        self._json_response({"error": "Not found"}, 404)

    def _handle_chat(self, data):
        message = data.get("message", "")
        agent_id = int(data.get("agent_id", 1))

        system_prompt = AGENT_PROMPTS.get(agent_id, AGENT_PROMPTS[1])

        # Add conversation context
        recent = MEMORY_STORE["conversation_history"][-5:]
        context = "\n".join([
            f"User: {c['user_message']}\nAI: {c['ai_response']}"
            for c in recent
        ])

        prompt = f"{system_prompt}\n\nPrevious context:\n{context if context else 'No previous context'}\n\nUser: {message}\nAI:"

        try:
            response = model.generate_content(prompt)
            reply = response.text

            # Store in memory
            MEMORY_STORE["conversation_history"].append({
                "id": len(MEMORY_STORE["conversation_history"]) + 1,
                "user_message": message,
                "ai_response": reply,
                "context": {"agent_id": agent_id},
                "timestamp": ""
            })
            if len(MEMORY_STORE["conversation_history"]) > 100:
                MEMORY_STORE["conversation_history"] = MEMORY_STORE["conversation_history"][-100:]

            result = {"reply": reply, "status": "success", "agent_id": agent_id}
        except Exception as e:
            result = {"reply": f"Error: {str(e)}", "status": "error", "agent_id": agent_id}

        return self._json_response(result)

    def _handle_add_fact(self, data):
        fact_entry = {
            "id": len(MEMORY_STORE["facts"]) + 1,
            "category": data.get("category", "general"),
            "fact": data.get("fact", ""),
            "metadata": data.get("metadata", {}),
            "timestamp": "",
            "access_count": 0
        }
        MEMORY_STORE["facts"].append(fact_entry)
        return self._json_response({"success": True, "fact": fact_entry})

    def _handle_add_conversation(self, data):
        conv = {
            "id": len(MEMORY_STORE["conversation_history"]) + 1,
            "user_message": data.get("user_message", ""),
            "ai_response": data.get("ai_response", ""),
            "context": data.get("context", {}),
            "timestamp": ""
        }
        MEMORY_STORE["conversation_history"].append(conv)
        if len(MEMORY_STORE["conversation_history"]) > 100:
            MEMORY_STORE["conversation_history"] = MEMORY_STORE["conversation_history"][-100:]
        return self._json_response({"success": True, "conversation": conv})

    def _handle_set_preference(self, data):
        key = data.get("key", "")
        value = data.get("value")
        MEMORY_STORE["user_preferences"][key] = {"value": value, "updated_at": ""}
        return self._json_response({"success": True})

    def _handle_add_relationship(self, data):
        key = f"{data.get('entity1', '')}|{data.get('entity2', '')}"
        MEMORY_STORE["relationships"][key] = {
            "entity1": data.get("entity1", ""),
            "entity2": data.get("entity2", ""),
            "type": data.get("relationship_type", ""),
            "timestamp": ""
        }
        return self._json_response({"success": True})

    def _json_response(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())