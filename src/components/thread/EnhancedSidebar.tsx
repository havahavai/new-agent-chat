"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamContext } from "@/providers/Stream";
import { useThreads } from "@/providers/Thread";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  MessageSquare,
  Clock,
  Trash2,
  ChevronLeft,
  X,
} from "lucide-react";
import { useQueryState } from "nuqs";

interface EnhancedSidebarProps {
  className?: string;
}

export function EnhancedSidebar({ className }: EnhancedSidebarProps) {
  const stream = useStreamContext();
  const { threads, getThreads, threadsLoading } = useThreads();
  const { layout, toggleSidebar, closeSidebar } = useLayoutState();
  const { isMobile } = useAdvancedResponsive();
  const [threadId, setThreadId] = useQueryState("threadId");

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredThreads, setFilteredThreads] = useState(threads || []);

  // Load threads on mount
  useEffect(() => {
    getThreads();
  }, [getThreads]);

  // Filter threads based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredThreads(threads || []);
    } else {
      const filtered = (threads || []).filter((thread: any) => {
        const title = thread.metadata?.title || "Untitled";
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredThreads(filtered);
    }
  }, [searchQuery, threads]);

  // Handle thread selection
  const handleThreadSelect = (selectedThreadId: string) => {
    setThreadId(selectedThreadId);
    if (isMobile) {
      closeSidebar();
    }
  };

  // Handle new thread creation
  const handleNewThread = () => {
    setThreadId(null);
    if (isMobile) {
      closeSidebar();
    }
  };

  // Format thread title
  const getThreadTitle = (thread: any) => {
    return thread.metadata?.title || "Untitled";
  };

  // Format thread date
  const formatThreadDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <AnimatePresence>
      {layout.sidebarOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "bg-background fixed top-0 left-0 z-40 h-full w-80 border-r shadow-lg",
            isMobile && "w-full max-w-sm",
            className,
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewThread}
                className="p-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeSidebar}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 p-2">
              {threadsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="text-sm">
                    {searchQuery
                      ? "No conversations found"
                      : "No conversations yet"}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewThread}
                      className="mt-4"
                    >
                      Start a conversation
                    </Button>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {filteredThreads.map((thread, index) => (
                    <motion.div
                      key={thread.thread_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant={
                          threadId === thread.thread_id ? "secondary" : "ghost"
                        }
                        className={cn(
                          "h-auto w-full justify-start p-3 text-left",
                          threadId === thread.thread_id && "bg-accent",
                        )}
                        onClick={() => handleThreadSelect(thread.thread_id)}
                      >
                        <div className="flex min-w-0 flex-1 flex-col items-start space-y-1">
                          <div className="flex w-full items-center space-x-2">
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate font-medium">
                              {getThreadTitle(thread)}
                            </span>
                          </div>
                          <div className="text-muted-foreground flex items-center space-x-2 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{formatThreadDate(thread.created_at)}</span>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-muted-foreground text-center text-xs">
              {filteredThreads.length} conversation
              {filteredThreads.length !== 1 ? "s" : ""}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
