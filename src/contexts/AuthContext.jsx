import { createContext, useContext, useState } from "react";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("velora-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    // Simulate login - in production, this would call an API
    const users = JSON.parse(localStorage.getItem("velora-users") || "[]");
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        avatar: foundUser.avatar,
        createdAt: foundUser.createdAt
      };
      setUser(userData);
      localStorage.setItem("velora-user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const signup = async (username, email, password) => {
    // Simulate signup - in production, this would call an API
    const users = JSON.parse(localStorage.getItem("velora-users") || "[]");
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: "Email already exists" };
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      avatar: null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("velora-users", JSON.stringify(users));

    const userData = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    };
    setUser(userData);
    localStorage.setItem("velora-user", JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("velora-user");
  };

  const updateAvatar = (avatarData) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarData };
      setUser(updatedUser);
      localStorage.setItem("velora-user", JSON.stringify(updatedUser));
      
      // Update in users list too
      const users = JSON.parse(localStorage.getItem("velora-users") || "[]");
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].avatar = avatarData;
        localStorage.setItem("velora-users", JSON.stringify(users));
      }
    }
  };

  const updateProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("velora-user", JSON.stringify(updatedUser));
      
      // Update in users list too
      const users = JSON.parse(localStorage.getItem("velora-users") || "[]");
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem("velora-users", JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateAvatar, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
