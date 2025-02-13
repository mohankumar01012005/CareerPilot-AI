import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import React from "react";

function Interview() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [authData, setAuthData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
      setShowRolePopup(true);
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/interviews/history/${user._id}`);
      setHistory(response.data.history);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleAuth = async () => {
    setError(""); 

    try {
      const url = authMode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await axios.post(`http://localhost:5000${url}`, authData);

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setShowAuthPopup(false);
      setAuthData({ name: "", email: "", password: "" }); 
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    }
  };

  const handleStartInterview = async () => {
    if (!role || !difficulty) {
      alert("Please select both role and difficulty.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/interviews/start`, {
        userId: user._id,
        role,
        difficulty,
      });

      localStorage.setItem("sessionId", response.data.sessionId);
      setMessages([{ text: response.data.question, sender: "AI" }]);
      setShowRolePopup(false);
      setInterviewStarted(true);
    } catch (error) {
      console.error("Error starting interview:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    if (!input.trim()) return;

    if (!role || !difficulty) {
      setShowRolePopup(true);
      return;
    }

    const userMessage = { text: input, sender: "You" };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post(`http://localhost:5000/api/interviews/process`, {
        userId: user._id,
        sessionId: localStorage.getItem("sessionId"),
        answer: input,
      });

      setMessages([...messages, userMessage, { text: response.data.feedback, sender: "AI" }, { text: response.data.nextQuestion, sender: "AI" }]);
    } catch (error) {
      console.error("Error processing message:", error);
    }

    setInput("");
  };

  const handleSkipQuestion = async () => {
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/interviews/skip`, {
        userId: user._id,
        sessionId: localStorage.getItem("sessionId"),
      });

      setMessages([...messages, { text: response.data.nextQuestion, sender: "AI" }]);
    } catch (error) {
      console.error("Error skipping question:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-purple-100">
      <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <h2 className="text-lg font-semibold mb-4">Chat History</h2>
        <ul>
          {history.map((item, index) => (
            <li key={index} className="p-2 border-b border-gray-700">{item.question}</li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="p-4 flex justify-between border-b">
          <h1 className="text-xl font-semibold">CareerPilot AI</h1>
          <div>
            {!user ? (
              <Button onClick={() => setShowAuthPopup(true)}>Login / Signup</Button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">Welcome, {user.name}</span>
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-8 max-w-4xl mx-auto">
          {showAuthPopup && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4">{authMode === "login" ? "Login" : "Signup"}</h2>
                {authMode === "signup" && (
                  <Input placeholder="Enter name..." value={authData.name} onChange={(e) => setAuthData({ ...authData, name: e.target.value })} />
                )}
                <Input placeholder="Enter email..." value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} />
                <Input type="password" placeholder="Enter password..." value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} />

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex justify-between mt-4">
                  <Button onClick={() => setShowAuthPopup(false)}>Cancel</Button>
                  <Button onClick={handleAuth}>{authMode === "login" ? "Login" : "Signup"}</Button>
                </div>
              </div>
            </div>
          )}

          {showRolePopup && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Enter Your Job Role & Difficulty</h2>
                <Input placeholder="Enter job role..." value={role} onChange={(e) => setRole(e.target.value)} />
                <select className="mt-4 p-2 border rounded-md w-full" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <div className="flex justify-between mt-4">
                  <Button onClick={() => setShowRolePopup(false)}>Collapse</Button>
                  <Button onClick={handleStartInterview}>Start Interview</Button>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.sender === "You" ? "text-right" : ""}`}>
              <p className={`inline-block p-2 rounded-lg ${msg.sender === "You" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                <strong>{msg.sender}: </strong>{msg.text}
              </p>
            </div>
          ))}

          <div className="mt-4 flex">
            <Input className="flex-1" placeholder="Type your answer..." value={input} onChange={(e) => setInput(e.target.value)} />
            <Button onClick={handleSendMessage}>Send</Button>
            <Button onClick={handleSkipQuestion}>Skip</Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Interview;
