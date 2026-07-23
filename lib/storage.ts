import { Conversation, BackupData } from "@/types";

const STORAGE_KEY = "starchat_conversations";
const BACKUP_KEY = "starchat_backup";

export function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load conversations:", error);
  }
  return [];
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Failed to save conversations:", error);
  }
}

export function createConversation(title: string = "New Conversation"): Conversation {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addMessageToConversation(
  conversation: Conversation,
  message: { role: "user" | "assistant"; content: string }
): Conversation {
  const newMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  return {
    ...conversation,
    messages: [...conversation.messages, newMessage],
    updatedAt: Date.now(),
  };
}

export function updateConversationTitle(
  conversation: Conversation,
  title: string
): Conversation {
  return {
    ...conversation,
    title,
    updatedAt: Date.now(),
  };
}

export function deleteConversation(conversations: Conversation[], id: string): Conversation[] {
  return conversations.filter((conv) => conv.id !== id);
}

export function exportBackup(): string {
  const conversations = loadConversations();
  const backup: BackupData = {
    conversations,
    exportDate: Date.now(),
    version: "1.0.0",
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackup(backupData: string): boolean {
  try {
    const backup: BackupData = JSON.parse(backupData);
    if (backup.conversations) {
      saveConversations(backup.conversations);
      return true;
    }
  } catch (error) {
    console.error("Failed to import backup:", error);
  }
  return false;
}

export function generateTitleFromMessage(content: string): string {
  const maxLength = 30;
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.substring(0, maxLength) + "...";
}
