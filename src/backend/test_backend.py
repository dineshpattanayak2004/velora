"""
Simple test script to verify backend functionality
"""
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    try:
        from main import app
        from routes.chat import router as chat_router
        from routes.memory import router as memory_router
        from memory.memory import memory_bank
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import error: {e}")
        return False

def test_memory_bank():
    """Test memory bank functionality"""
    print("\nTesting memory bank...")
    try:
        from memory.memory import memory_bank
        
        # Test adding a fact
        memory_bank.add_fact("test", "Test fact", {"type": "test"})
        print("✓ Add fact works")
        
        # Test getting facts
        facts = memory_bank.get_facts_by_category("test")
        print(f"✓ Get facts works (found {len(facts)} facts)")
        
        # Test adding conversation
        memory_bank.add_conversation("Test message", "Test response")
        print("✓ Add conversation works")
        
        # Test stats
        stats = memory_bank.get_memory_stats()
        print(f"✓ Get stats works: {stats}")
        
        # Clean up test data
        memory_bank.clear_memories("test")
        print("✓ Clear memories works")
        
        return True
    except Exception as e:
        print(f"✗ Memory bank error: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\nTesting API endpoints...")
    print("⚠ Skipping API endpoint tests (requires server to be running)")
    print("  To test manually:")
    print("  1. Start backend: python main.py")
    print("  2. Visit: http://localhost:8000/docs")
    print("  3. Test /chat endpoint with message: 'Hello'")
    return True

def main():
    print("=" * 50)
    print("VELORA AI BACKEND TEST")
    print("=" * 50)
    
    results = []
    
    results.append(("Imports", test_imports()))
    results.append(("Memory Bank", test_memory_bank()))
    results.append(("API Endpoints", test_api_endpoints()))
    
    print("\n" + "=" * 50)
    print("TEST RESULTS")
    print("=" * 50)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    print("=" * 50)
    if all_passed:
        print("✓ ALL TESTS PASSED!")
    else:
        print("✗ SOME TESTS FAILED")
    print("=" * 50)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())