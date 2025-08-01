"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStreamContext } from "@/providers/Stream";
import { useThreads } from "@/providers/Thread";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { Menu, MessageSquare, Clock, Plus, X, Search } from "lucide-react";

interface ChatHistoryButtonProps {
  className?: string;
}

export function ChatHistoryButton({ className }: ChatHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [threadId, setThreadId] = useQueryState("threadId");
  const { isMobile } = useAdvancedResponsive();
  const stream = useStreamContext();
  const { threads, getThreads, threadsLoading } = useThreads();

  // Filter threads based on search query
  const filteredThreads = threads.filter(
    (thread) =>
      (thread.metadata?.title && typeof thread.metadata.title === "string"
        ? thread.metadata.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : false) ||
      thread.thread_id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle thread selection
  const handleThreadSelect = (threadId: string) => {
    setThreadId(threadId);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Handle new thread creation
  const handleNewThread = () => {
    setThreadId(null);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Get thread title
  const getThreadTitle = (thread: any) => {
    return (
      thread.metadata?.title || `Conversation ${thread.thread_id.slice(0, 8)}`
    );
  };

  // Format thread date
  const formatThreadDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Chat History Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "h-10 w-10 rounded-full border bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/90",
          className,
        )}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Chat History Bottom Sheet */}
      <Sheet
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SheetContent
          side="bottom"
          className={cn(
            "border-primary/20 flex h-[85vh] flex-col border-t-4 p-0",
            className,
          )}
        >
          {/* Header */}
          <SheetHeader className="flex-shrink-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SheetTitle className="text-lg font-semibold">
                  Chat History
                </SheetTitle>
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                  {filteredThreads.length} conversations
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2 p-4">
              {/* New Chat Button */}
              <Button
                variant="outline"
                onClick={handleNewThread}
                className="h-auto w-full justify-start p-4"
              >
                <Plus className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">New Conversation</div>
                  <div className="text-muted-foreground text-xs">
                    Start a fresh chat
                  </div>
                </div>
              </Button>

              {/* Loading State */}
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
                          "h-auto w-full justify-start p-4 text-left",
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
        </SheetContent>
      </Sheet>
    </>
  );
}
