import { useState } from "react";
import Sidebar from "../components/Sidebar";
import AvatarUpload from "../components/AvatarUpload";
import {
  User, Bell, Shield, Palette, Key, Database, Monitor,
  Volume2, Eye, Save, RotateCcw, Brain, Sun, Moon, Type, Move, Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";

export default function Settings() {
  const { user, updateAvatar, updateProfile } = useAuth();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("profile");
  const [showMobileTabs, setShowMobileTabs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem("velora-settings", JSON.stringify(settings));
    setSavedFeedback("Settings saved successfully!");
    setTimeout(() => setSavedFeedback(""), 3000);
    setIsSaving(false);
  };  const handleReset = () => {
    if (confirm("Reset all settings to default?")) {
      resetSettings();
      setSavedFeedback("Settings reset to default");
      setTimeout(() => setSavedFeedback(""), 3000);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "ai", label: "AI Settings", icon: Brain },
    { id: "advanced", label: "Advanced", icon: Monitor },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8 lg:mb-10">
          <div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-cyan-400 mb-2">Settings</h1>
            <p className="text-slate-400 text-sm md:text-base">Manage your account and application preferences</p>
            {savedFeedback && <div className="mt-2 text-sm text-green-400">{savedFeedback}</div>}
          </div>
          <div className="flex gap-2 md:gap-3">
            <button onClick={handleReset} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-sm md:text-base">
              <RotateCcw size={16} className="md:hidden" /><RotateCcw size={18} className="hidden md:block" /><span className="hidden sm:inline">Reset</span>
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg transition text-sm md:text-base disabled:opacity-50">
              <Save size={16} className="md:hidden" /><Save size={18} className="hidden md:block" /><span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <button onClick={() => setShowMobileTabs(!showMobileTabs)} className="w-full glass px-4 py-3 rounded-lg flex items-center justify-between">
                <span className="text-white font-medium">{tabs.find((t) => t.id === activeTab)?.label}</span>
                <Eye size={18} />
              </button>
              {showMobileTabs && (
                <div className="mt-2 glass rounded-lg p-2 space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowMobileTabs(false); }} className={`w-full px-4 py-2 rounded-lg flex items-center gap-3 transition ${activeTab === tab.id ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}>
                        <Icon size={18} />{tab.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="hidden lg:block glass rounded-2xl p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === tab.id ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}>
                      <Icon size={20} /><span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-6 md:p-8">              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                  <div className="mb-6">
                    <AvatarUpload currentAvatar={settings.avatar} onAvatarUpdate={(avatarData) => { updateSetting("avatar", avatarData); updateAvatar(avatarData); }} />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Username</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={settings.username} onChange={(e) => updateSetting("username", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Email</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={settings.email} onChange={(e) => updateSetting("email", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-400" />
                    </div>
                  </div>
                  <button onClick={() => { updateProfile(settings.username, settings.email); setSavedFeedback("Profile updated"); setTimeout(() => setSavedFeedback(""), 3000); }} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg transition">Update Profile</button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                  {[
                    { key: "notifications", label: "Enable Notifications", desc: "Receive notifications", icon: Bell },
                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive emails", icon: Bell },
                    { key: "pushNotifications", label: "Push Notifications", desc: "Browser notifications", icon: Bell },
                    { key: "soundEnabled", label: "Sound Effects", desc: "Play sounds", icon: Volume2 },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-cyan-400" />
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-slate-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => updateSetting(item.key, !settings[item.key])} className={`w-12 h-6 rounded-full transition ${settings[item.key] ? "bg-cyan-400" : "bg-slate-700"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${settings[item.key] ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Theme</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { value: "light", label: "Light", icon: Sun, desc: "Clean light mode" },
                        { value: "dark", label: "Dark", icon: Moon, desc: "Sleek dark mode" },
                      ].map((option) => (
                        <button key={option.value} onClick={() => updateSetting("theme", option.value)}
                          className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${settings.theme === option.value ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                          <option.icon size={24} className={settings.theme === option.value ? "text-cyan-400" : "text-slate-400"} />
                          <div className="text-left">
                            <p className="text-white font-medium">{option.label}</p>
                            <p className="text-slate-400 text-xs">{option.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Changes apply immediately to entire app</p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Font Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                      ].map((option) => (
                        <button key={option.value} onClick={() => updateSetting("fontSize", option.value)}
                          className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${settings.fontSize === option.value ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                          <Type size={22} className={settings.fontSize === option.value ? "text-cyan-400" : "text-slate-400"} />
                          <p className="text-white text-sm font-medium">{option.label}</p>
                          <p className="text-slate-400 text-xs" style={{ fontSize: option.value === "small" ? 12 : option.value === "medium" ? 14 : 16 }}>Aa</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Move size={20} className="text-cyan-400" />
                      <div>
                        <p className="text-white font-medium">Compact Mode</p>
                        <p className="text-slate-400 text-sm">Reduce spacing for more content</p>
                      </div>
                    </div>
                    <button onClick={() => updateSetting("compactMode", !settings.compactMode)} className={`w-12 h-6 rounded-full transition ${settings.compactMode ? "bg-cyan-400" : "bg-slate-700"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${settings.compactMode ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap size={20} className="text-cyan-400" />
                      <div>
                        <p className="text-white font-medium">Enable Animations</p>
                        <p className="text-slate-400 text-sm">Smooth transitions and effects</p>
                      </div>
                    </div>
                    <button onClick={() => updateSetting("animationsEnabled", !settings.animationsEnabled)} className={`w-12 h-6 rounded-full transition ${settings.animationsEnabled ? "bg-cyan-400" : "bg-slate-700"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${settings.animationsEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Privacy & Security</h2>
                  {[
                    { key: "twoFactorAuth", label: "Two-Factor Authentication", desc: "Add extra security to your account", icon: Shield },
                    { key: "dataCollection", label: "Data Collection", desc: "Allow anonymous usage data collection", icon: Shield },
                    { key: "shareUsageData", label: "Share Usage Data", desc: "Help improve Velora AI", icon: Database },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-cyan-400" />
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-slate-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => updateSetting(item.key, !settings[item.key])} className={`w-12 h-6 rounded-full transition ${settings[item.key] ? "bg-cyan-400" : "bg-slate-700"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${settings[item.key] ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "ai" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">AI Settings</h2>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Default Model</label>
                    <select value={settings.defaultModel} onChange={(e) => updateSetting("defaultModel", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Temperature: {settings.temperature}</label>
                    <input type="range" min="0" max="100" value={settings.temperature * 100} onChange={(e) => updateSetting("temperature", parseInt(e.target.value, 10) / 100)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1"><span>Precise</span><span>Creative</span></div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Max Tokens</label>
                    <input type="number" value={settings.maxTokens} onChange={(e) => updateSetting("maxTokens", parseInt(e.target.value, 10))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Response Style</label>
                    <select value={settings.responseStyle} onChange={(e) => updateSetting("responseStyle", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option value="balanced">Balanced</option>
                      <option value="precise">Precise</option>
                      <option value="creative">Creative</option>
                      <option value="concise">Concise</option>
                    </select>
                  </div>
                </div>
              )}
              {activeTab === "advanced" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Advanced Settings</h2>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Language</label>
                    <select value={settings.language} onChange={(e) => updateSetting("language", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="japanese">Japanese</option>
                      <option value="chinese">Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Timezone</label>
                    <select value={settings.timezone} onChange={(e) => updateSetting("timezone", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="America/New_York">US Eastern (EST)</option>
                      <option value="America/Los_Angeles">US Pacific (PST)</option>
                      <option value="Europe/London">UK (GMT)</option>
                      <option value="Europe/Paris">Europe (CET)</option>
                      <option value="Asia/Tokyo">Japan (JST)</option>
                      <option value="Australia/Sydney">Australia (AEST)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor size={20} className="text-cyan-400" />
                      <div>
                        <p className="text-white font-medium">Debug Mode</p>
                        <p className="text-slate-400 text-sm">Enable detailed logging</p>
                      </div>
                    </div>
                    <button onClick={() => updateSetting("debugMode", !settings.debugMode)} className={`w-12 h-6 rounded-full transition ${settings.debugMode ? "bg-cyan-400" : "bg-slate-700"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${settings.debugMode ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Custom API Key (Optional)</label>
                    <div className="relative">
                      <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" value={settings.apiKey} onChange={(e) => updateSetting("apiKey", e.target.value)} placeholder="Enter your API key" className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-400" />
                    </div>
                    <p className="text-slate-400 text-xs mt-1">Override default API key for advanced users</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}