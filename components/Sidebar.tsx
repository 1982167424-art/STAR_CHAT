import React, { useState } from "react";
import { MessageSquarePlus, Trash2, ChevronDown, ChevronRight, Download, Upload } from "lucide-react";
import { Conversation } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (data: string) => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onExportBackup,
  onImportBackup,
}: SidebarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  const handleExport = () => {
    onExportBackup();
    setShowMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImportBackup(event.target?.result as string);
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setShowMenu(false);
  };

  return (
    <div
      className={`h-full bg-white/80 backdrop-blur-md border-r border-primary-100 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      <div className="p-4 border-b border-primary-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              STARCHAT
            </h1>
          )}
          <div className="flex items-center gap-2">
            {!collapsed && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-primary-100 z-10 py-1 animate-fade-in">
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      导出备份
                    </button>
                    <button
                      onClick={handleImport}
                      className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Upload className="w-4 h-4" />
                      导入备份
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onCreateConversation}
        className={`mx-3 mt-3 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
          collapsed ? "py-8" : ""
        }`}
      >
        <MessageSquarePlus className={`w-5 h-5 ${collapsed ? "w-6 h-6" : ""}`} />
        {!collapsed && <span>New Conversation</span>}
      </button>

      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 ? (
          !collapsed && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquarePlus className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const isConfirmingDelete = deleteConfirmId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={`relative ${
                    collapsed ? "px-2" : "px-3"
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-primary-100 text-primary-700"
                        : "hover:bg-primary-50 text-gray-700"
                    } ${collapsed ? "py-8 text-center" : ""}`}
                  >
                    {collapsed ? (
                      <MessageSquarePlus className="w-5 h-5 mx-auto" />
                    ) : (
                      <>
                        <div className="font-medium text-sm truncate">
                          {conversation.title}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400 truncate flex-1 mr-2">
                            {conversation.messages.length > 0
                              ? conversation.messages[
                                  conversation.messages.length - 1
                                ].content.substring(0, 20) +
                                (conversation.messages[
                                  conversation.messages.length - 1
                                ].content.length > 20
                                  ? "..."
                                  : "")
                              : ""}
                          </span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatDate(conversation.updatedAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </button>

                  {!collapsed && !isConfirmingDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(conversation.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 hover:opacity-100 hover:bg-red-50 transition-all group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  )}

                  {!collapsed && isConfirmingDelete && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                          setDeleteConfirmId(null);
                        }}
                        className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="p-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                      >
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700">STARCHAT</div>
              <div className="text-xs text-gray-400">Powered by Mimo V2.5</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
