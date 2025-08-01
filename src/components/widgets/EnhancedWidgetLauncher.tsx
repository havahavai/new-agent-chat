"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { componentMap, ComponentType } from "@/components/widgets";
import { cn } from "@/lib/utils";
import { ANIMATIONS, MICRO_INTERACTIONS } from "@/utils/animations";
import { memoize, debounce } from "@/utils/performance";
import {
  statePersistence,
  PERSISTENCE_CONFIGS,
} from "@/utils/state-persistence";
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
  Heart,
  History,
  TrendingUp,
  Zap,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Users,
  Globe,
  Shield,
  Palette,
  BarChart3,
  Calendar,
  FileText,
  Image,
  Video,
  Music,
  Download,
  Upload,
  Share2,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  Star as StarIcon,
} from "lucide-react";

interface EnhancedWidgetLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Enhanced widget metadata
interface EnhancedWidgetMetadata {
  id: ComponentType;
  name: string;
  description: string;
  category:
    | "travel"
    | "payment"
    | "utility"
    | "information"
    | "entertainment"
    | "productivity";
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isBeta?: boolean;
  isPremium?: boolean;
  usageCount?: number;
  lastUsed?: number;
  isFavorite?: boolean;
  complexity: "simple" | "medium" | "complex";
  estimatedTime: string;
  features: string[];
  dependencies?: string[];
}

const ENHANCED_WIDGET_METADATA: EnhancedWidgetMetadata[] = [
  {
    id: "flightOptions",
    name: "Flight Options",
    description:
      "Search and compare flight options with real-time pricing and availability",
    category: "travel",
    icon: Plane,
    tags: ["flights", "search", "pricing", "comparison", "airlines", "booking"],
    isPopular: true,
    isNew: false,
    complexity: "medium",
    estimatedTime: "2-3 min",
    features: [
      "Real-time pricing",
      "Multiple airlines",
      "Price alerts",
      "Flexible dates",
    ],
    usageCount: 1250,
    lastUsed: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  },
  {
    id: "flightStatus",
    name: "Flight Status",
    description:
      "Track flight status and get real-time updates on delays and gate changes",
    category: "travel",
    icon: Plane,
    tags: ["tracking", "status", "updates", "delays", "gates"],
    complexity: "simple",
    estimatedTime: "1 min",
    features: [
      "Real-time updates",
      "Push notifications",
      "Gate information",
      "Delay alerts",
    ],
    usageCount: 890,
    lastUsed: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  },
  {
    id: "payment",
    name: "Payment Processing",
    description:
      "Secure payment processing with multiple payment methods and fraud protection",
    category: "payment",
    icon: CreditCard,
    tags: [
      "payment",
      "transactions",
      "billing",
      "security",
      "fraud-protection",
    ],
    isPopular: true,
    isPremium: true,
    complexity: "complex",
    estimatedTime: "3-5 min",
    features: [
      "Multiple payment methods",
      "Fraud protection",
      "Receipt generation",
      "Refund processing",
    ],
    usageCount: 567,
    lastUsed: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
  },
  {
    id: "weather",
    name: "Weather Forecast",
    description:
      "Get current weather conditions and detailed forecasts for any location",
    category: "information",
    icon: Cloud,
    tags: ["weather", "forecast", "conditions", "temperature", "precipitation"],
    complexity: "simple",
    estimatedTime: "1 min",
    features: [
      "Current conditions",
      "7-day forecast",
      "Hourly updates",
      "Weather alerts",
    ],
    usageCount: 2340,
    lastUsed: Date.now() - 30 * 60 * 1000, // 30 minutes ago
  },
  {
    id: "lounge",
    name: "Lounge Access",
    description:
      "Find and book airport lounge access with amenities and reviews",
    category: "travel",
    icon: Map,
    tags: ["lounge", "airport", "access", "amenities", "reviews"],
    complexity: "medium",
    estimatedTime: "2 min",
    features: [
      "Lounge locations",
      "Amenity details",
      "Booking system",
      "User reviews",
    ],
    usageCount: 445,
    lastUsed: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
  },
  {
    id: "searchCriteria",
    name: "Search Criteria",
    description: "Set and manage advanced search preferences and filters",
    category: "utility",
    icon: Settings,
    tags: ["search", "preferences", "criteria", "filters", "customization"],
    complexity: "medium",
    estimatedTime: "2-3 min",
    features: [
      "Custom filters",
      "Saved preferences",
      "Quick presets",
      "Advanced options",
    ],
    usageCount: 678,
    lastUsed: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
  },
  {
    id: "review",
    name: "Review System",
    description:
      "Comprehensive review and rating system with sentiment analysis",
    category: "utility",
    icon: Star,
    tags: ["review", "rating", "feedback", "sentiment", "analysis"],
    complexity: "complex",
    estimatedTime: "4-6 min",
    features: [
      "Multi-criteria ratings",
      "Sentiment analysis",
      "Photo uploads",
      "Moderation tools",
    ],
    usageCount: 1234,
    lastUsed: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
  },
  {
    id: "non-agent-flow",
    name: "Direct Interaction",
    description: "Direct interaction without AI agent for manual workflows",
    category: "utility",
    icon: Users,
    tags: ["direct", "manual", "flow", "workflow", "automation"],
    complexity: "medium",
    estimatedTime: "2-4 min",
    features: [
      "Manual workflows",
      "Direct API access",
      "Custom logic",
      "Integration tools",
    ],
    usageCount: 345,
    lastUsed: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
  },
];

// User preferences and state
interface UserPreferences {
  favorites: ComponentType[];
  recentUsage: Array<{ id: ComponentType; timestamp: number }>;
  searchHistory: string[];
  viewMode: "grid" | "list";
  sortBy: "name" | "category" | "popular" | "recent" | "usage";
  filters: {
    categories: string[];
    complexity: string[];
    features: string[];
  };
}

export function EnhancedWidgetLauncher({
  isOpen,
  onClose,
  className,
}: EnhancedWidgetLauncherProps) {
  const { openWidget } = useWidgetState();
  const { openWidgetPanel } = useLayoutState();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "name" | "category" | "popular" | "recent" | "usage"
  >("popular");
  const [activeTab, setActiveTab] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [selectedWidget, setSelectedWidget] =
    useState<EnhancedWidgetMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    () => {
      const saved = statePersistence.load(PERSISTENCE_CONFIGS.USER_PREFERENCES);
      return (
        saved || {
          favorites: [],
          recentUsage: [],
          searchHistory: [],
          viewMode: "grid",
          sortBy: "popular",
          filters: {
            categories: [],
            complexity: [],
            features: [],
          },
        }
      );
    },
  );

  // Save preferences when they change
  useEffect(() => {
    statePersistence.save(
      PERSISTENCE_CONFIGS.USER_PREFERENCES,
      userPreferences,
    );
  }, [userPreferences]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
        if (query && !userPreferences.searchHistory.includes(query)) {
          setUserPreferences((prev) => ({
            ...prev,
            searchHistory: [query, ...prev.searchHistory.slice(0, 9)],
          }));
        }
      }, 300),
    [userPreferences.searchHistory],
  );

  // Memoized filtered and sorted widgets
  const filteredWidgets = useMemo(() => {
    let widgets = ENHANCED_WIDGET_METADATA;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      widgets = widgets.filter(
        (widget) =>
          widget.name.toLowerCase().includes(query) ||
          widget.description.toLowerCase().includes(query) ||
          widget.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          widget.features.some((feature) =>
            feature.toLowerCase().includes(query),
          ),
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      widgets = widgets.filter(
        (widget) => widget.category === selectedCategory,
      );
    }

    // Apply favorites filter
    if (showFavorites) {
      widgets = widgets.filter((widget) =>
        userPreferences.favorites.includes(widget.id),
      );
    }

    // Apply recent filter
    if (showRecent) {
      const recentIds = userPreferences.recentUsage
        .slice(0, 10)
        .map((u) => u.id);
      widgets = widgets.filter((widget) => recentIds.includes(widget.id));
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
          return (b.usageCount || 0) - (a.usageCount || 0);
        case "recent":
          return (b.lastUsed || 0) - (a.lastUsed || 0);
        case "usage":
          return (b.usageCount || 0) - (a.usageCount || 0);
        default:
          return 0;
      }
    });

    return widgets;
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    showFavorites,
    showRecent,
    userPreferences,
  ]);

  // Categories for filtering
  const categories = useMemo(() => {
    const cats = new Set(ENHANCED_WIDGET_METADATA.map((w) => w.category));
    return Array.from(cats);
  }, []);

  // Handle widget launch
  const handleLaunchWidget = useCallback(
    async (widget: EnhancedWidgetMetadata) => {
      setIsLoading(true);
      try {
        // Update usage count and last used
        const updatedWidget = {
          ...widget,
          usageCount: (widget.usageCount || 0) + 1,
          lastUsed: Date.now(),
        };

        // Update recent usage
        setUserPreferences((prev) => ({
          ...prev,
          recentUsage: [
            { id: widget.id, timestamp: Date.now() },
            ...prev.recentUsage.filter((u) => u.id !== widget.id).slice(0, 19),
          ],
        }));

        await openWidget({
          type: widget.id,
          data: {},
        });

        openWidgetPanel();
        onClose();
      } catch (error) {
        console.error("Failed to launch widget:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [openWidget, openWidgetPanel, onClose, setUserPreferences],
  );

  // Handle favorite toggle
  const handleToggleFavorite = useCallback((widgetId: ComponentType) => {
    setUserPreferences((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(widgetId)
        ? prev.favorites.filter((id) => id !== widgetId)
        : [...prev.favorites, widgetId],
    }));
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  // Get recent widgets
  const recentWidgets = useMemo(() => {
    return userPreferences.recentUsage
      .slice(0, 6)
      .map((usage) => ENHANCED_WIDGET_METADATA.find((w) => w.id === usage.id))
      .filter(Boolean) as EnhancedWidgetMetadata[];
  }, [userPreferences.recentUsage]);

  // Get favorite widgets
  const favoriteWidgets = useMemo(() => {
    return userPreferences.favorites
      .map((id) => ENHANCED_WIDGET_METADATA.find((w) => w.id === id))
      .filter(Boolean) as EnhancedWidgetMetadata[];
  }, [userPreferences.favorites]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
            className,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ANIMATIONS.fadeIn.transition}
        >
          <motion.div
            className="bg-background max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={ANIMATIONS.scaleIn.transition}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="text-primary h-6 w-6" />
                <div>
                  <h2 className="text-xl font-semibold">Widget Launcher</h2>
                  <p className="text-muted-foreground text-sm">
                    Choose from {ENHANCED_WIDGET_METADATA.length} powerful
                    widgets
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="border-b p-6">
              <div className="mb-4 flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search widgets..."
                    className="pl-10"
                    onChange={(e) => debouncedSearch(e.target.value)}
                    defaultValue={searchQuery}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid3X3 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center space-x-2">
                <Badge
                  variant={showFavorites ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setShowFavorites(!showFavorites)}
                >
                  <Heart className="mr-1 h-3 w-3" />
                  Favorites
                </Badge>
                <Badge
                  variant={showRecent ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setShowRecent(!showRecent)}
                >
                  <Clock className="mr-1 h-3 w-3" />
                  Recent
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "secondary"
                    }
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Widgets</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="all"
                  className="h-full"
                >
                  <WidgetGrid
                    widgets={filteredWidgets}
                    viewMode={viewMode}
                    onLaunch={handleLaunchWidget}
                    onToggleFavorite={handleToggleFavorite}
                    userPreferences={userPreferences}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent
                  value="recent"
                  className="h-full"
                >
                  <WidgetGrid
                    widgets={recentWidgets}
                    viewMode={viewMode}
                    onLaunch={handleLaunchWidget}
                    onToggleFavorite={handleToggleFavorite}
                    userPreferences={userPreferences}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent
                  value="favorites"
                  className="h-full"
                >
                  <WidgetGrid
                    widgets={favoriteWidgets}
                    viewMode={viewMode}
                    onLaunch={handleLaunchWidget}
                    onToggleFavorite={handleToggleFavorite}
                    userPreferences={userPreferences}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent
                  value="popular"
                  className="h-full"
                >
                  <WidgetGrid
                    widgets={ENHANCED_WIDGET_METADATA.filter(
                      (w) => w.isPopular || (w.usageCount || 0) > 500,
                    )}
                    viewMode={viewMode}
                    onLaunch={handleLaunchWidget}
                    onToggleFavorite={handleToggleFavorite}
                    userPreferences={userPreferences}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Widget Grid Component
interface WidgetGridProps {
  widgets: EnhancedWidgetMetadata[];
  viewMode: "grid" | "list";
  onLaunch: (widget: EnhancedWidgetMetadata) => void;
  onToggleFavorite: (widgetId: ComponentType) => void;
  userPreferences: UserPreferences;
  isLoading: boolean;
}

function WidgetGrid({
  widgets,
  viewMode,
  onLaunch,
  onToggleFavorite,
  userPreferences,
  isLoading,
}: WidgetGridProps) {
  if (widgets.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center">
        <div className="text-center">
          <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>No widgets found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-6">
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1",
        )}
      >
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            viewMode={viewMode}
            onLaunch={onLaunch}
            onToggleFavorite={onToggleFavorite}
            isFavorite={userPreferences.favorites.includes(widget.id)}
            isLoading={isLoading}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

// Widget Card Component
interface WidgetCardProps {
  widget: EnhancedWidgetMetadata;
  viewMode: "grid" | "list";
  onLaunch: (widget: EnhancedWidgetMetadata) => void;
  onToggleFavorite: (widgetId: ComponentType) => void;
  isFavorite: boolean;
  isLoading: boolean;
}

function WidgetCard({
  widget,
  viewMode,
  onLaunch,
  onToggleFavorite,
  isFavorite,
  isLoading,
}: WidgetCardProps) {
  const Icon = widget.icon;

  return (
    <motion.div
      variants={ANIMATIONS.scaleIn}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      whileTap="whileTap"
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          viewMode === "list" && "flex flex-row",
        )}
        onClick={() => onLaunch(widget)}
      >
        <CardHeader className={cn("pb-3", viewMode === "list" && "flex-1")}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Icon className="text-primary h-6 w-6" />
                {widget.isNew && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs">
                    NEW
                  </Badge>
                )}
                {widget.isBeta && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs"
                  >
                    BETA
                  </Badge>
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{widget.name}</CardTitle>
                <CardDescription className="text-sm">
                  {widget.description}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(widget.id);
              }}
            >
              {isFavorite ? (
                <Heart className="h-4 w-4 fill-current text-red-500" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className={cn("pt-0", viewMode === "list" && "flex-1")}>
          <div className="space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {widget.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {widget.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  +{widget.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Features */}
            <div className="text-muted-foreground text-xs">
              <div className="mb-1 flex items-center space-x-2">
                <Zap className="h-3 w-3" />
                <span>Features: {widget.features.slice(0, 2).join(", ")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{widget.estimatedTime}</span>
                <span>•</span>
                <span className="capitalize">{widget.complexity}</span>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>{widget.usageCount?.toLocaleString() || 0} uses</span>
              </div>
              {widget.lastUsed && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(widget.lastUsed)}</span>
                </div>
              )}
            </div>

            {/* Launch Button */}
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                onLaunch(widget);
              }}
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Launch Widget
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Utility function to format time ago
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
