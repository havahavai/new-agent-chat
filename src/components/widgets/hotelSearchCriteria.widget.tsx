"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/ui/button";
import { Plus, Minus, CalendarIcon, MapPin, Users, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { submitInterruptResponse } from "./util";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/common/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/common/ui/input";

// DateInput component using shadcn Calendar
interface DateInputProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

const DateInput = ({
  date,
  onDateChange,
  placeholder,
  className,
}: DateInputProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return placeholder || "Select date";
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal focus:border-black focus:ring-black",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateDisplay(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate: Date | undefined) => {
            onDateChange?.(selectedDate);
            setIsOpen(false);
          }}
          disabled={(date: Date) => date < today}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const HotelSearchCriteriaWidget = (args: Record<string, any>) => {
  const thread = useStreamContext();

  // Extract data from args
  const hotelSearchCriteria = args.hotelSearchCriteria || {};

  // Initialize state from args
  const [location, setLocation] = useState(hotelSearchCriteria.cityCode || '');
  const [adults, setAdults] = useState(hotelSearchCriteria.adults || 1);
  const [children, setChildren] = useState(hotelSearchCriteria.children || 0);
  const [rooms, setRooms] = useState(hotelSearchCriteria.roomQuantity || 1);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(
    hotelSearchCriteria.checkInDateStr ? new Date(hotelSearchCriteria.checkInDateStr) : undefined
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
    hotelSearchCriteria.checkOutDateStr ? new Date(hotelSearchCriteria.checkOutDateStr) : undefined
  );
  const [priceRange, setPriceRange] = useState(hotelSearchCriteria.priceRange || '');
  const [currency, setCurrency] = useState(hotelSearchCriteria.currency || 'USD');
  const [boardType, setBoardType] = useState(hotelSearchCriteria.boardType || 'ROOM_ONLY');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckInDateChange = (date: Date | undefined) => {
    setCheckInDate(date);
    // If check-out date is before new check-in date, reset it
    if (date && checkOutDate && date >= checkOutDate) {
      setCheckOutDate(undefined);
    }
  };

  const handleCheckOutDateChange = (date: Date | undefined) => {
    setCheckOutDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!location.trim()) {
        alert('Please enter a destination');
        return;
      }
      if (!checkInDate) {
        alert('Please select check-in date');
        return;
      }
      if (!checkOutDate) {
        alert('Please select check-out date');
        return;
      }
      if (checkOutDate <= checkInDate) {
        alert('Check-out date must be after check-in date');
        return;
      }

      // Calculate number of nights
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const updatedHotelSearchCriteria = {
        cityCode: location.trim(),
        adults: adults,
        children: children,
        roomQuantity: rooms,
        checkInDateStr: checkInDate.toISOString().split('T')[0],
        checkOutDateStr: checkOutDate.toISOString().split('T')[0],
        priceRange: priceRange || undefined,
        currency: currency,
        boardType: boardType,
        distance: {
          radius: 5,
          radiusUnit: 'KM',
        },
        includeClosed: false,
        bestRateOnly: true,
        lang: 'EN',
      };

      console.log('Submitting hotel search criteria:', updatedHotelSearchCriteria);

      await submitInterruptResponse(thread, "response", {
        hotelSearchCriteria: updatedHotelSearchCriteria,
      });

    } catch (error) {
      console.error('Error submitting hotel search criteria:', error);
      alert('Failed to submit search criteria. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalGuests = () => adults + children;

  const formatGuestText = () => {
    const total = getTotalGuests();
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    return `${parts.join(', ')}, ${rooms} room${rooms > 1 ? 's' : ''}`;
  };

  const boardTypeOptions = [
    { value: 'ROOM_ONLY', label: 'Room Only' },
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'HALF_BOARD', label: 'Half Board' },
    { value: 'FULL_BOARD', label: 'Full Board' },
    { value: 'ALL_INCLUSIVE', label: 'All Inclusive' },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'INR', label: 'INR' },
  ];

  return (
    <>
      <div
        className="mx-auto mt-2 w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg rounded-2xl border border-gray-200 bg-white p-3 font-sans shadow-lg sm:mt-10 sm:p-6"
        style={{
          fontFamily: "Uber Move, Arial, Helvetica, sans-serif"
        }}
      >
        <form
          className="w-full space-y-4 sm:space-y-4"
          onSubmit={handleSubmit}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Hotels</h2>
            <p className="text-gray-600 mt-1">Find your perfect stay</p>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where to?
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search for hotel"
                className="pl-10 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Check-in and Check-out Dates */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <DateInput
                date={checkInDate}
                onDateChange={handleCheckInDateChange}
                placeholder="Select check-in date"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <DateInput
                date={checkOutDate}
                onDateChange={handleCheckOutDateChange}
                placeholder="Select check-out date"
              />
            </div>
          </div>

          {/* Nights indicator */}
          {checkInDate && checkOutDate && (
            <div className="text-center">
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} NIGHT{(Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))) > 1 ? 'S' : ''}
              </span>
            </div>
          )}

          {/* Rooms & Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rooms & guests
            </label>
            <Popover open={showGuestDropdown} onOpenChange={setShowGuestDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={showGuestDropdown}
                  className="w-full justify-between focus:ring-black focus:border-black"
                >
                  <span>{formatGuestText()}</span>
                  <span className="ml-2 text-gray-400">▼</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] sm:w-[380px] md:w-[420px] p-0">
                <div className="p-4 space-y-6">
                  {/* Select guests */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select guests</h3>

                    {/* Adults */}
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">Adult</div>
                        <div className="text-sm text-gray-500">12+ Years</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          disabled={adults <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{adults}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => setAdults(adults + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">Children</div>
                        <div className="text-sm text-gray-500">2 - 12 yrs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          disabled={children <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{children}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => setChildren(children + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">Rooms</div>
                        <div className="text-sm text-gray-500">Number of rooms</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          disabled={rooms <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{rooms}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => setRooms(rooms + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Board Type */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Board Type</h3>
                    <div className="space-y-3">
                      {boardTypeOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="boardType"
                            value={option.value}
                            checked={boardType === option.value}
                            onChange={(e) => setBoardType(e.target.value)}
                            className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                          />
                          <span className="font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Currency</h3>
                    <div className="space-y-3">
                      {currencyOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="currency"
                            value={option.value}
                            checked={currency === option.value}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                          />
                          <span className="font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Price Range (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range (Optional)
            </label>
            <Input
              type="text"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              placeholder="e.g., 100-300 or -300 or 200"
              className="focus:ring-black focus:border-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: min-max, -max, or exact amount
            </p>
          </div>

          {/* Search Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg text-base"
            >
              {isLoading ? "Searching..." : "Search hotels"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default HotelSearchCriteriaWidget; 