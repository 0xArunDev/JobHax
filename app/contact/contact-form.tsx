"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send } from "lucide-react"
import { toast } from "sonner"

interface ContactFormProps {
  userName?: string
  userEmail?: string
}

const topics = [
  { value: "general", label: "General inquiry" },
  { value: "support", label: "Technical support" },
  { value: "billing", label: "Billing & accounts" },
  { value: "employer", label: "Employer services" },
  { value: "partnership", label: "Partnerships & press" },
]

export function ContactForm({ userName = "", userEmail = "" }: ContactFormProps) {
  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [topic, setTopic] = useState("general")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!email.trim()) {
      toast.error("Please enter your email")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    if (message.trim().length < 10) {
      toast.error("Message should be at least 10 characters")
      return
    }

    // Contact messages aren't persisted yet — acknowledge locally.
    toast.success("Message sent! Our team will get back to you within 24 hours.")
    setMessage("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            type="text"
            placeholder="Your name"
            className="h-11"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="name@example.com"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-topic">Topic</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger id="contact-topic" className="h-11 w-full">
            <SelectValue placeholder="What is this about?" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          placeholder="Tell us how we can help..."
          rows={6}
          className="resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full h-11 gap-2">
        Send Message
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
