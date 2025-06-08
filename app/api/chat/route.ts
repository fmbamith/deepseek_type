import type { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, model = "meta-llama/llama-3.1-8b-instruct:free" } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "API key is required" }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Messages array is required" }, { status: 400 })
    }

    console.log("Making request to OpenRouter with model:", model)

    // Add system message to ensure English responses
    const systemMessage = {
      role: "system",
      content:
        "You are a helpful AI assistant. Always respond in English, regardless of the language of the user's question.",
    }

    // Prepare messages with system message
    const messagesWithSystem = [systemMessage, ...messages]

    // Make request to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "OpenRouter Chat App",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: messagesWithSystem,
        stream: true,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)

      let errorMessage = "OpenRouter API error"
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorMessage
      } catch {
        errorMessage = `${response.status}: ${response.statusText}`
      }

      return Response.json({ error: errorMessage }, { status: response.status })
    }

    // Create a readable stream that transforms OpenRouter's SSE format
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim()

                if (data === "[DONE]") {
                  controller.close()
                  return
                }

                if (data) {
                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content

                    if (content) {
                      // Send the content directly as expected by useChat
                      controller.enqueue(encoder.encode(content))
                    }
                  } catch (e) {
                    // Skip invalid JSON
                    continue
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        } finally {
          reader.releaseLock()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("API route error:", error)
    return Response.json({ error: "Internal server error. Please try again." }, { status: 500 })
  }
}
