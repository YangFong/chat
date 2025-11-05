"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { Conversation, Message } from "@/lib/types"

interface ChatStore {
  conversations: Conversation[]
  currentConversationId: string | null
  currentConversation: Conversation | null

  // 操作
  createConversation: () => string
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void
  clearConversations: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      currentConversation: null,

      createConversation: () => {
        const id = generateId()
        const newConversation: Conversation = {
          id,
          title: "新对话",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
          currentConversation: newConversation,
        }))

        return id
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const newConversations = state.conversations.filter(
            (c) => c.id !== id
          )
          const newCurrentId =
            state.currentConversationId === id
              ? newConversations[0]?.id || null
              : state.currentConversationId

          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
            currentConversation:
              newConversations.find((c) => c.id === newCurrentId) || null,
          }
        })
      },

      setCurrentConversation: (id: string) => {
        const conversation = get().conversations.find((c) => c.id === id)
        set({
          currentConversationId: id,
          currentConversation: conversation || null,
        })
      },

      addMessage: (conversationId: string, message: Message) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const updatedConv = {
                ...conv,
                messages: [...conv.messages, message],
                updatedAt: Date.now(),
              }

              // 如果是对话的第一条用户消息，使用它作为标题
              if (
                conv.messages.length === 0 &&
                message.role === "user" &&
                message.content
              ) {
                updatedConv.title = message.content.slice(0, 30)
              }

              return updatedConv
            }
            return conv
          })

          return {
            conversations,
            currentConversation:
              state.currentConversationId === conversationId
                ? conversations.find((c) => c.id === conversationId) || null
                : state.currentConversation,
          }
        })
      },

      updateMessage: (
        conversationId: string,
        messageId: string,
        updates: Partial<Message>
      ) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                updatedAt: Date.now(),
              }
            }
            return conv
          })

          return {
            conversations,
            currentConversation:
              state.currentConversationId === conversationId
                ? conversations.find((c) => c.id === conversationId) || null
                : state.currentConversation,
          }
        })
      },

      clearConversations: () => {
        set({
          conversations: [],
          currentConversationId: null,
          currentConversation: null,
        })
      },
    }),
    {
      name: "chat-storage",
      // 只持久化必要的数据
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)
