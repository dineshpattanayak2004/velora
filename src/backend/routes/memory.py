from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from memory.memory import memory_bank

router = APIRouter()

class FactRequest(BaseModel):
    category: str
    fact: str
    metadata: Optional[Dict] = None

class ConversationRequest(BaseModel):
    user_message: str
    ai_response: str
    context: Optional[Dict] = None

class PreferenceRequest(BaseModel):
    key: str
    value: Any

class RelationshipRequest(BaseModel):
    entity1: str
    entity2: str
    relationship_type: str

@router.get("/memories/stats")
async def get_memory_stats():
    """Get memory statistics"""
    return memory_bank.get_memory_stats()

@router.get("/memories/all")
async def get_all_memories():
    """Get all memories"""
    return memory_bank.get_all_memories()

@router.post("/memories/fact")
async def add_fact(request: FactRequest):
    """Add a new fact to memory"""
    fact = memory_bank.add_fact(request.category, request.fact, request.metadata)
    return {"success": True, "fact": fact}

@router.get("/memories/facts/{category}")
async def get_facts_by_category(category: str):
    """Get facts by category"""
    facts = memory_bank.get_facts_by_category(category)
    return {"facts": facts}

@router.get("/memories/search")
async def search_memories(query: str):
    """Search memories"""
    results = memory_bank.search_facts(query)
    return {"results": results}

@router.post("/memories/conversation")
async def add_conversation(request: ConversationRequest):
    """Store conversation"""
    conversation = memory_bank.add_conversation(
        request.user_message,
        request.ai_response,
        request.context
    )
    return {"success": True, "conversation": conversation}

@router.post("/memories/preference")
async def set_preference(request: PreferenceRequest):
    """Set user preference"""
    memory_bank.set_preference(request.key, request.value)
    return {"success": True}

@router.get("/memories/preference/{key}")
async def get_preference(key: str):
    """Get user preference"""
    value = memory_bank.get_preference(key)
    return {"key": key, "value": value}

@router.post("/memories/relationship")
async def add_relationship(request: RelationshipRequest):
    """Add relationship between entities"""
    memory_bank.add_relationship(
        request.entity1,
        request.entity2,
        request.relationship_type
    )
    return {"success": True}

@router.get("/memories/relationships/{entity}")
async def get_relationships(entity: str):
    """Get relationships for an entity"""
    relationships = memory_bank.get_relationships(entity)
    return {"entity": entity, "relationships": relationships}

@router.delete("/memories/clear")
async def clear_memories(category: Optional[str] = None):
    """Clear memories"""
    memory_bank.clear_memories(category)
    return {"success": True, "message": f"Cleared {category if category else 'all'} memories"}