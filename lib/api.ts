import { Message } from "@/types";

const API_KEY = "sk-chpw3yyqtql6izsrpfyl8e0n8l0esw2ynn4vduxp43nab6n5";
const API_URL = "https://api.xiaomimimo.com/v1/chat/completions";
const MODEL = "MiMo-V2.5";

export async function streamChat(
  messages: Message[],
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onComplete();
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.warn("Failed to parse chunk:", e);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function getChatResponse(messages: Message[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullContent = "";
    streamChat(
      messages,
      (content) => {
        fullContent += content;
      },
      () => {
        resolve(fullContent);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
