"use client"

import { MessageSquare, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatTime } from "@/lib/format"
import { useChatStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ChatSidebar() {
  const {
    conversations,
    currentConversationId,
    setCurrentConversation,
    deleteConversation,
  } = useChatStore()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null)

  const handleNew = () => {
    // 清空当前对话，让用户可以开始新对话
    setCurrentConversation(null)
  }

  const handleDeleteClick = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    setConversationToDelete(convId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete)
      setConversationToDelete(null)
    }
    setDeleteDialogOpen(false)
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
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-sm">{conv.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatTime(conv.updatedAt)}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteClick(e, conv.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个对话吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
