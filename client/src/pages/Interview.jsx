import { Button } from "../components/Button"
import { Input } from "../components/Input"
import React from "react";
function Interview() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-purple-100">
      {/* Sidebar */}
      <div className="w-80 bg-[#1C1C1C] p-4 flex flex-col">
        <div className="mb-4">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-zinc-800">
            Begin a New Chat
          </Button>
        </div>

        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input placeholder="Search" className="pl-9 bg-zinc-800 border-none text-white placeholder:text-zinc-400" />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Category</h3>
          <div className="space-y-1">
            {["General", "Sales", "Negotiation", "Marketing"].map((item) => (
              <Button key={item} variant="ghost" className="w-full justify-start text-white hover:bg-zinc-800">
                {item}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Recent Chats</h3>
          <div className="space-y-1">
            {["How can I increase the m...", "What's the best approach...", "What's the best approach..."].map(
              (chat, i) => (
                <Button key={i} variant="ghost" className="w-full justify-start text-white hover:bg-zinc-800 truncate">
                  {chat}
                </Button>
              ),
            )}
          </div>
        </div>

        <Button variant="ghost" className="justify-start text-white hover:bg-zinc-800 mt-auto">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          User Profile
          <svg className="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 flex items-center border-b">
          <div className="flex-1 flex items-center gap-8">
            <h1 className="text-xl font-semibold">Negotio</h1>
            <nav className="flex gap-6">
              {["General", "Sales", "Negotiation", "Marketing"].map((tab) => (
                <a
                  key={tab}
                  href="#"
                  className={`text-sm ${
                    tab === "General" ? "text-black bg-zinc-900 px-4 py-1 rounded-full" : "text-zinc-500"
                  }`}
                >
                  {tab}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <svg className="h-12 w-12 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-4xl font-semibold mb-4">
            How can we <span className="text-purple-600">assist</span> you today?
          </h2>
          <p className="text-zinc-600 text-center mb-12 max-w-2xl">
            Get expert guidance powered by AI agents specializing in Sales, Marketing, and Negotiation. Choose the agent
            that suits your needs and start your conversation with ease.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[
              {
                title: "Sales Strategies",
                desc: "Get tailored advice on increasing property visibility and driving sales.",
              },
              {
                title: "Negotiation Tactics",
                desc: "Learn expert negotiation tips to close deals effectively.",
              },
              {
                title: "Marketing Insights",
                desc: "Discover the best marketing strategies to showcase your properties.",
              },
              {
                title: "General Support",
                desc: "Need help with something else? Ask away, and we'll guide you.",
              },
            ].map((card) => (
              <div key={card.title} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2">{card.title}</h3>
                <p className="text-sm text-zinc-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </main>

        <div className="p-4 border-t">
          <div className="max-w-4xl mx-auto flex gap-2 items-center bg-white/80 backdrop-blur rounded-full border px-4">
            <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <Input placeholder="type your prompt here" className="border-0 focus-visible:ring-0 bg-transparent" />
            <Button size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 rotate-90"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interview;

