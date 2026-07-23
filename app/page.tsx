import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { Conversation } from "@/types";
import {
  loadConversations,
  saveConversations,
  createConversation,
  addMessageToConversation,
  updateConversationTitle,
  deleteConversation,
  exportBackup,
  importBackup,
  generateTitleFromMessage,
} from "@/lib/storage";
import { streamChat } from "@/lib/api";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tempAssistantMessage, setTempAssistantMessage] = useState<string>("");

  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    if (loaded.length > 0) {
      setActiveConversationId(loaded[0].id);
    }
  }, []);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const handleCreateConversation = useCallback(() => {
    const newConversation = createConversation();
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setTempAssistantMessage("");
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setTempAssistantMessage("");
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    const updated = deleteConversation(conversations, id);
    setConversations(updated);
    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
    setTempAssistantMessage("");
  }, [conversations, activeConversationId]);

  const handleClearConversation = useCallback(() => {
    if (!activeConversationId) return;
    const updated = conversations.map((c) =>
      c.id === activeConversationId ? { ...c, messages: [], updatedAt: Date.now() } : c
    );
    setConversations(updated);
    setTempAssistantMessage("");
  }, [activeConversationId, conversations]);

  const handleExportBackup = useCallback(() => {
    const backupData = exportBackup();
    const blob = new Blob([backupData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starchat-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportBackup = useCallback((data: string) => {
    const success = importBackup(data);
    if (success) {
      const loaded = loadConversations();
      setConversations(loaded);
      if (loaded.length > 0) {
        setActiveConversationId(loaded[0].id);
      }
    }
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId) return;

      setIsLoading(true);
      setTempAssistantMessage("");

      const updatedConversations = conversations.map((c) => {
        if (c.id === activeConversationId) {
          const withUserMessage = addMessageToConversation(c, { role: "user", content });
          const title =
            c.messages.length === 0
              ? generateTitleFromMessage(content)
              : c.title;
          return updateConversationTitle(withUserMessage, title);
        }
        return c;
      });
      setConversations(updatedConversations);

      const currentConversation = updatedConversations.find((c) => c.id === activeConversationId);

      await streamChat(
        currentConversation?.messages || [],
        (chunk) => {
          setTempAssistantMessage((prev) => prev + chunk);
        },
        () => {
          const finalConversations = conversations.map((c) => {
            if (c.id === activeConversationId) {
              return addMessageToConversation(c, {
                role: "assistant",
                content: tempAssistantMessage,
              });
            }
            return c;
          });
          setConversations(finalConversations);
          setIsLoading(false);
          setTempAssistantMessage("");
        },
        (error) => {
          console.error("Chat error:", error);
          setIsLoading(false);
          setTempAssistantMessage("");
        }
      );
    },
    [activeConversationId, conversations, tempAssistantMessage]
  );

  const displayConversation = tempAssistantMessage
    ? {
        ...activeConversation!,
        messages: [
          ...(activeConversation?.messages || []),
          {
            id: "temp",
            role: "assistant",
            content: tempAssistantMessage,
            timestamp: Date.now(),
          },
        ],
      }
    : activeConversation;

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={handleDeleteConversation}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />
      <ChatArea
        conversation={displayConversation}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClearConversation={handleClearConversation}
      />
    </div>
  );
}
