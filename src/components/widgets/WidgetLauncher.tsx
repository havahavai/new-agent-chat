"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { componentMap, ComponentType } from "@/components/widgets";
import { cn } from "@/lib/utils";
import {
  Search,
  Grid3X3,
  List,
  X,
  Play,
  Info,
  Star,
  Clock,
  Map,
  Plane,
  CreditCard,
  Cloud,
  Settings,
  Filter,
} from "lucide-react";

interface WidgetLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Widget metadata for better organization
interface WidgetMetadata {
  id: ComponentType;
  name: string;
  description: string;
  category: "travel" | "payment" | "utility" | "information";
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

const WIDGET_METADATA: WidgetMetadata[] = [
  {
    id: "flightOptions",
    name: "Flight Options",
    description: "Search and compare flight options with real-time pricing",
    category: "travel",
    icon: Plane,
    tags: ["flights", "search", "pricing", "comparison"],
    isPopular: true,
  },
  {
    id: "flightStatus",
    name: "Flight Status",
    description: "Track flight status and get real-time updates",
    category: "travel",
    icon: Plane,
    tags: ["tracking", "status", "updates"],
  },
  {
    id: "payment",
    name: "Payment",
    description: "Process payments and manage transactions",
    category: "payment",
    icon: CreditCard,
    tags: ["payment", "transactions", "billing"],
    isPopular: true,
  },
  {
    id: "weather",
    name: "Weather",
    description: "Get current weather conditions and forecasts",
    category: "information",
    icon: Cloud,
    tags: ["weather", "forecast", "conditions"],
  },
  {
    id: "lounge",
    name: "Lounge Access",
    description: "Find and book airport lounge access",
    category: "travel",
    icon: Map,
    tags: ["lounge", "airport", "access"],
  },
  {
    id: "searchCriteria",
    name: "Search Criteria",
    description: "Set and manage search preferences",
    category: "utility",
    icon: Settings,
    tags: ["search", "preferences", "criteria"],
  },
  {
    id: "review",
    name: "Review",
    description: "Review and rate services",
    category: "utility",
    icon: Star,
    tags: ["review", "rating", "feedback"],
  },
  {
    id: "non-agent-flow",
    name: "Non-Agent Flow",
    description: "Direct interaction without AI agent",
    category: "utility",
    icon: Settings,
    tags: ["direct", "manual", "flow"],
  },
];

export function WidgetLauncher({
  isOpen,
  onClose,
  className,
}: WidgetLauncherProps) {
  const { openWidget } = useWidgetState();
  const { openWidgetPanel } = useLayoutState();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "category" | "popular">("name");

  // Filter and sort widgets
  const filteredWidgets = useMemo(() => {
    let widgets = WIDGET_METADATA;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      widgets = widgets.filter(
        (widget) =>
          widget.name.toLowerCase().includes(query) ||
          widget.description.toLowerCase().includes(query) ||
          widget.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      widgets = widgets.filter(
        (widget) => widget.category === selectedCategory,
      );
    }

    // Sort widgets
    widgets.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        case "popular":
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return widgets;
  }, [searchQuery, selectedCategory, sortBy]);

  // Categories for filtering
  const categories = useMemo(() => {
    const cats = new Set(WIDGET_METADATA.map((w) => w.category));
    return Array.from(cats);
  }, []);

  // Handle widget launch
  const handleLaunchWidget = useCallback(
    async (widgetId: ComponentType) => {
      try {
        await openWidget({
          type: widgetId,
          data: {},
        });

        // Open widget panel if not already open
        openWidgetPanel();

        // Close launcher
        onClose();
      } catch (error) {
        console.error("Failed to launch widget:", error);
      }
    },
    [openWidget, openWidgetPanel, onClose],
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-2xl",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="text-2xl font-semibold">Widget Launcher</h2>
              <p className="text-muted-foreground mt-1">
                Select a widget to launch in the panel
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="border-b p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-4 flex items-center space-x-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Widget Grid/List */}
          <ScrollArea className="h-96 p-6">
            {filteredWidgets.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="text-muted-foreground mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-medium">No widgets found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWidgets.map((widget) => (
                  <Card
                    key={widget.id}
                    className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    onClick={() => handleLaunchWidget(widget.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <widget.icon className="text-primary h-5 w-5" />
                          <CardTitle className="text-base">
                            {widget.name}
                          </CardTitle>
                        </div>
                        <div className="flex items-center space-x-1">
                          {widget.isPopular && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              Popular
                            </Badge>
                          )}
                          {widget.isNew && (
                            <Badge
                              variant="default"
                              className="text-xs"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="mb-3 text-sm">
                        {widget.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {widget.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {widget.tags.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              +{widget.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="hover:bg-accent/50 hover:border-accent-foreground/50 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all duration-200"
                    onClick={() => handleLaunchWidget(widget.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <widget.icon className="text-primary h-5 w-5" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{widget.name}</h3>
                          {widget.isPopular && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              Popular
                            </Badge>
                          )}
                          {widget.isNew && (
                            <Badge
                              variant="default"
                              className="text-xs"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {widget.description}
                        </p>
                        <div className="mt-1 flex items-center space-x-1">
                          {widget.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>
                {filteredWidgets.length} widget
                {filteredWidgets.length !== 1 ? "s" : ""} available
              </span>
              <div className="flex items-center space-x-4">
                <span>Press Esc to close</span>
                <span>Click to launch</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
