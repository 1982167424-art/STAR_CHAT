import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Image, Mic, Smile, Bot, User, Trash2 } from "lucide-react";
import { Message, Conversation } from "@/types";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatAreaProps {
  conversation: Conversation | null;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onClearConversation: () => void;
}

export default function ChatArea({
  conversation,
  isLoading,
  onSendMessage,
  onClearConversation,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, scrollToBottom]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !isLoading) {
      onSendMessage(trimmed);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30">
        <div className="text-center max-w-md px-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
            <Bot className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Welcome to STARCHAT
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Powered by Mimo V2.5, your intelligent AI assistant is ready to help
            with conversations, creativity, and brainstorming.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              "给我的金鱼起个霸气的名字",
              "用程序员的语气安慰一只失恋的猫",
              "午饭后犯困怎么办？",
              "帮我写一首关于春天的诗",
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(suggestion);
                }}
                className="px-4 py-3 rounded-xl bg-white/80 border border-primary-100 text-sm text-gray-600 hover:bg-primary-50 hover:border-primary-200 transition-all text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20">
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{conversation.title}</h2>
            <p className="text-xs text-gray-400">
              {conversation.messages.length} messages
            </p>
          </div>
        </div>
        <div className="relative">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg border border-red-100 px-3 py-2">
              <span className="text-sm text-gray-600">Clear?</span>
              <button
                onClick={() => {
                  onClearConversation();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 animate-fade-in ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                message.role === "user"
                  ? "bg-gradient-to-br from-primary-500 to-primary-700"
                  : "bg-gradient-to-br from-primary-100 to-primary-200"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-primary-600" />
              )}
            </div>
            <div className={`max-w-3xl ${message.role === "user" ? "text-right" : ""}`}>
              <div
                className={`inline-block px-5 py-3.5 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-tr-md"
                    : "bg-white text-gray-700 border border-primary-100 rounded-tl-md shadow-sm"
                }`}
              >
                {message.role === "assistant" ? (
                  <MarkdownRenderer content={message.content} />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
              </div>
              <p className={`text-xs text-gray-400 mt-1 ${message.role === "user" ? "mr-2" : "ml-2"}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div className="inline-block px-5 py-3.5 rounded-2xl bg-white border border-primary-100 rounded-tl-md shadow-sm">
              <div className="typing-indicator flex gap-1.5">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        className={`px-6 py-4 border-t border-primary-100 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
          isFocused ? "shadow-[0_-4px_20px_rgba(168,85,247,0.1)]" : ""
        }`}
      >
        <div
          className={`flex items-end gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${
            isFocused
              ? "border-primary-300 bg-white shadow-sm"
              : "border-primary-100 bg-primary-50/50"
          }`}
        >
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
              <Image className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="有问题，尽管问，Shift + Enter 换行..."
              className="w-full resize-none bg-transparent text-gray-700 placeholder-gray-400 text-sm focus:outline-none leading-relaxed max-h-32"
              rows={1}
            />
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
              <Mic className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`p-3 rounded-xl transition-all duration-300 ${
                inputValue.trim() && !isLoading
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          STARCHAT · Powered by Mimo V2.5
        </p>
      </div>
    </div>
  );
}
