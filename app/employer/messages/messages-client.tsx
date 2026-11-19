"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search,
  Send,
  Paperclip,
  ArrowLeft,
  FileText
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { sendEmployerMessage, getConversationMessagesAction } from "@/features/employer-features/employer.actions"
import { toast } from "sonner"
import { format } from "date-fns"

const statusColors = {
  new: "bg-blue-500/10 text-blue-600",
  screening: "bg-yellow-500/10 text-yellow-600",
  interview: "bg-green-500/10 text-green-600",
  offered: "bg-purple-500/10 text-purple-600",
  rejected: "bg-red-500/10 text-red-600",
}

export function EmployerMessagesClient({ 
  initialConversations, 
  currentUser 
}: { 
  initialConversations: any[],
  currentUser: any
}) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<any>(initialConversations[0] || null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadMessages = async (conversationId: number) => {
    setIsLoadingMessages(true)
    try {
      const response = await getConversationMessagesAction(conversationId)
      if (response.status === "SUCCESS") {
        setMessages(response.data)
      } else {
        toast.error(response.message || "Failed to load messages")
      }
    } catch {
      toast.error("An error occurred while loading messages")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const messageText = newMessage
    setNewMessage("")

    // Optimistic update
    const tempMessage = {
      id: Date.now(),
      senderRole: "employer",
      body: messageText,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, tempMessage])
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          lastMessage: messageText,
          lastMessageTime: new Date(),
        }
      }
      return conv
    }))

    const res = await sendEmployerMessage({
      conversationId: selectedConversation.id,
      body: messageText,
    })

    if (res.status === "ERROR") {
      toast.error(res.message)
    } else {
      // Reload so messages carry their real IDs from the server
      loadMessages(selectedConversation.id)
    }
  }

  const formatTime = (date: Date | string | null) => {
    if (!date) return ""
    return format(new Date(date), "MMM d, h:mm a")
  }

  const getAvatarFallback = (name: string) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar 
        userType="employer" 
        userName={currentUser?.employerDetails?.name || currentUser?.name || "Employer"} 
        userEmail={currentUser?.email || ""} 
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
          {/* Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search candidates..." className="pl-10" />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.length === 0 && (
                  <div className="text-center text-muted-foreground p-4 text-sm">
                    No conversations yet.
                  </div>
                )}
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv)
                      setShowMobileChat(true)
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedConversation?.id === conv.id 
                        ? 'bg-primary/10' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Avatar>
                      {conv.applicantAvatar && <AvatarImage src={conv.applicantAvatar} />}
                      <AvatarFallback className="bg-secondary">{getAvatarFallback(conv.applicantName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{conv.applicantName || "Candidate"}</p>
                        <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">{conv.applicantTitle}</p>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[conv.applicationStatus as keyof typeof statusColors] || statusColors.new}`}>
                          {conv.applicationStatus || "new"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage || "No messages yet."}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="shrink-0">{conv.unreadCount}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden"
                      onClick={() => setShowMobileChat(false)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar>
                      {selectedConversation.applicantAvatar && <AvatarImage src={selectedConversation.applicantAvatar} />}
                      <AvatarFallback className="bg-secondary">{getAvatarFallback(selectedConversation.applicantName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedConversation.applicantName || "Candidate"}</p>
                        <Badge variant="outline" className={`text-xs ${statusColors[selectedConversation.applicationStatus as keyof typeof statusColors] || statusColors.new}`}>
                          {selectedConversation.applicationStatus || "new"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedConversation.applicantTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {isLoadingMessages ? (
                      <div className="text-center text-muted-foreground text-sm py-4">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-4">No messages yet. Start the conversation!</div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderRole === 'employer' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              message.senderRole === 'employer'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderRole === 'employer' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input 
                      placeholder="Type a message..." 
                      className="flex-1"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
                <Search className="h-12 w-12 opacity-20" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
