"use client"

import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatView } from "@/components/chat-view"

export default function Home() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="hidden w-80 md:block">
        <ChatSidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatView />
      </div>
    </div>
  )
}
