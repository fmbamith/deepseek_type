"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, AlertCircle } from "lucide-react"
import SettingsModal from "@/components/settings-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ChatPage() {
  const [apiKey, setApiKey] = useState<string>("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("meta-llama/llama-3.1-8b-instruct:free")

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("openrouter_api_key")
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }

    const storedModel = localStorage.getItem("openrouter_model")
    if (storedModel) {
      setSelectedModel(storedModel)
    }
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    streamProtocol: "text",
    body: {
      apiKey,
      model: selectedModel,
    },
    onError: (error) => {
      console.error("Chat error details:", error)
    },
  })

  const saveSettings = (key: string, model: string) => {
    localStorage.setItem("openrouter_api_key", key)
    localStorage.setItem("openrouter_model", model)
    setApiKey(key)
    setSelectedModel(model)
    setIsSettingsOpen(false)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) {
      alert("Please set your OpenRouter API key in settings first")
      return
    }
    if (!input.trim()) return
    handleSubmit(e)
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">OpenRouter Chat</h1>
        <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="relative">
          <Settings className="h-5 w-5" />
          {!apiKey && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />}
        </Button>
      </div>

      {!apiKey && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please set your OpenRouter API key in settings to start chatting.</AlertDescription>
        </Alert>
      )}

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Chat</span>
            {selectedModel && (
              <span className="text-sm font-normal text-gray-500">
                Model: {selectedModel.split("/").pop()?.replace(":free", " (Free)")}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto pb-0">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {apiKey ? "Start a conversation by sending a message below" : "Set your API key to begin"}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "Failed to send message. Please check your API key and try again."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4">
          <form onSubmit={onSubmit} className="w-full flex gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder={apiKey ? "Type your message..." : "Please set your API key in settings first"}
              className="flex-grow resize-none"
              rows={1}
              disabled={!apiKey || isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim() && apiKey) {
                    onSubmit(e as any)
                  }
                }
              }}
            />
            <Button type="submit" disabled={!input.trim() || !apiKey || isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </form>
        </CardFooter>
      </Card>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        onSave={saveSettings}
      />
    </div>
  )
}
