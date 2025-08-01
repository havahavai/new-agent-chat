"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { useStreamContext } from "@/providers/Stream";
import { cn } from "@/lib/utils";
import {
  Menu,
  MessageSquare,
  Map,
  Settings,
  Home,
  History,
  Plus,
  Search,
} from "lucide-react";

interface MobileNavigationBarProps {
  className?: string;
}

export function MobileNavigationBar({ className }: MobileNavigationBarProps) {
  const { layout, toggleSidebar, toggleWidgetPanel, toggleBottomSheet } =
    useLayoutState();
  const { isMobile } = useAdvancedResponsive();
  const stream = useStreamContext();

  const [activeTab, setActiveTab] = useState("chat");
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle tab selection
  const handleTabSelect = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      setIsExpanded(false);

      switch (tab) {
        case "sidebar":
          toggleSidebar();
          break;
        case "widgets":
          toggleWidgetPanel();
          break;
        case "new":
          // Handle new chat/thread
          break;
        default:
          break;
      }
    },
    [toggleSidebar, toggleWidgetPanel],
  );

  // Navigation items
  const navItems = [
    { id: "sidebar", icon: Menu, label: "Chats", action: "toggle" },
    { id: "chat", icon: MessageSquare, label: "Chat", action: "current" },
    { id: "widgets", icon: Map, label: "Widgets", action: "toggle" },
    { id: "new", icon: Plus, label: "New", action: "create" },
  ];

  if (!isMobile) return null;

  return (
    <div className={cn("mobile-navigation-bar", className)}>
      {/* Main Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-background fixed right-0 bottom-0 left-0 z-40 border-t shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTabSelect(item.id)}
              className="flex h-16 flex-1 flex-col items-center space-y-1"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Expanded Quick Actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-4 bottom-20 left-4 z-30"
          >
            <div className="bg-background space-y-3 rounded-lg border p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle search
                    setIsExpanded(false);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle history
                    setIsExpanded(false);
                  }}
                  className="flex items-center space-x-2"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle settings
                    setIsExpanded(false);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle home
                    setIsExpanded(false);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed right-4 bottom-20 z-50"
      >
        <Button
          size="lg"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Status Indicators */}
      {stream.messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 left-4 z-50"
        >
          <div className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium shadow-lg">
            {stream.messages.length} messages
          </div>
        </motion.div>
      )}

      {/* Widget Status */}
      {layout.widgetPanelOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed right-4 bottom-32 z-50"
        >
          <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
            Widgets Active
          </div>
        </motion.div>
      )}
    </div>
  );
}
