  import { useEffect, useState } from "react";
  import axios from "axios";
  import { Button } from "../components/Button";
  import { Input } from "../components/Input";
  import React from "react";
  function Interview() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null); // Maintain session
    const [messages, setMessages] = useState([]); // Chat messages
    const [input, setInput] = useState(""); // User input message
    const [history, setHistory] = useState([]); // Chat history
    const [showAuthPopup, setShowAuthPopup] = useState(false); // Auth popup visibility
    const [authMode, setAuthMode] = useState("login"); // "login" or "signup"

    useEffect(() => {
      if (user) {
        fetchHistory();
      }
    }, [user]);
  console.log("User ",user);
      const fetchHistory = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/interviews/history/${user._id}`);
          setHistory(response.data.history);
        } catch (error) {
          console.error("Error fetching history:", error);
        }
    };

    const handleSendMessage = async () => {
      if (!user) {
        setShowAuthPopup(true);
        return;
      }

      if (!input.trim()) return;

      const userMessage = { text: input, sender: "user" };
      setMessages([...messages, userMessage]);

      try {
        const response = await axios.post(`http://localhost:5000/api/interviews/process`, {
          userId: user.id,
          message: input,
        });

        setMessages([...messages, userMessage, { text: response.data.reply, sender: "bot" }]);
      } catch (error) {
        console.error("Error processing message:", error);
      }

      setInput("");
    };

    const handleStartInterview = async () => {
      if (!user) {
        setShowAuthPopup(true);
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5000/api/interviews/start`, { userId: user.id });
        setMessages([{ text: response.data.question, sender: "bot" }]);
      } catch (error) {
        console.error("Error starting interview:", error);
      }
    };

    const handleSkipQuestion = async () => {
      if (!user) {
        setShowAuthPopup(true);
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5000/api/interviews/skip`, { userId: user.id });
        setMessages([...messages, { text: response.data.question, sender: "bot" }]);
      } catch (error) {
        console.error("Error skipping question:", error);
      }
    };

    const handleEndInterview = async () => {
      if (!user) {
        setShowAuthPopup(true);
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5000/api/interviews/end`, { userId: user.id });
        setMessages([...messages, { text: response.data.summary, sender: "bot" }]);
      } catch (error) {
        console.error("Error ending interview:", error);
      }
    };
  // Error Solved
    const handleAuth = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const name = formData.get("name");
      const password = formData.get("password");

      try {
        const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
        
        const response = await axios.post(`http://localhost:5000${endpoint}`, { name,email, password });
        console.log(authMode === "login" ? response : "This is Not Login" );

        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user)); // Persist login
        setShowAuthPopup(false);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };

    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem("user");
    };

    return (
      <div className="flex h-screen bg-gradient-to-br from-white to-purple-100">
        {/* Sidebar */}
        <div className="w-80 bg-[#1C1C1C] p-4 flex flex-col">
          <Button variant="ghost" className="w-full text-white" onClick={handleStartInterview}>
            Begin a New Chat
          </Button>

          <h3 className="text-sm font-medium text-zinc-400 mt-6">Recent Chats</h3>
          <div className="space-y-1">
            {history.map((chat, index) => (
              <Button key={index} variant="ghost" className="w-full text-white">
                {chat.title}
              </Button>
            ))}
          </div>

          <Button variant="ghost" className="mt-auto text-white" onClick={user ? handleLogout : () => setShowAuthPopup(true)}>
            {user ? "Logout" : "Login / Signup"}
          </Button>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <header className="p-4 flex justify-between border-b">
            <h1 className="text-xl font-semibold">CareerPilot AI</h1>
            <div>
              {!user ? (
                <Button onClick={() => setShowAuthPopup(true)}>Login / Signup</Button>
              ) : (
                <span className="text-gray-500">Welcome, {user.name}</span>
              )}
            </div>
          </header>

          <main className="flex-1 p-8 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">Start a chat to begin.</div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  <span className={msg.sender === "user" ? "bg-blue-500 text-white px-3 py-1 rounded-lg" : "bg-gray-300 px-3 py-1 rounded-lg"}>
                    {msg.text}
                  </span>
                </div>
              ))
            )}
          </main>

          <div className="p-4 border-t flex items-center">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="flex-1" />
            <Button onClick={handleSendMessage} className="ml-2">Send</Button>
          </div>
        </div>

        {/* Auth Popup */}
        {showAuthPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg relative">
              {/* Close Button */}
              <button onClick={() => setShowAuthPopup(false)} className="absolute top-2 right-2 text-gray-600 hover:text-black">
                ❌
              </button>

              <h2 className="text-lg font-bold mb-4">{authMode === "login" ? "Login" : "Signup"}</h2>
              <form onSubmit={handleAuth} className="space-y-3">
                <input type="email" name="email" placeholder="Email" required className="border p-2 w-full" />
                {authMode === "login" ? null : <input type="text" name="name" placeholder="Name" required className="border p-2 w-full" />}
                <input type="password" name="password" placeholder="Password" required className="border p-2 w-full" />
                <Button type="submit" className="w-full">{authMode === "login" ? "Login" : "Signup"}</Button>
              </form>
              <Button variant="link" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? "Create an account" : "Already have an account? Login"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default Interview;
