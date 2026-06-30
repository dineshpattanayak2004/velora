import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Brain,
  Search,
  Plus,
  Trash2,
  Network,
  FileText,
  MessageSquare,
  Settings,
  X,
  Save,
} from "lucide-react";
import {
  getMemoryStats,
  getAllMemories,
  addFact,
  searchMemories,
  clearMemories,
} from "../services/memory";

export default function MemoryBank() {
  const [stats, setStats] = useState(null);
  const [memories, setMemories] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [newFact, setNewFact] = useState({
    category: "personal",
    fact: "",
    metadata: {},
  });

  const loadMemories = async () => {
    try {
      const statsData = await getMemoryStats();
      setStats(statsData);

      const memoriesData = await getAllMemories();
      setMemories(memoriesData);
    } catch (error) {
      console.error("Error loading memories:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadMemories();
    };
    init();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await searchMemories(searchQuery);
      setSearchResults(results.results);
    } catch (error) {
      console.error("Error searching memories:", error);
    }
  };

  const handleAddFact = async () => {
    if (!newFact.fact.trim()) return;
    try {
      await addFact(newFact.category, newFact.fact, newFact.metadata);
      setNewFact({ category: "personal", fact: "", metadata: {} });
      setShowAddForm(false);
      loadMemories();
    } catch (error) {
      console.error("Error adding fact:", error);
    }
  };

  const handleClearMemories = async (category = null) => {
    if (
      window.confirm(
        `Are you sure you want to clear ${category || "all"} memories?`
      )
    ) {
      try {
        await clearMemories(category);
        loadMemories();
      } catch (error) {
        console.error("Error clearing memories:", error);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal: "border-cyan-400 bg-cyan-400/10 text-cyan-400",
      work: "border-purple-400 bg-purple-400/10 text-purple-400",
      preferences: "border-pink-400 bg-pink-400/10 text-pink-400",
      knowledge: "border-blue-400 bg-blue-400/10 text-blue-400",
      default: "border-slate-400 bg-slate-400/10 text-slate-400",
    };
    return colors[category] || colors.default;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [showMobileTabs, setShowMobileTabs] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="text-cyan-400 md:hidden" />
            <Brain className="text-cyan-400 hidden md:block" size={36} />
            <h1 className="text-2xl md:text-4xl font-bold text-cyan-400">
              Memory Bank
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            Velora's persistent memory and knowledge management system
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="glass p-3 md:p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Total Facts</p>
                  <p className="text-2xl md:text-3xl font-bold text-cyan-400 mt-1">
                    {stats.total_facts}
                  </p>
                </div>
                <FileText className="text-cyan-400" size={20} className="md:hidden" />
                <FileText className="text-cyan-400 hidden md:block" size={32} />
              </div>
            </div>

            <div className="glass p-3 md:p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Conversations</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-400 mt-1">
                    {stats.total_conversations}
                  </p>
                </div>
                <MessageSquare className="text-purple-400" size={20} className="md:hidden" />
                <MessageSquare className="text-purple-400 hidden md:block" size={32} />
              </div>
            </div>

            <div className="glass p-3 md:p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Preferences</p>
                  <p className="text-2xl md:text-3xl font-bold text-pink-400 mt-1">
                    {stats.total_preferences}
                  </p>
                </div>
                <Settings className="text-pink-400" size={20} className="md:hidden" />
                <Settings className="text-pink-400 hidden md:block" size={32} />
              </div>
            </div>

            <div className="glass p-3 md:p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Relationships</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-400 mt-1">
                    {stats.total_relationships}
                  </p>
                </div>
                <Network className="text-green-400" size={20} className="md:hidden" />
                <Network className="text-green-400 hidden md:block" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tabs Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileTabs(!showMobileTabs)}
            className="w-full glass px-4 py-3 rounded-xl border border-cyan-500/20 hover:border-cyan-400 transition-all flex items-center justify-between"
          >
            <span className="font-medium text-sm md:text-base">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
            <span className="text-cyan-400">{showMobileTabs ? "▲" : "▼"}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className={`
          ${showMobileTabs ? "block" : "hidden"}
          lg:flex
          gap-2 mb-6 border-b border-slate-700
        `}>
          <button
            onClick={() => {
              setActiveTab("overview");
              setShowMobileTabs(false);
            }}
            className={`px-4 md:px-6 py-3 font-medium transition text-sm md:text-base ${
              activeTab === "overview"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab("facts");
              setShowMobileTabs(false);
            }}
            className={`px-4 md:px-6 py-3 font-medium transition text-sm md:text-base ${
              activeTab === "facts"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Facts
          </button>
          <button
            onClick={() => {
              setActiveTab("graph");
              setShowMobileTabs(false);
            }}
            className={`px-4 md:px-6 py-3 font-medium transition text-sm md:text-base ${
              activeTab === "graph"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Knowledge Graph
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              setShowMobileTabs(false);
            }}
            className={`px-4 md:px-6 py-3 font-medium transition text-sm md:text-base ${
              activeTab === "history"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            History
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="glass p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search memories..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition"
                >
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-slate-400 text-sm">
                    Found {searchResults.length} results
                  </p>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                              result.category
                            )}`}
                          >
                            {result.category}
                          </span>
                          <p className="text-white mt-2">{result.fact}</p>
                          <p className="text-slate-500 text-xs mt-1">
                            {formatDate(result.timestamp)} • Accessed{" "}
                            {result.access_count} times
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="glass p-6 rounded-xl hover:scale-105 transition duration-300 text-left"
              >
                <Plus className="text-cyan-400 mb-3" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">
                  Add New Memory
                </h3>
                <p className="text-slate-400">
                  Store a new fact or piece of information
                </p>
              </button>

              <button
                onClick={() => handleClearMemories()}
                className="glass p-6 rounded-xl hover:scale-105 transition duration-300 text-left border-red-500/20"
              >
                <Trash2 className="text-red-400 mb-3" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">
                  Clear All Memories
                </h3>
                <p className="text-slate-400">
                  Remove all stored memories and start fresh
                </p>
              </button>
            </div>

            {/* Recent Memories */}
            {memories && memories.facts.length > 0 && (
              <div className="glass p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">
                  Recent Memories
                </h3>
                <div className="space-y-3">
                  {memories.facts
                    .slice(-5)
                    .reverse()
                    .map((fact) => (
                      <div
                        key={fact.id}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                                fact.category
                              )}`}
                            >
                              {fact.category}
                            </span>
                            <p className="text-white mt-2">{fact.fact}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              {formatDate(fact.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Facts Tab */}
        {activeTab === "facts" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">All Facts</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition"
              >
                <Plus size={20} />
                Add Fact
              </button>
            </div>

            {memories && memories.facts.length > 0 ? (
              <div className="grid gap-3">
                {memories.facts
                  .slice()
                  .reverse()
                  .map((fact) => (
                    <div
                      key={fact.id}
                      className="glass p-5 rounded-xl border border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${getCategoryColor(
                              fact.category
                            )}`}
                          >
                            {fact.category}
                          </span>
                          <p className="text-white text-lg mt-3">
                            {fact.fact}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-slate-400 text-sm">
                            <span>{formatDate(fact.timestamp)}</span>
                            <span>•</span>
                            <span>Accessed {fact.access_count} times</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="glass p-12 rounded-xl text-center">
                <Brain className="text-slate-600 mx-auto mb-4" size={48} />
                <p className="text-slate-400 text-lg">
                  No memories stored yet
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Start adding facts to build your knowledge base
                </p>
              </div>
            )}
          </div>
        )}

        {/* Knowledge Graph Tab */}
        {activeTab === "graph" && (
          <div className="glass p-8 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Knowledge Graph
              </h3>
              <Network className="text-cyan-400" size={32} />
            </div>

            {memories && memories.relationships && Object.keys(memories.relationships).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(memories.relationships).map(([key, rel]) => (
                  <div
                    key={key}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <p className="text-cyan-400 font-medium">
                          {rel.entity1}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-cyan-500/20 rounded-lg">
                        <p className="text-cyan-400 text-sm font-medium">
                          {rel.type}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-purple-400 font-medium">
                          {rel.entity2}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="text-slate-600 mx-auto mb-4" size={48} />
                <p className="text-slate-400 text-lg">
                  No relationships defined yet
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Relationships will be automatically created as you chat with
                  Velora
                </p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                Conversation History
              </h3>
              <button
                onClick={() => handleClearMemories("conversation_history")}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition"
              >
                <Trash2 size={20} />
                Clear History
              </button>
            </div>

            {memories && memories.conversation_history.length > 0 ? (
              <div className="space-y-3">
                {memories.conversation_history
                  .slice()
                  .reverse()
                  .map((conv) => (
                    <div
                      key={conv.id}
                      className="glass p-5 rounded-xl border border-slate-700"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold text-sm">
                            U
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-400 text-xs mb-1">
                              You • {formatDate(conv.timestamp)}
                            </p>
                            <p className="text-white">{conv.user_message}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            V
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-400 text-xs mb-1">
                              Velora
                            </p>
                            <p className="text-slate-300">
                              {conv.ai_response}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="glass p-12 rounded-xl text-center">
                <MessageSquare
                  className="text-slate-600 mx-auto mb-4"
                  size={48}
                />
                <p className="text-slate-400 text-lg">
                  No conversation history
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Your conversations will be stored here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add Fact Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass p-8 rounded-2xl max-w-md w-full border border-cyan-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Add New Memory
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Category
                  </label>
                  <select
                    value={newFact.category}
                    onChange={(e) =>
                      setNewFact({ ...newFact, category: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="preferences">Preferences</option>
                    <option value="knowledge">Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Fact / Information
                  </label>
                  <textarea
                    value={newFact.fact}
                    onChange={(e) =>
                      setNewFact({ ...newFact, fact: e.target.value })
                    }
                    placeholder="Enter the fact or information to remember..."
                    rows="4"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <button
                  onClick={handleAddFact}
                  disabled={!newFact.fact.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  Save Memory
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}