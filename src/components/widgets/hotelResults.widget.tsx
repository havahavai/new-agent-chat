"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/common/ui/button";
import {
  Clock,
  Star,
  DollarSign,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bed,
  Wifi,
  X,
  Car,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { submitInterruptResponse } from "./util";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface HotelOption {
  hotelOfferId: string;
  hotelName: string;
  hotelId: string;
  chainCode: string;
  cityCode: string;
  latitude: number;
  longitude: number;
  currency: string;
  totalAmount: string;
  baseAmount: string;
  boardType: string;
  roomType: string;
  adults: number;
  rankingScore: number;
  pros: string[];
  cons: string[];
  tags: string[];
  policies: {
    paymentType: string;
    cancellation?: {
      amount: string;
      deadline: string;
    };
  };
}

const getCurrencySymbol = (currencyCode: string): string => {
  const currencyMap: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NOK': 'kr',
    'MXN': '$',
    'NZD': 'NZ$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'ZAR': 'R',
    'THB': '฿',
    'AED': 'د.إ',
    'SAR': '﷼',
    'KRW': '₩',
    'BRL': 'R$',
    'RUB': '₽',
    'TRY': '₺',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'ILS': '₪',
    'CLP': '$',
    'COP': '$',
    'PEN': 'S/',
    'ARS': '$',
    'UYU': '$U',
    'BOB': 'Bs',
    'PYG': '₲',
    'VES': 'Bs.S',
    'DKK': 'kr',
    'ISK': 'kr',
    'RON': 'lei',
    'BGN': 'лв',
    'HRK': 'kn',
    'RSD': 'дин',
    'UAH': '₴',
    'BYN': 'Br',
    'MDL': 'L',
    'GEL': '₾',
    'AMD': '֏',
    'AZN': '₼',
    'KZT': '₸',
    'UZS': 'soʻm',
    'KGS': 'с',
    'TJS': 'ЅМ',
    'TMT': 'T',
    'MNT': '₮',
    'LAK': '₭',
    'KHR': '៛',
    'MMK': 'K',
    'VND': '₫',
    'IDR': 'Rp',
    'MYR': 'RM',
    'PHP': '₱',
    'TWD': 'NT$',
    'PKR': '₨',
    'LKR': '₨',
    'BDT': '৳',
    'NPR': '₨',
    'BTN': 'Nu.',
    'MVR': '.ރ',
    'AFN': '؋',
    'IRR': '﷼',
    'IQD': 'ع.د',
    'JOD': 'د.ا',
    'KWD': 'د.ك',
    'LBP': 'ل.ل',
    'OMR': 'ر.ع.',
    'QAR': 'ر.ق',
    'SYP': '£',
    'YER': '﷼',
    'BHD': '.د.ب',
    'EGP': '£',
    'LYD': 'ل.د',
    'MAD': 'د.م.',
    'TND': 'د.ت',
    'DZD': 'د.ج',
    'AOA': 'Kz',
    'BWP': 'P',
    'BIF': 'Fr',
    'XOF': 'Fr',
    'XAF': 'Fr',
    'KMF': 'Fr',
    'DJF': 'Fr',
    'ERN': 'Nfk',
    'ETB': 'Br',
    'GMD': 'D',
    'GHS': '₵',
    'GNF': 'Fr',
    'KES': 'Sh',
    'LSL': 'L',
    'LRD': '$',
    'MGA': 'Ar',
    'MWK': 'MK',
    'MUR': '₨',
    'MZN': 'MT',
    'NAD': '$',
    'NGN': '₦',
    'RWF': 'Fr',
    'SCR': '₨',
    'SLL': 'Le',
    'SOS': 'Sh',
    'STN': 'Db',
    'SZL': 'L',
    'TZS': 'Sh',
    'UGX': 'Sh',
    'XPF': 'Fr',
    'ZMW': 'ZK',
    'ZWL': '$',
  };

  return currencyMap[currencyCode.toUpperCase()] || currencyCode;
};

const getBadgeConfigs = (tags: string[]) => {
  // Priority order: recommended > cheapest > best_location
  // Only show one badge per hotel
  if (tags.includes("recommended")) {
    return [{
      emoji: "⭐",
      text: "Best",
      color: "bg-white text-gray-800 border-gray-200",
    }];
  }
  if (tags.includes("cheapest")) {
    return [{
      emoji: "💰",
      text: "Cheapest",
      color: "bg-white text-gray-800 border-gray-200",
    }];
  }
  if (tags.includes("best_location")) {
    return [{
      emoji: "📍",
      text: "Best Location",
      color: "bg-white text-gray-800 border-gray-200",
    }];
  }

  return [];
};

// Hotel Amenities Display Component
const HotelAmenitiesDisplay = ({ hotel }: { hotel: HotelOption }) => {
  const amenities = [];

  // Add amenities based on hotel characteristics
  if (hotel.boardType?.toLowerCase().includes('breakfast')) {
    amenities.push({ icon: Utensils, label: 'Breakfast', color: 'text-green-600' });
  }
  if (hotel.tags?.includes('wifi')) {
    amenities.push({ icon: Wifi, label: 'Free WiFi', color: 'text-blue-600' });
  }
  if (hotel.tags?.includes('parking')) {
    amenities.push({ icon: Car, label: 'Parking', color: 'text-gray-600' });
  }
  if (hotel.roomType?.toLowerCase().includes('suite')) {
    amenities.push({ icon: Star, label: 'Suite', color: 'text-yellow-600' });
  }

  // Default amenities if none found
  if (amenities.length === 0) {
    amenities.push({ icon: Bed, label: 'Comfortable', color: 'text-gray-600' });
    amenities.push({ icon: Wifi, label: 'WiFi', color: 'text-blue-600' });
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-4 px-2 py-2 bg-gray-50 rounded-lg">
      {amenities.map((amenity, index) => {
        const Icon = amenity.icon;
        return (
          <div key={index} className="flex items-center gap-2 flex-1">
            <Icon className={`h-4 w-4 ${amenity.color} flex-shrink-0`} />
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-700">{amenity.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HotelCard = ({
  hotel,
  onSelect,
  isLoading,
}: {
  hotel: HotelOption;
  onSelect: (hotelOfferId: string) => void;
  isLoading?: boolean;
}) => {
  const badgeConfigs = hotel.tags && hotel.tags.length > 0 ? getBadgeConfigs(hotel.tags) : [];

  // Generate personalized hotel highlights
  const getHotelHighlights = (hotel: HotelOption) => {
    const highlights = [];

    // Add tag-based highlights
    if (hotel.tags?.includes('recommended')) {
      highlights.push("Highly rated by guests");
    }
    if (hotel.tags?.includes('cheapest')) {
      highlights.push("Best value for money");
    }
    if (hotel.tags?.includes('best_location')) {
      highlights.push("Prime location in city center");
    }

    // Add additional contextual highlights
    if (hotel.boardType?.toLowerCase().includes('breakfast')) {
      highlights.push("Breakfast included");
    } else {
      highlights.push("Room only - flexible dining options");
    }

    // Add cancellation policy information
    if (hotel.policies?.cancellation) {
      highlights.push("Free cancellation available");
    } else {
      highlights.push("Non-refundable - great price locked in");
    }

    // Return max 3 highlights
    return highlights.slice(0, 3);
  };

  const price = parseFloat(hotel.totalAmount) || 0;
  const currency = hotel.currency || "USD";
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="w-full h-full rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm transition-shadow duration-200 hover:shadow-md overflow-hidden flex flex-col">
      {/* Content Area */}
      <div className="flex flex-col">
        {/* Top Row: Badges on left, Hotel Info on right */}
        <div className="mb-3 flex items-start justify-between gap-2">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 flex-1">
            {badgeConfigs.length > 0 && badgeConfigs.map((badgeConfig, index) => (
              <div
                key={index}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
                  badgeConfig.color,
                )}
              >
                <span className="text-sm">{badgeConfig.emoji}</span>
                <span className="truncate">{badgeConfig.text}</span>
              </div>
            ))}
          </div>

          {/* Hotel Chain - Top Right */}
          <div className="flex flex-col items-end text-right min-w-0 flex-shrink-0">
            {hotel.chainCode && (
              <span className="text-xs text-gray-500 truncate">
                {hotel.chainCode}
              </span>
            )}
          </div>
        </div>

        {/* Hotel Name and Location */}
        <div className="mb-3">
          <div className="font-bold text-gray-900 text-lg mb-1 truncate">
            {hotel.hotelName}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{hotel.cityCode}</span>
          </div>
        </div>

        {/* Room and Board Details */}
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{hotel.roomType}</span>
          </div>
          <div className="text-gray-600">
            {hotel.adults} {hotel.adults === 1 ? 'Guest' : 'Guests'}
          </div>
        </div>

        {/* Hotel Amenities */}
        <HotelAmenitiesDisplay hotel={hotel} />

        {/* Hotel Highlights with Moving Gradient Border */}
        {(() => {
          const highlights = getHotelHighlights(hotel);
          return highlights.length > 0 && (
            <div className="mb-4">
              <div
                className="relative rounded-lg animate-gradient-border"
                style={{
                  background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
                  backgroundSize: '400% 400%',
                  padding: '1px',
                }}
              >
                {/* Inner content with white background */}
                <div className="bg-white rounded-lg p-2">
                  <ul className="space-y-1">
                    {highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-800 font-medium"
                      >
                        <span className="mt-1 text-gray-600">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Add the CSS animation styles */}
              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                  .animate-gradient-border {
                    animation: gradientShift 15s ease infinite;
                  }
                `
              }} />
            </div>
          );
        })()}
      </div>

      {/* Minimal spacer for button alignment */}
      <div className="flex-grow min-h-[8px]"></div>

      {/* Select Button with Price - Pinned to bottom */}
      <Button
        onClick={() => onSelect(hotel.hotelOfferId)}
        disabled={isLoading}
        className="w-full bg-white border border-gray-300 py-3 text-gray-900 transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="font-normal">{isLoading ? "Selecting..." : "Select Hotel"}</span>
          <span className="font-bold">{currencySymbol}{price.toLocaleString()}</span>
        </span>
      </Button>
    </div>
  );
};

// Loading/Empty Hotel Card Component
const EmptyHotelCard = ({ isLoading = true }: { isLoading?: boolean }) => {
  return (
    <div className="w-full h-full rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm overflow-hidden flex flex-col">
      {isLoading ? (
        <>
          {/* Content Area - Flexible */}
          <div className="flex-grow flex flex-col">
            {/* Loading Badge */}
            <div className="mb-3">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Loading Hotel Name */}
            <div className="mb-3">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Loading Room Info */}
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Loading Amenities */}
            <div className="mb-3">
              <Skeleton className="h-8 w-full rounded" />
            </div>
          </div>

          {/* Loading Button - Pinned to bottom */}
          <Skeleton className="h-12 w-full rounded" />
        </>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 mb-1">Searching for hotels...</p>
          <p className="text-xs text-gray-400">This may take a few moments</p>
        </div>
      )}
    </div>
  );
};

// Responsive Carousel Component
const ResponsiveCarousel = ({
  hotels,
  onSelect,
  isLoading,
}: {
  hotels: HotelOption[];
  onSelect: (hotelOfferId: string) => void;
  isLoading: boolean;
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get cards per view based on screen size
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 3;
    const width = window.innerWidth;
    if (width >= 1200) return 3;
    if (width >= 1024) return 2.8;
    if (width >= 768) return 2;
    if (width >= 640) return 1.8;
    if (width >= 480) return 1.3;
    if (width >= 360) return 1.1;
    return 1;
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateScrollButtons = () => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [hotels, cardsPerView]);

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;

    const cardWidth = carouselRef.current.clientWidth / cardsPerView;
    const scrollPosition = index * cardWidth;

    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    setCurrentIndex(index);
  };

  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const maxIndex = Math.max(0, hotels.length - Math.floor(cardsPerView));
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    scrollToIndex(newIndex);
  };

  const shouldShowNavigation = hotels.length > Math.floor(cardsPerView);

  // If no hotels, show empty state
  if (hotels.length === 0) {
    return (
      <div className="relative w-full overflow-hidden">
        <div
          className="flex overflow-x-auto scrollbar-hide gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
          style={{
            scrollSnapType: 'x mandatory',
          }}
        >
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] sm:w-auto"
              style={{
                scrollSnapAlign: 'start',
              }}
            >
              <EmptyHotelCard isLoading={false} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Navigation Buttons */}
      {shouldShowNavigation && cardsPerView >= 2 && (
        <>
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-lg transition-all duration-200 hidden sm:block",
              canScrollLeft
                ? "text-gray-700 hover:bg-gray-50 hover:shadow-xl"
                : "cursor-not-allowed text-gray-300"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-lg transition-all duration-200 hidden sm:block",
              canScrollRight
                ? "text-gray-700 hover:bg-gray-50 hover:shadow-xl"
                : "cursor-not-allowed text-gray-300"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          gap: cardsPerView >= 2 ? '16px' : '12px',
          paddingLeft: shouldShowNavigation && cardsPerView >= 2 ? '40px' : '0px',
          paddingRight: shouldShowNavigation && cardsPerView >= 2 ? '40px' : '0px',
        }}
        onScroll={updateScrollButtons}
      >
        {hotels.map((hotel, index) => {
          const gapSize = cardsPerView >= 2 ? 16 : 12;
          const totalGaps = (cardsPerView - 1) * gapSize;
          const availableWidth = 100;
          const cardWidth = (availableWidth / cardsPerView) - (totalGaps / cardsPerView);

          return (
            <div
              key={hotel.hotelOfferId || `hotel-${index}`}
              className="flex-shrink-0"
              style={{
                width: `${Math.max(cardWidth, 20)}%`,
                scrollSnapAlign: 'start',
                minWidth: '280px',
                maxWidth: cardsPerView === 1 ? '100%' : `${cardWidth}%`,
                minHeight: '420px',
              }}
            >
              <HotelCard
                hotel={hotel}
                onSelect={onSelect}
                isLoading={isLoading}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Direct Hotel Display Component
const DirectHotelDisplay = ({
  hotels,
  onSelect,
  isLoading,
}: {
  hotels: HotelOption[];
  onSelect: (hotelOfferId: string) => void;
  isLoading: boolean;
}) => {
  // Helper function to get hotels sorted by different criteria
  const getSortedHotels = (hotels: HotelOption[], sortBy: 'price' | 'ranking' | 'location') => {
    const hotelsCopy = [...hotels];

    switch (sortBy) {
      case 'price':
        return hotelsCopy.sort((a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount));
      case 'ranking':
        return hotelsCopy.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));
      case 'location':
        return hotelsCopy.sort((a, b) => {
          // Sort by location tags or chain code
          const aHasLocation = a.tags?.includes('best_location') ? 1 : 0;
          const bHasLocation = b.tags?.includes('best_location') ? 1 : 0;
          return bHasLocation - aHasLocation;
        });
      default:
        return hotelsCopy;
    }
  };

  // Get the three distinct hotels to display
  const getThreeDistinctHotels = () => {
    if (hotels.length === 0) return [];

    const selectedHotels: HotelOption[] = [];
    const usedHotelIds = new Set<string>();

    // 1. First priority: Best hotel (highest ranking or recommended)
    const recommendedHotel = hotels.find(hotel => hotel.tags?.includes('recommended'));
    const bestHotel = recommendedHotel || getSortedHotels(hotels, 'ranking')[0];

    if (bestHotel) {
      const hotelWithBestTag = {
        ...bestHotel,
        tags: [...(bestHotel.tags || []), 'recommended'].filter((tag, index, arr) => arr.indexOf(tag) === index)
      };
      selectedHotels.push(hotelWithBestTag);
      usedHotelIds.add(bestHotel.hotelOfferId);
    }

    // 2. Second priority: Cheapest hotel (not already selected)
    const cheapestHotels = getSortedHotels(hotels, 'price');
    const cheapestHotel = cheapestHotels.find(hotel => !usedHotelIds.has(hotel.hotelOfferId));

    if (cheapestHotel) {
      const hotelWithCheapestTag = {
        ...cheapestHotel,
        tags: [...(cheapestHotel.tags || []), 'cheapest'].filter((tag, index, arr) => arr.indexOf(tag) === index)
      };
      selectedHotels.push(hotelWithCheapestTag);
      usedHotelIds.add(cheapestHotel.hotelOfferId);
    }

    // 3. Third priority: Best location hotel (not already selected)
    const locationHotels = getSortedHotels(hotels, 'location');
    const locationHotel = locationHotels.find(hotel => !usedHotelIds.has(hotel.hotelOfferId));

    if (locationHotel) {
      const hotelWithLocationTag = {
        ...locationHotel,
        tags: [...(locationHotel.tags || []), 'best_location'].filter((tag, index, arr) => arr.indexOf(tag) === index)
      };
      selectedHotels.push(hotelWithLocationTag);
      usedHotelIds.add(locationHotel.hotelOfferId);
    }

    // If we still don't have 3 hotels, add more from the remaining hotels
    if (selectedHotels.length < 3) {
      const remainingHotels = hotels.filter(hotel => !usedHotelIds.has(hotel.hotelOfferId));
      const additionalHotels = remainingHotels.slice(0, 3 - selectedHotels.length);
      selectedHotels.push(...additionalHotels);
    }

    return selectedHotels;
  };

  const hotelsToShow = getThreeDistinctHotels();

  return (
    <ResponsiveCarousel
      hotels={hotelsToShow}
      onSelect={onSelect}
      isLoading={isLoading}
    />
  );
};

// Hotel List Item Component for Bottom Sheet
const HotelListItem = ({
  hotel,
  onSelect,
  isLoading,
}: {
  hotel: HotelOption;
  onSelect: (hotelOfferId: string) => void;
  isLoading?: boolean;
}) => {
  const price = parseFloat(hotel.totalAmount) || 0;
  const currency = hotel.currency || "USD";
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div
      className="border-b border-gray-200 bg-white py-3 px-3 sm:px-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
      onClick={() => onSelect(hotel.hotelOfferId)}
    >
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between">
          {/* Left: Hotel Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {hotel.hotelName}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{hotel.cityCode}</span>
            </div>
            <div className="text-sm text-gray-500">
              {hotel.roomType} • {hotel.boardType}
            </div>
          </div>

          {/* Right: Price */}
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-base font-bold text-gray-900">
              {currencySymbol}{price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">per night</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Left: Hotel Info */}
        <div className="flex flex-col min-w-0" style={{ width: '300px' }}>
          <div className="font-medium text-gray-900 truncate">
            {hotel.hotelName}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{hotel.cityCode}</span>
          </div>
        </div>

        {/* Center: Room Details */}
        <div className="text-center" style={{ width: '200px' }}>
          <div className="text-sm font-medium text-gray-700">
            {hotel.roomType}
          </div>
          <div className="text-xs text-gray-500">
            {hotel.boardType}
          </div>
        </div>

        {/* Center-Right: Guests */}
        <div className="text-center" style={{ width: '100px' }}>
          <div className="text-sm font-medium text-gray-700">
            {hotel.adults} {hotel.adults === 1 ? 'Guest' : 'Guests'}
          </div>
        </div>

        {/* Right: Price */}
        <div className="text-right" style={{ width: '120px' }}>
          <div className="text-lg font-bold text-gray-900">
            {currencySymbol}{price.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">per night</div>
          {hotel.policies?.cancellation && (
            <div className="text-xs text-green-600">Free Cancellation</div>
          )}
        </div>
      </div>
    </div>
  );
};

const HotelResultsWidget = (args: Record<string, any>) => {
  console.log("HotelResultsWidget args:", args);
  console.log("hotelOffers:", args.hotelOffers);

  const thread = useStreamContext();
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllHotels, setShowAllHotels] = useState(false);
  const [bottomSheetFilter, setBottomSheetFilter] = useState<'cheapest' | 'recommended' | 'best_location'>('cheapest');

  const allHotelTuples = args.hotelOffers || [];

  const handleSelectHotel = async (hotelOfferId: string) => {
    setSelectedHotel(hotelOfferId);
    setIsLoading(true);

    const responseData = {
      selectedHotelId: hotelOfferId,
    };

    try {
      console.log("responseData:", responseData);
      await submitInterruptResponse(thread, "response", responseData);
    } catch (error) {
      // Optional: already handled inside the utility
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAllHotels = () => {
    setShowAllHotels(true);
  };

  // Sort hotels based on the selected filter
  const getSortedHotels = (hotels: HotelOption[], sortBy: 'cheapest' | 'recommended' | 'best_location') => {
    const hotelsCopy = [...hotels] ;

    switch (sortBy) {
      case 'cheapest':
        return hotelsCopy.sort((a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount));
      case 'recommended':
        return hotelsCopy.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));
      case 'best_location':
        return hotelsCopy.sort((a, b) => {
          const aHasLocation = a.tags?.includes('best_location') ? 1 : 0;
          const bHasLocation = b.tags?.includes('best_location') ? 1 : 0;
          return bHasLocation - aHasLocation;
        });
      default:
        return hotelsCopy;
    }
  };

  const sortedHotels = getSortedHotels(allHotelTuples, bottomSheetFilter);

  return (
    <>
      <div
        className="mx-auto mt-4 w-full max-w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:mt-8 sm:p-6 overflow-hidden hotel-carousel-container"
        style={{
          fontFamily: "Uber Move, Arial, Helvetica, sans-serif",
          maxWidth: "min(100vw - 2rem, 1536px)"
        }}
      >
        <div className="mb-4 sm:mb-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
            Available Hotels
          </h2>
          <p className="text-sm text-gray-600">Choose from the best options</p>
        </div>

        {/* Direct Hotel Display - Only 3 Tagged Hotels */}
        <div className="mb-6 overflow-hidden">
          {allHotelTuples.length > 0 ? (
            <DirectHotelDisplay
              hotels={allHotelTuples}
              onSelect={handleSelectHotel}
              isLoading={isLoading}
            />
          ) : (
            // Show loading state when no hotels are available
            <div className="relative w-full overflow-hidden">
              <div
                className="flex overflow-x-auto scrollbar-hide gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
                style={{
                  scrollSnapType: 'x mandatory',
                }}
              >
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[280px] sm:w-auto"
                    style={{
                      scrollSnapAlign: 'start',
                    }}
                  >
                    <EmptyHotelCard isLoading={false} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Show All Hotels Button */}
        {allHotelTuples.length > 6 && (
          <div className="text-center">
            <Button
              onClick={handleShowAllHotels}
              variant="outline"
              className="border-gray-300 px-8 py-2 text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-100"
            >
              Show all hotels ({allHotelTuples.length} total)
            </Button>
          </div>
        )}

        {/* Selection Feedback */}
        {selectedHotel && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-800">
              Hotel{" "}
              {allHotelTuples.find((h: any) => h.hotelOfferId === selectedHotel)
                ?.hotelName || "Unknown"}{" "}
              selected!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Sheet Modal for All Hotels */}
      <Sheet open={showAllHotels} onOpenChange={setShowAllHotels}>
        <SheetContent
          side="bottom"
          className="h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden"
        >
          <SheetHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
            <SheetTitle className="text-xl font-semibold">
              All Available Hotels ({allHotelTuples.length} hotels)
            </SheetTitle>
          </SheetHeader>

          {/* Filter Tabs */}
          <div className="flex-shrink-0 border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'cheapest' as const, label: 'Cheapest', icon: DollarSign },
                { id: 'recommended' as const, label: 'Recommended', icon: Star },
                { id: 'best_location' as const, label: 'Best Location', icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = bottomSheetFilter === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setBottomSheetFilter(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200",
                      isActive
                        ? "text-blue-600 border-blue-600 bg-blue-50"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hotel List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {sortedHotels.map((hotel: any, index: number) => (
                <HotelListItem
                  key={hotel.hotelOfferId || `hotel-${index}`}
                  hotel={hotel}
                  onSelect={handleSelectHotel}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default HotelResultsWidget; 