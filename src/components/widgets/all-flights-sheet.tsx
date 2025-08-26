"use client";

import type React from "react";
import { useState } from "react";
import { FlightCard } from "./flight-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Filter, ArrowUpDown, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FlightData {
  flightOfferId: string;
  totalEmission?: number;
  totalEmissionUnit?: string;
  currency: string;
  totalAmount: number;
  tax?: number;
  baseAmount?: number;
  serviceFee?: number;
  convenienceFee?: number;
  journey: Array<{
    id: string;
    duration: string;
    departure: {
      date: string;
      airportIata: string;
      airportName: string;
      cityCode?: string;
      countryCode?: string;
    };
    arrival: {
      date: string;
      airportIata: string;
      airportName: string;
      cityCode?: string;
      countryCode?: string;
    };
    segments: Array<{
      id: string;
      airlineIata: string;
      flightNumber: string;
      aircraftType?: string;
      airlineName: string;
      duration: string;
      departure: {
        date: string;
        airportIata: string;
        airportName: string;
        cityCode?: string;
        countryCode?: string;
      };
      arrival: {
        date: string;
        airportIata: string;
        airportName: string;
        cityCode?: string;
        countryCode?: string;
      };
    }>;
  }>;
  offerRules?: {
    isRefundable: boolean;
  };
  baggage?: {
    check_in_baggage?: {
      weight: number;
      weightUnit: string;
    };
    cabin_baggage?: {
      weight: number;
      weightUnit: string;
    };
  };
  rankingScore?: number;
  pros?: string[];
  cons?: string[];
  tags?: string[];
}

interface AllFlightsSheetProps {
  children: React.ReactNode;
  flightData?: FlightData[];
  onFlightSelect?: (flightOfferId: string) => void;
}

export function AllFlightsSheet({
  children,
  flightData = [],
  onFlightSelect,
}: AllFlightsSheetProps) {
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"cheapest" | "fastest">("cheapest");
  const [bestOnly, setBestOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([1800, 3300]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [maxStops, setMaxStops] = useState(2);
  const [selectedDepartureTime, setSelectedDepartureTime] = useState<string[]>(
    [],
  );
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectFlight = (flightOfferId: string) => {
    // Call the parent's flight selection handler
    if (onFlightSelect) {
      onFlightSelect(flightOfferId);
    }
    // Close the sheet after selection
    setOpen(false);
  };

  // Helper functions to transform new data structure to legacy format for FlightCard
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDuration = (duration: string) => {
    // Convert PT1H45M to 1h 45m
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = match[1] ? `${match[1]}h` : "";
      const minutes = match[2] ? `${match[2]}m` : "";
      return `${hours} ${minutes}`.trim();
    }
    return duration;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      INR: "₹",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currency] || currency;
  };

  const transformFlightData = (flight: FlightData) => {
    if (!flight.journey || flight.journey.length === 0) return null;

    const firstJourney = flight.journey[0];
    const firstSegment = firstJourney.segments[0];
    const stops = firstJourney.segments.length - 1;

    // Determine flight type based on tags or price
    let type: "best" | "cheapest" | "fastest" = "best";
    if (flight.tags?.includes("cheapest")) type = "cheapest";
    else if (flight.tags?.includes("fastest")) type = "fastest";

    // Create layovers array
    const layovers = firstJourney.segments.slice(0, -1).map((segment) => ({
      city: segment.arrival.airportName.split(" ")[0], // Get city name
      duration: "", // We don't have layover duration in this structure
      iataCode: segment.arrival.airportIata,
    }));

    return {
      flightOfferId: flight.flightOfferId,
      type,
      price: `${getCurrencySymbol(flight.currency)}${flight.totalAmount.toLocaleString()}`,
      duration: formatDuration(firstJourney.duration),
      stops,
      airline: firstSegment.airlineName,
      airlineCode: firstSegment.airlineIata,
      departureTime: formatTime(firstJourney.departure.date),
      arrivalTime: formatTime(firstJourney.arrival.date),
      nextDay: false, // Calculate if needed
      layovers,
      // Pass through new data structure for FlightCard
      totalAmount: flight.totalAmount,
      currency: flight.currency,
      journey: flight.journey,
      offerRules: flight.offerRules,
      tags: flight.tags,
      pros: flight.pros,
      cons: flight.cons,
    };
  };

  // Transform flight data or use mock data as fallback
  const allFlights = flightData.map(transformFlightData);

  const airlines = Array.from(
    new Set(allFlights.map((flight) => flight?.airline)),
  );
  const departureTimeSlots = [
    { label: "Early Morning (00:00 - 06:00)", value: "early" },
    { label: "Morning (06:00 - 12:00)", value: "morning" },
    { label: "Afternoon (12:00 - 18:00)", value: "afternoon" },
    { label: "Evening (18:00 - 24:00)", value: "evening" },
  ];

  const filteredFlights = allFlights.filter((flight) => {
    if (!flight) return false;
    if (bestOnly) {
      const tags = (flight as any).tags as string[] | undefined;
      const hasBestTag =
        Array.isArray(tags) &&
        tags.some((t) => t?.toLowerCase() === "recommended");
      if (!hasBestTag) return false;
    }
    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (!a || !b) return 0; // if either is null, treat them as equal

    if (sortBy === "cheapest") {
      const priceA = Number.parseFloat(
        a.price.replace("$", "").replace(",", ""),
      );
      const priceB = Number.parseFloat(
        b.price.replace("$", "").replace(",", ""),
      );
      return priceA - priceB;
    } else {
      const durationA =
        Number.parseInt(a.duration.split("h")[0]) * 60 +
        Number.parseInt(a.duration.split("h")[1].split("m")[0]);
      const durationB =
        Number.parseInt(b.duration.split("h")[0]) * 60 +
        Number.parseInt(b.duration.split("h")[1].split("m")[0]);
      return durationA - durationB;
    }
  });

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline)
        ? prev.filter((a) => a !== airline)
        : [...prev, airline],
    );
  };

  const toggleDepartureTime = (timeSlot: string) => {
    setSelectedDepartureTime((prev) =>
      prev.includes(timeSlot)
        ? prev.filter((t) => t !== timeSlot)
        : [...prev, timeSlot],
    );
  };

  const clearAllFilters = () => {
    setPriceRange([1800, 3300]);
    setSelectedAirlines([]);
    setMaxStops(2);
    setSelectedDepartureTime([]);
    setBestOnly(false);
  };

  const activeFiltersCount =
    (selectedAirlines.length > 0 ? 1 : 0) +
    (maxStops < 2 ? 1 : 0) +
    (selectedDepartureTime.length > 0 ? 1 : 0) +
    (priceRange[0] > 1800 || priceRange[1] < 3300 ? 1 : 0) +
    (bestOnly ? 1 : 0);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex h-[80vh] flex-col"
        style={{
          fontFamily: "Uber Move, Arial, Helvetica, sans-serif",
        }}
      >
        <div className="bg-background flex-shrink-0 border-b">
          <SheetHeader className="mb-2">
            <SheetTitle>Flights</SheetTitle>
          </SheetHeader>

          <div className="mb-3 px-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      Sort: {sortBy === "cheapest" ? "Cheapest" : "Fastest"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setSortBy("cheapest")}>
                      Cheapest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("fastest")}>
                      Fastest First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant={bestOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBestOnly((v) => !v)}
                  className="flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Best only
                </Button>
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="bg-muted/50 space-y-6 rounded-lg p-4">
                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={3300}
                    min={1800}
                    step={50}
                    className="w-full"
                  />
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Airlines
                  </Label>
                  <div className="space-y-2">
                    {airlines.map((airline) => (
                      <div
                        key={airline}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={airline}
                          checked={selectedAirlines.includes(airline as string)}
                          onCheckedChange={() =>
                            toggleAirline(airline as string)
                          }
                        />
                        <Label
                          htmlFor={airline}
                          className="text-sm"
                        >
                          {airline}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Max Stops:{" "}
                    {maxStops === 0
                      ? "Non-stop"
                      : `${maxStops} stop${maxStops > 1 ? "s" : ""}`}
                  </Label>
                  <Slider
                    value={[maxStops]}
                    onValueChange={(value) => setMaxStops(value[0])}
                    max={2}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Departure Time
                  </Label>
                  <div className="space-y-2">
                    {departureTimeSlots.map((slot) => (
                      <div
                        key={slot.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={slot.value}
                          checked={selectedDepartureTime.includes(slot.value)}
                          onCheckedChange={() =>
                            toggleDepartureTime(slot.value)
                          }
                        />
                        <Label
                          htmlFor={slot.value}
                          className="text-sm"
                        >
                          {slot.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-2 pb-4">
            {sortedFlights.map((flight, index) => (
              <div
                key={index}
                className="rounded-lg border bg-white shadow-sm"
              >
                <div className="px-2 py-1">
                  <FlightCard
                    {...flight}
                    compact
                    onSelect={handleSelectFlight}
                    isLoading={isLoading}
                    selectedFlightId={selectedFlight}
                  />
                </div>
              </div>
            ))}
            {filteredFlights.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                No flights match your current filters. Try adjusting your
                criteria.
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
