import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Zap, Brain, MessageSquare, Code, Palette, Music, FileText, Send } from "lucide-react";
import { sendMessage } from "../services/gemini";

const agents = [
  {
    id: 1,
    name: "General Assistant",
    icon: MessageSquare,
    description: "General purpose AI assistant for everyday tasks",
    color: "cyan",
    capabilities: ["Conversation", "Q&A", "Writing", "Analysis"],
    active: true,
  },
  {
    id: 2,
    name: "Code Expert",
    icon: Code,
    description: "Specialized in programming and code review",
    color: "purple",
    capabilities: ["Code Generation", "Debugging", "Refactoring", "Documentation"],
    active: false,
  },
  {
    id: 3,
    name: "Creative Writer",
    icon: Palette,
    description: "Creative content and storytelling specialist",
    color: "pink",
    capabilities: ["Stories", "Poetry", "Scripts", "Ideas"],
    active: false,
  },
  {
    id: 4,
    name: "Data Analyst",
    icon: Brain,
    description: "Data analysis and insights generation",
    color: "blue",
    capabilities: ["Analysis", "Visualization", "Reports", "Patterns"],
    active: false,
  },
  {
    id: 5,
    name: "Music Composer",
    icon: Music,
    description: "Music theory and composition assistant",
    color: "green",
    capabilities: ["Composition", "Theory", "Arrangement", "Lyrics"],
    active: false,
  },
  {
    id: 6,
    name: "Document Assistant",
    icon: FileText,
    description: "Document creation and management",
    color: "orange",
    capabilities: ["Reports", "Summaries", "Formatting", "Templates"],
    active: false,
  },
];

export default function AIAgents() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [agentsList, setAgentsList] = useState(agents);

  const toggleAgent = (id) => {
    setAgentsList(prev => {
      const updated = prev.map(agent => 
        agent.id === id ? { ...agent, active: !agent.active } : agent
      );
      if (selectedAgent.id === id) {
        const toggled = updated.find(a => a.id === id);
        if (toggled) setSelectedAgent(toggled);
      }
      return updated;
    });
  };

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: `Hello! I am ${selectedAgent.name}. How can I help?` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  // Reset chat messages when selected agent changes
  useEffect(() => {
    setChatMessages([
      { role: "assistant", text: `Hello! I am ${selectedAgent.name}. How can I help?` }
    ]);
  }, [selectedAgent]);



  const sendAgentMessage = async () => {
    if (!chatInput.trim() || !selectedAgent) return;
    const userMsg = { role: "user", text: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const reply = await sendMessage(chatInput.trim(), selectedAgent.id);
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Error connecting to agent. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      cyan: "border-cyan-400 bg-cyan-400/10 text-cyan-400",
      purple: "border-purple-400 bg-purple-400/10 text-purple-400",
      pink: "border-pink-400 bg-pink-400/10 text-pink-400",
      blue: "border-blue-400 bg-blue-400/10 text-blue-400",
      green: "border-green-400 bg-green-400/10 text-green-400",
      orange: "border-orange-400 bg-orange-400/10 text-orange-400",
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 mb-2">
            AI Agents
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Select and configure your AI agents for different tasks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Agents List */}
          <div className="lg:col-span-1 space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">
              Available Agents
            </h2>
            {agentsList.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`glass p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedAgent.id === agent.id
                      ? "border-2 border-cyan-400"
                      : "border border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getColorClasses(agent.color)}`}>
                        <Icon size={20} className="md:hidden" />
                        <Icon size={24} className="hidden md:block" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-sm md:text-base truncate">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgent(agent.id);
                      }}
                      className={`px-2 md:px-3 py-1 rounded-lg text-xs font-medium transition flex-shrink-0 ${
                        agent.active
                          ? "bg-green-500/20 text-green-400 border border-green-400"
                          : "bg-slate-700 text-slate-400 border border-slate-600"
                      }`}
                    >
                      {agent.active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent Details */}
          <div className="lg:col-span-2">
            <div className="glass p-4 md:p-6 lg:p-8 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-xl ${getColorClasses(selectedAgent.color)}`}>
                  {(() => {
                    const Icon = selectedAgent.icon;
                    return <Icon size={32} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedAgent.name}
                  </h2>
                  <p className="text-slate-400 mt-1">
                    {selectedAgent.description}
                  </p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Capabilities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedAgent.capabilities.map((capability, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg"
                    >
                      <Zap size={16} className="text-cyan-400" />
                      <span className="text-slate-300">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Agent Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Response Style
                    </label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option>Balanced</option>
                      <option>Creative</option>
                      <option>Precise</option>
                      <option>Concise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Temperature: {selectedAgent.active ? "0.7" : "0.0"}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue={selectedAgent.active ? 70 : 0}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      defaultValue="2048"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Enable Memory</p>
                      <p className="text-slate-400 text-sm">
                        Allow agent to remember context
                      </p>
                    </div>
                        onClick={() => toggleAgent(selectedAgent.id)}
                    <button
                      className={`w-12 h-6 rounded-full transition ${
                        selectedAgent.active
                          ? "bg-cyan-400"
                          : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${
                          selectedAgent.active
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Agent Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-cyan-400">1.2K</p>
                    <p className="text-slate-400 text-sm mt-1">Queries</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-400">98%</p>
                    <p className="text-slate-400 text-sm mt-1">Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">0.8s</p>
                    <p className="text-slate-400 text-sm mt-1">Avg Response</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 mt-6">
          <h3 className="text-white text-lg font-semibold mb-3">Chat with {selectedAgent.name}</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
                <div className={`inline-block max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === "user" ? "bg-cyan-500 text-black" : "glass border border-cyan-500/20 text-white"
                }`}>{msg.text}</div>
              </div>
            ))}
            {chatLoading && <div className="text-left text-sm text-cyan-300 animate-pulse">Thinking...</div>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAgentMessage()}
              placeholder={`Message ${selectedAgent.name}...`}
              className="flex-1 p-3 rounded-xl bg-slate-900 border border-cyan-500/20 outline-none focus:border-cyan-400 text-sm text-white"
            />
            <button
              onClick={sendAgentMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}