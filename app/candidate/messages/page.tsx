"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { useState, useEffect, useTransition } from "react"
import { 
    fetchApplicantConversationsAction, 
    fetchApplicantConversationMessagesAction,
    sendCandidateMessage,
    fetchApplicantProfileAction
} from "@/features/candidate-features/candidate.actions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function CandidateMessagesPage() {
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  
  const [messageText, setMessageText] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadData() {
      try {
        const [convRes, profileRes] = await Promise.all([
            fetchApplicantConversationsAction(),
            fetchApplicantProfileAction()
        ]);
        if (convRes.status === "SUCCESS") {
            setConversations(convRes.data || []);
        }
        if (profileRes.status === "SUCCESS") {
            setUser(profileRes.data);
        }
      } catch (error) {
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [])

  useEffect(() => {
      if (selectedConversation) {
          fetchApplicantConversationMessagesAction(selectedConversation.id).then((res) => {
              if (res.status === "SUCCESS") {
                  setMessages(res.data || []);
              }
          });
      }
  }, [selectedConversation]);

  const handleSendMessage = () => {
      if (!messageText.trim() || !selectedConversation) return;

      const text = messageText.trim();
      setMessageText("");

      const optimisticMessage = {
          id: Date.now(), // temp id
          conversationId: selectedConversation.id,
          senderRole: "applicant",
          senderId: user?.id,
          body: text,
          createdAt: new Date(),
          isRead: true
      };

      setMessages(prev => [...prev, optimisticMessage]);

      startTransition(async () => {
          const res = await sendCandidateMessage({
              conversationId: selectedConversation.id,
              body: text
          });
          
          if (res.status !== "SUCCESS") {
              toast.error(res.message);
              // Remove optimistic message on failure
              setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
              setMessageText(text); // restore text
          }
      });
  }

  if (loading) {
      return (
          <div className="flex min-h-screen">
              <DashboardSidebar userType="candidate" userName="" userEmail="" />
              <main className="flex-1 overflow-auto flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </main>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar 
        userType="candidate" 
        userName={user?.name || ""} 
        userEmail={user?.email || ""} 
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
          {/* Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
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
                      <AvatarFallback className="bg-secondary uppercase">{conv.employerName?.charAt(0) || "C"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{conv.jobTitle}</p>
                        <span className="text-xs text-muted-foreground">
                            {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt)) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conv.employerName}</p>
                      {/* TODO: Add unread count indicator here based on lastReadAt logic if needed */}
                    </div>
                  </button>
                ))}

                {conversations.length === 0 && (
                    <div className="text-center text-muted-foreground mt-8 text-sm">
                        No active conversations yet.
                    </div>
                )}
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
                      <AvatarFallback className="bg-secondary uppercase">{selectedConversation.employerName?.charAt(0) || "C"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConversation.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">{selectedConversation.employerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
    
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMe = message.senderRole === "applicant";
                      return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                          <p className={`text-xs mt-1 text-right ${
                            isMe 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )})}

                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            No messages yet. Send a message to start the conversation!
                        </div>
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
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                      }}
                      disabled={isPending}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={isPending || !messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                </>
            ) : (
                /* Empty State for Desktop */
                <div className="hidden md:flex flex-1 items-center justify-center">
                  <Card className="max-w-sm">
                    <CardContent className="py-12 text-center border-dashed">
                      <p className="text-muted-foreground">Select a conversation to start messaging</p>
                    </CardContent>
                  </Card>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
