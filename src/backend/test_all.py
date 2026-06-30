"""
Comprehensive test suite for Velora AI Backend
"""
import sys
import os
import json
from pathlib import Path

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test 1: Verify all modules can be imported"""
    print("\n" + "="*60)
    print("TEST 1: Module Imports")
    print("="*60)
    
    try:
        from main import app
        from routes.chat import router as chat_router
        from routes.memory import router as memory_router
        from memory.memory import memory_bank, MemoryBank
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_memory_bank_initialization():
    """Test 2: Memory bank initializes correctly"""
    print("\n" + "="*60)
    print("TEST 2: Memory Bank Initialization")
    print("="*60)
    
    try:
        from memory.memory import MemoryBank
        
        # Test with temporary file
        test_file = "test_memory_temp.json"
        mb = MemoryBank(test_file)
        
        # Check initial structure
        assert "user_preferences" in mb.memories
        assert "facts" in mb.memories
        assert "conversation_history" in mb.memories
        assert "relationships" in mb.memories
        
        # Clean up
        if os.path.exists(test_file):
            os.remove(test_file)
        
        print("✓ Memory bank initializes with correct structure")
        return True
    except Exception as e:
        print(f"✗ Initialization failed: {e}")
        return False

def test_add_fact():
    """Test 3: Adding facts to memory"""
    print("\n" + "="*60)
    print("TEST 3: Add Fact")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        # Add a fact
        fact = memory_bank.add_fact("test", "Test fact", {"type": "test"})
        assert fact["category"] == "test"
        assert fact["fact"] == "Test fact"
        assert "id" in fact
        assert "timestamp" in fact
        
        # Clean up
        memory_bank.clear_memories("test")
        
        print("✓ Facts can be added successfully")
        return True
    except Exception as e:
        print(f"✗ Add fact failed: {e}")
        return False

def test_get_facts():
    """Test 4: Retrieving facts from memory"""
    print("\n" + "="*60)
    print("TEST 4: Get Facts")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        # Add test facts
        memory_bank.add_fact("personal", "User name is John", {"type": "name"})
        memory_bank.add_fact("personal", "User lives in NYC", {"type": "location"})
        memory_bank.add_fact("work", "User is a developer", {"type": "job"})
        
        # Get facts by category
        personal_facts = memory_bank.get_facts_by_category("personal")
        assert len(personal_facts) >= 2
        
        work_facts = memory_bank.get_facts_by_category("work")
        assert len(work_facts) >= 1
        
        # Clean up
        memory_bank.clear_memories("personal")
        memory_bank.clear_memories("work")
        
        print(f"✓ Retrieved {len(personal_facts)} personal facts and {len(work_facts)} work facts")
        return True
    except Exception as e:
        print(f"✗ Get facts failed: {e}")
        return False

def test_search_facts():
    """Test 5: Searching facts"""
    print("\n" + "="*60)
    print("TEST 5: Search Facts")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        # Add searchable facts
        memory_bank.add_fact("preferences", "I like pizza", {"type": "food"})
        memory_bank.add_fact("preferences", "I love programming", {"type": "hobby"})
        
        # Search
        results = memory_bank.search_facts("pizza")
        assert len(results) > 0
        
        # Clean up
        memory_bank.clear_memories("preferences")
        
        print(f"✓ Search found {len(results)} results")
        return True
    except Exception as e:
        print(f"✗ Search failed: {e}")
        return False

def test_conversation_storage():
    """Test 6: Storing conversations"""
    print("\n" + "="*60)
    print("TEST 6: Conversation Storage")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        # Add conversation
        conv = memory_bank.add_conversation(
            "Hello",
            "Hi there!",
            {"mood": "happy"}
        )
        
        assert "user_message" in conv
        assert "ai_response" in conv
        assert conv["user_message"] == "Hello"
        
        # Check stats
        stats = memory_bank.get_memory_stats()
        assert stats["total_conversations"] > 0
        
        # Clean up
        memory_bank.clear_memories("conversation_history")
        
        print("✓ Conversations stored successfully")
        return True
    except Exception as e:
        print(f"✗ Conversation storage failed: {e}")
        return False

def test_preferences():
    """Test 7: User preferences"""
    print("\n" + "="*60)
    print("TEST 7: User Preferences")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        # Set preference
        memory_bank.set_preference("theme", "dark")
        
        # Get preference
        theme = memory_bank.get_preference("theme")
        assert theme == "dark"
        
        # Get non-existent preference with default
        lang = memory_bank.get_preference("language", "english")
        assert lang == "english"
        
        # Clean up
        memory_bank.memories["user_preferences"] = {}
        memory_bank.save_memories()
        
        print("✓ Preferences work correctly")
        return True
    except Exception as e:
        print(f"✗ Preferences failed: {e}")
        return False

def test_relationships():
    """Test 8: Knowledge graph relationships"""
    print("\n" + "="*60)
    print("TEST 8: Relationships")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        # Add relationship
        memory_bank.add_relationship("John", "Google", "works_at")
        
        # Get relationships
        rels = memory_bank.get_relationships("John")
        assert len(rels) > 0
        assert rels[0]["entity2"] == "Google"
        
        # Clean up
        memory_bank.memories["relationships"] = {}
        memory_bank.save_memories()
        
        print("✓ Relationships work correctly")
        return True
    except Exception as e:
        print(f"✗ Relationships failed: {e}")
        return False

def test_memory_stats():
    """Test 9: Memory statistics"""
    print("\n" + "="*60)
    print("TEST 9: Memory Statistics")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        stats = memory_bank.get_memory_stats()
        
        assert "total_facts" in stats
        assert "total_conversations" in stats
        assert "total_preferences" in stats
        assert "total_relationships" in stats
        assert "categories" in stats
        
        print(f"✓ Stats: {stats['total_facts']} facts, {stats['total_conversations']} conversations")
        return True
    except Exception as e:
        print(f"✗ Stats failed: {e}")
        return False

def test_clear_memories():
    """Test 10: Clearing memories"""
    print("\n" + "="*60)
    print("TEST 10: Clear Memories")
    print("="*60)
    
    try:
        from memory.memory import memory_bank
        
        # Add some data to facts category
        memory_bank.add_fact("personal", "Test fact to clear", {})
        
        # Verify it was added
        facts_before = memory_bank.get_facts_by_category("personal")
        print(f"  Facts before clear: {len(facts_before)}")
        
        # Clear specific category
        memory_bank.clear_memories("facts")
        
        # Verify it was cleared
        facts_after = memory_bank.get_facts_by_category("personal")
        print(f"  Facts after clear: {len(facts_after)}")
        assert len(facts_after) == 0
        
        print("✓ Clear memories works")
        return True
    except Exception as e:
        print(f"✗ Clear failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "="*60)
    print("VELORA AI - COMPREHENSIVE TEST SUITE")
    print("="*60)
    
    tests = [
        ("Module Imports", test_imports),
        ("Memory Bank Init", test_memory_bank_initialization),
        ("Add Fact", test_add_fact),
        ("Get Facts", test_get_facts),
        ("Search Facts", test_search_facts),
        ("Conversation Storage", test_conversation_storage),
        ("Preferences", test_preferences),
        ("Relationships", test_relationships),
        ("Memory Stats", test_memory_stats),
        ("Clear Memories", test_clear_memories),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"✗ {name} crashed: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST RESULTS SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{name:.<40} {status}")
    
    print("="*60)
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("✓ ALL TESTS PASSED!")
    else:
        print(f"✗ {total - passed} test(s) failed")
    
    print("="*60)
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)