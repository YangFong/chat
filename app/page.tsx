"use client"

import { useState } from "react"

import { ChatHeader } from "@/components/chat-header"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatView } from "@/components/chat-view"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  return (
    <div className="flex h-screen w-full flex-col">
      <ChatHeader
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleMobileSidebar={() => setShowMobileSidebar(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 桌面端侧边栏 */}
        {showSidebar && (
          <div className="hidden w-80 md:block">
            <ChatSidebar />
          </div>
        )}

        {/* 移动端侧边栏（抽屉） */}
        <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
          <SheetContent side="left" className="w-80 p-0">
            <ChatSidebar />
          </SheetContent>
        </Sheet>

        {/* 主聊天区域 */}
        <div className="flex-1">
          <ChatView />
        </div>
      </div>
    </div>
  )
}
