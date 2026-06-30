import json
import os
from datetime import datetime
from typing import List, Dict, Any

class MemoryBank:
    def __init__(self, storage_file="memory_store.json"):
        self.storage_file = storage_file
        self.memories = self.load_memories()
    
    def load_memories(self) -> Dict:
        """Load memories from file"""
        if os.path.exists(self.storage_file):
            with open(self.storage_file, 'r') as f:
                return json.load(f)
        return {
            "user_preferences": {},
            "facts": [],
            "conversation_history": [],
            "relationships": {}
        }
    
    def save_memories(self):
        """Save memories to file"""
        with open(self.storage_file, 'w') as f:
            json.dump(self.memories, f, indent=2)
    
    def add_fact(self, category: str, fact: str, metadata: Dict = None):
        """Add a new fact to memory"""
        memory_entry = {
            "id": len(self.memories["facts"]) + 1,
            "category": category,
            "fact": fact,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat(),
            "access_count": 0
        }
        self.memories["facts"].append(memory_entry)
        self.save_memories()
        return memory_entry
    
    def get_facts_by_category(self, category: str) -> List[Dict]:
        """Get all facts in a category"""
        return [f for f in self.memories["facts"] if f["category"] == category]
    
    def search_facts(self, query: str) -> List[Dict]:
        """Search facts by keyword"""
        query_lower = query.lower()
        results = []
        for fact in self.memories["facts"]:
            if query_lower in fact["fact"].lower() or query_lower in fact["category"].lower():
                fact["access_count"] += 1
                results.append(fact)
        self.save_memories()
        return results
    
    def add_conversation(self, user_message: str, ai_response: str, context: Dict = None):
        """Store conversation snippet"""
        conversation = {
            "id": len(self.memories["conversation_history"]) + 1,
            "user_message": user_message,
            "ai_response": ai_response,
            "context": context or {},
            "timestamp": datetime.now().isoformat()
        }
        self.memories["conversation_history"].append(conversation)
        
        # Keep only last 100 conversations
        if len(self.memories["conversation_history"]) > 100:
            self.memories["conversation_history"] = self.memories["conversation_history"][-100:]
        
        self.save_memories()
        return conversation
    
    def set_preference(self, key: str, value: Any):
        """Set user preference"""
        self.memories["user_preferences"][key] = {
            "value": value,
            "updated_at": datetime.now().isoformat()
        }
        self.save_memories()
    
    def get_preference(self, key: str, default=None):
        """Get user preference"""
        if key in self.memories["user_preferences"]:
            return self.memories["user_preferences"][key]["value"]
        return default
    
    def add_relationship(self, entity1: str, entity2: str, relationship_type: str):
        """Add relationship between entities for knowledge graph"""
        key = f"{entity1}|{entity2}"
        self.memories["relationships"][key] = {
            "entity1": entity1,
            "entity2": entity2,
            "type": relationship_type,
            "timestamp": datetime.now().isoformat()
        }
        self.save_memories()
    
    def get_relationships(self, entity: str) -> List[Dict]:
        """Get all relationships for an entity"""
        return [
            rel for rel in self.memories["relationships"].values()
            if rel["entity1"] == entity or rel["entity2"] == entity
        ]
    
    def get_all_memories(self) -> Dict:
        """Get all memories for display"""
        return self.memories
    
    def clear_memories(self, category: str = None):
        """Clear memories (all or by category)"""
        if category:
            if category in self.memories:
                self.memories[category] = [] if isinstance(self.memories[category], list) else {}
        else:
            self.memories = {
                "user_preferences": {},
                "facts": [],
                "conversation_history": [],
                "relationships": {}
            }
        self.save_memories()
    
    def get_memory_stats(self) -> Dict:
        """Get memory statistics"""
        return {
            "total_facts": len(self.memories["facts"]),
            "total_conversations": len(self.memories["conversation_history"]),
            "total_preferences": len(self.memories["user_preferences"]),
            "total_relationships": len(self.memories["relationships"]),
            "categories": list(set(f["category"] for f in self.memories["facts"]))
        }

# Global memory bank instance
memory_bank = MemoryBank()