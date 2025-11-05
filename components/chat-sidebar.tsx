"use client"

import { MessageSquare, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ChatSidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
  } = useChatStore()

  const handleNew = () => {
    const id = createConversation()
    setCurrentConversation(id)
  }

  return (
    <div className="bg-muted/20 flex h-full flex-col border-r">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">对话历史</h2>
        <Button onClick={handleNew} size="icon" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {conversations.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">
              暂无对话
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group hover:bg-muted flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-colors",
                  currentConversationId === conv.id && "bg-muted"
                )}
                onClick={() => setCurrentConversation(conv.id)}
              >
                <MessageSquare className="text-muted-foreground h-4 w-4 shrink-0" />
                <div className="flex-1 truncate text-sm">{conv.title}</div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
