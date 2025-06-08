"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: string
  selectedModel: string
  onSave: (apiKey: string, model: string) => void
}

const AVAILABLE_MODELS = [
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Free) - Recommended" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini (Free)" },
  { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B (Free)" },
  { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek R1 (Free) - May respond in Chinese" },
  { id: "anthropic/claude-3-opus:beta", name: "Claude 3 Opus (Paid)" },
  { id: "anthropic/claude-3-sonnet:beta", name: "Claude 3 Sonnet (Paid)" },
  { id: "anthropic/claude-3-haiku:beta", name: "Claude 3 Haiku (Paid)" },
  { id: "openai/gpt-4o", name: "GPT-4o (Paid)" },
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo (Paid)" },
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo (Paid)" },
]

export default function SettingsModal({ isOpen, onClose, apiKey, selectedModel, onSave }: SettingsModalProps) {
  const [key, setKey] = useState(apiKey)
  const [model, setModel] = useState(selectedModel)

  const handleSave = () => {
    if (!key.trim()) {
      alert("Please enter your OpenRouter API key")
      return
    }
    onSave(key.trim(), model)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key">OpenRouter API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-..."
            />
            <p className="text-xs text-gray-500">
              Get your API key from{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Free models have usage limits. Paid models require credits in your OpenRouter account.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
