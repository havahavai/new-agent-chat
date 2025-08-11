'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FlightData {
  flight_id: string;
  flightNumber: string;
  airline_iata: string;
  duration: string;
  departure: {
    time: string;
    date: string;
    city: string;
    airport: string;
    country: string;
    code: string;
  };
  arrival: {
    time: string;
    date: string;
    city: string;
    airport: string;
    country: string;
    code: string;
  };
  departure_terminal?: string;
  arrival_terminal?: string;
  boarding_gate?: string;
  boarding_time?: string;
  flight_state: string;
  baggage_id?: string;
}

interface TicketDocument {
  name: string;
  url: string;
}

interface FlightTicket {
  ticket_id: string;
  belongs_to: string;
  pnr: string;
  departure: {
    time: string;
    date: string;
    city: string;
    airport: string;
    country: string;
    code: string;
  };
  arrival: {
    time: string;
    date: string;
    city: string;
    airport: string;
    country: string;
    code: string;
  };
  duration: string;
  flights_data: FlightData[];
  ticket_documents: TicketDocument[];
}

interface FlightStatusData {
  flights: FlightTicket[];
}

// Mock flight status data using the new format
const mockFlightStatus: FlightStatusData = {
  flights: [
    {
      ticket_id: "UP001",
      belongs_to: "user123",
      pnr: "XYZ789",
      departure: {
        time: "06:15",
        date: "2024-03-20",
        city: "Bangalore",
        airport: "Kempegowda International Airport",
        country: "India",
        code: "BLR"
      },
      arrival: {
        time: "08:45",
        date: "2024-03-20",
        city: "Chennai",
        airport: "Chennai International Airport",
        country: "India",
        code: "MAA"
      },
      duration: "2h 30m",
      flights_data: [
        {
          flight_id: "UP_FL001",
          flightNumber: "6E2341",
          airline_iata: "6E",
          duration: "2h 30m",
          departure: {
            time: "06:15",
            date: "2024-03-20",
            city: "Bangalore",
            airport: "Kempegowda International Airport",
            country: "India",
            code: "BLR"
          },
          arrival: {
            time: "08:45",
            date: "2024-03-20",
            city: "Chennai",
            airport: "Chennai International Airport",
            country: "India",
            code: "MAA"
          },
          departure_terminal: "1",
          arrival_terminal: "1",
          boarding_gate: "B7",
          boarding_time: "05:15",
          flight_state: "On Time",
          baggage_id: "BG123"
        }
      ],
      ticket_documents: [
        {
          name: "E-Ticket_6E2341.pdf",
          url: "https://example.com/tickets/eticket_6e2341.pdf"
        },
        {
          name: "Boarding_Pass_6E2341.pdf",
          url: "https://example.com/tickets/boarding_pass_6e2341.pdf"
        }
      ]
    }
  ]
};

const getStatusColor = (flightState: string) => {
  const state = flightState.toLowerCase();
  if (state.includes('early')) {
    return 'text-green-600';
  } else if (state.includes('on time') || state.includes('ontime')) {
    return 'text-green-600';
  } else if (state.includes('delay') || state.includes('late')) {
    return 'text-red-600';
  } else {
    return 'text-black';
  }
};

const getTimeColor = (flightState: string) => {
  const state = flightState.toLowerCase();
  if (state.includes('early')) {
    return 'text-green-600';
  } else if (state.includes('on time') || state.includes('ontime')) {
    return 'text-black';
  } else if (state.includes('delay') || state.includes('late')) {
    return 'text-red-600';
  } else {
    return 'text-black';
  }
};

// Helper function to get country code from country name
const getCountryCode = (countryName: string): string => {
  const countryMap: { [key: string]: string } = {
    'India': 'IN',
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Japan': 'JP',
    'China': 'CN',
    'Singapore': 'SG',
    'Thailand': 'TH',
    'Malaysia': 'MY',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'South Korea': 'KR',
    'UAE': 'AE',
    'Qatar': 'QA',
    'Saudi Arabia': 'SA',
    'Turkey': 'TR',
    'Netherlands': 'NL',
    'Switzerland': 'CH',
    'Italy': 'IT',
    'Spain': 'ES',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Russia': 'RU',
    'South Africa': 'ZA',
    'Egypt': 'EG',
    'Israel': 'IL',
    'New Zealand': 'NZ',
    'Norway': 'NO',
    'Sweden': 'SE',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Belgium': 'BE',
    'Austria': 'AT',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Greece': 'GR',
    'Portugal': 'PT',
    'Ireland': 'IE',
    'Iceland': 'IS',
    'Luxembourg': 'LU',
    'Croatia': 'HR',
    'Slovenia': 'SI',
    'Slovakia': 'SK',
    'Estonia': 'EE',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Malta': 'MT',
    'Cyprus': 'CY',
    'Bulgaria': 'BG',
    'Romania': 'RO'
  };

  return countryMap[countryName] || countryName.substring(0, 2).toUpperCase();
};

// Helper function to get airline logo path
const getAirlineLogoPath = (airlineIata: string): string => {
  if (!airlineIata) return '';
  return `/airlines/${airlineIata.toUpperCase()}.png`;
};

// Helper function to convert country code to flag emoji
const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '';

  // Direct mapping of country codes to flag emojis for better browser compatibility
  const flagMap: { [key: string]: string } = {
    'AD': '🇦🇩', 'AE': '🇦🇪', 'AF': '🇦🇫', 'AG': '🇦🇬', 'AI': '🇦🇮', 'AL': '🇦🇱', 'AM': '🇦🇲',
    'AO': '🇦🇴', 'AQ': '🇦🇶', 'AR': '🇦🇷', 'AS': '🇦🇸', 'AT': '🇦🇹', 'AU': '🇦🇺', 'AW': '🇦🇼',
    'AX': '🇦🇽', 'AZ': '🇦🇿', 'BA': '🇧🇦', 'BB': '🇧🇧', 'BD': '🇧🇩', 'BE': '🇧🇪', 'BF': '🇧🇫',
    'BG': '🇧🇬', 'BH': '🇧🇭', 'BI': '🇧🇮', 'BJ': '🇧🇯', 'BL': '🇧🇱', 'BM': '🇧🇲', 'BN': '🇧🇳',
    'BO': '🇧🇴', 'BQ': '🇧🇶', 'BR': '🇧🇷', 'BS': '🇧🇸', 'BT': '🇧🇹', 'BV': '🇧🇻', 'BW': '🇧🇼',
    'BY': '🇧🇾', 'BZ': '🇧🇿', 'CA': '🇨🇦', 'CC': '🇨🇨', 'CD': '🇨🇩', 'CF': '🇨🇫', 'CG': '🇨🇬',
    'CH': '🇨🇭', 'CI': '🇨🇮', 'CK': '🇨🇰', 'CL': '🇨🇱', 'CM': '🇨🇲', 'CN': '🇨🇳', 'CO': '🇨🇴',
    'CR': '🇨🇷', 'CU': '🇨🇺', 'CV': '🇨🇻', 'CW': '🇨🇼', 'CX': '🇨🇽', 'CY': '🇨🇾', 'CZ': '🇨🇿',
    'DE': '🇩🇪', 'DJ': '🇩🇯', 'DK': '🇩🇰', 'DM': '🇩🇲', 'DO': '🇩🇴', 'DZ': '🇩🇿', 'EC': '🇪🇨',
    'EE': '🇪🇪', 'EG': '🇪🇬', 'EH': '🇪🇭', 'ER': '🇪🇷', 'ES': '🇪🇸', 'ET': '🇪🇹', 'FI': '🇫🇮',
    'FJ': '🇫🇯', 'FK': '🇫🇰', 'FM': '🇫🇲', 'FO': '🇫🇴', 'FR': '🇫🇷', 'GA': '🇬🇦', 'GB': '🇬🇧',
    'GD': '🇬🇩', 'GE': '🇬🇪', 'GF': '🇬🇫', 'GG': '🇬🇬', 'GH': '🇬🇭', 'GI': '🇬🇮', 'GL': '🇬🇱',
    'GM': '🇬🇲', 'GN': '🇬🇳', 'GP': '🇬🇵', 'GQ': '🇬🇶', 'GR': '🇬🇷', 'GS': '🇬🇸', 'GT': '🇬🇹',
    'GU': '🇬🇺', 'GW': '🇬🇼', 'GY': '🇬🇾', 'HK': '🇭🇰', 'HM': '🇭🇲', 'HN': '🇭🇳', 'HR': '🇭🇷',
    'HT': '🇭🇹', 'HU': '🇭🇺', 'ID': '🇮🇩', 'IE': '🇮🇪', 'IL': '🇮🇱', 'IM': '🇮🇲', 'IN': '🇮🇳',
    'IO': '🇮🇴', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'IS': '🇮🇸', 'IT': '🇮🇹', 'JE': '🇯🇪', 'JM': '🇯🇲',
    'JO': '🇯🇴', 'JP': '🇯🇵', 'KE': '🇰🇪', 'KG': '🇰🇬', 'KH': '🇰🇭', 'KI': '🇰🇮', 'KM': '🇰🇲',
    'KN': '🇰🇳', 'KP': '🇰🇵', 'KR': '🇰🇷', 'KW': '🇰🇼', 'KY': '🇰🇾', 'KZ': '🇰🇿', 'LA': '🇱🇦',
    'LB': '🇱🇧', 'LC': '🇱🇨', 'LI': '🇱🇮', 'LK': '🇱🇰', 'LR': '🇱🇷', 'LS': '🇱🇸', 'LT': '🇱🇹',
    'LU': '🇱🇺', 'LV': '🇱🇻', 'LY': '🇱🇾', 'MA': '🇲🇦', 'MC': '🇲🇨', 'MD': '🇲🇩', 'ME': '🇲🇪',
    'MF': '🇲🇫', 'MG': '🇲🇬', 'MH': '🇲🇭', 'MK': '🇲🇰', 'ML': '🇲🇱', 'MM': '🇲🇲', 'MN': '🇲🇳',
    'MO': '🇲🇴', 'MP': '🇲🇵', 'MQ': '🇲🇶', 'MR': '🇲🇷', 'MS': '🇲🇸', 'MT': '🇲🇹', 'MU': '🇲🇺',
    'MV': '🇲🇻', 'MW': '🇲🇼', 'MX': '🇲🇽', 'MY': '🇲🇾', 'MZ': '🇲🇿', 'NA': '🇳🇦', 'NC': '🇳🇨',
    'NE': '🇳🇪', 'NF': '🇳🇫', 'NG': '🇳🇬', 'NI': '🇳🇮', 'NL': '🇳🇱', 'NO': '🇳🇴', 'NP': '🇳🇵',
    'NR': '🇳🇷', 'NU': '🇳🇺', 'NZ': '🇳🇿', 'OM': '🇴🇲', 'PA': '🇵🇦', 'PE': '🇵🇪', 'PF': '🇵🇫',
    'PG': '🇵🇬', 'PH': '🇵🇭', 'PK': '🇵🇰', 'PL': '🇵🇱', 'PM': '🇵🇲', 'PN': '🇵🇳', 'PR': '🇵🇷',
    'PS': '🇵🇸', 'PT': '🇵🇹', 'PW': '🇵🇼', 'PY': '🇵🇾', 'QA': '🇶🇦', 'RE': '🇷🇪', 'RO': '🇷🇴',
    'RS': '🇷🇸', 'RU': '🇷🇺', 'RW': '🇷🇼', 'SA': '🇸🇦', 'SB': '🇸🇧', 'SC': '🇸🇨', 'SD': '🇸🇩',
    'SE': '🇸🇪', 'SG': '🇸🇬', 'SH': '🇸🇭', 'SI': '🇸🇮', 'SJ': '🇸🇯', 'SK': '🇸🇰', 'SL': '🇸🇱',
    'SM': '🇸🇲', 'SN': '🇸🇳', 'SO': '🇸🇴', 'SR': '🇸🇷', 'SS': '🇸🇸', 'ST': '🇸🇹', 'SV': '🇸🇻',
    'SX': '🇸🇽', 'SY': '🇸🇾', 'SZ': '🇸🇿', 'TC': '🇹🇨', 'TD': '🇹🇩', 'TF': '🇹🇫', 'TG': '🇹🇬',
    'TH': '🇹🇭', 'TJ': '🇹🇯', 'TK': '🇹🇰', 'TL': '🇹🇱', 'TM': '🇹🇲', 'TN': '🇹🇳', 'TO': '🇹🇴',
    'TR': '🇹🇷', 'TT': '🇹🇹', 'TV': '🇹🇻', 'TW': '🇹🇼', 'TZ': '🇹🇿', 'UA': '🇺🇦', 'UG': '🇺🇬',
    'UM': '🇺🇲', 'US': '🇺🇸', 'UY': '🇺🇾', 'UZ': '🇺🇿', 'VA': '🇻🇦', 'VC': '🇻🇨', 'VE': '🇻🇪',
    'VG': '🇻🇬', 'VI': '🇻🇮', 'VN': '🇻🇳', 'VU': '🇻🇺', 'WF': '🇼🇫', 'WS': '🇼🇸', 'YE': '🇾🇪',
    'YT': '🇾🇹', 'ZA': '🇿🇦', 'ZM': '🇿🇲', 'ZW': '🇿🇼'
  };

  return flagMap[countryCode.toUpperCase()] || '';
};

// Airline Logo Component
const AirlineLogo = ({
  airlineIata,
  airlineName,
  size = 'md'
}: {
  airlineIata: string;
  airlineName: string;
  size?: 'sm' | 'md' | 'lg'
}) => {
  const logoPath = getAirlineLogoPath(airlineIata);

  // Size configurations
  const sizeConfig = {
    sm: { container: 'w-5 h-5', fallback: 'w-3 h-3' },
    md: { container: 'w-6 h-6', fallback: 'w-4 h-4' },
    lg: { container: 'w-8 h-8', fallback: 'w-6 h-6' }
  };

  const { container, fallback } = sizeConfig[size];

  return (
    <div className={cn("rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden", container)}>
      {logoPath ? (
        <Image
          src={logoPath}
          alt={`${airlineName} logo`}
          width={size === 'sm' ? 20 : size === 'md' ? 24 : 32}
          height={size === 'sm' ? 20 : size === 'md' ? 24 : 32}
          className="airline-logo object-contain rounded-full"
          onError={(e) => {
            // Fallback to gray circle if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="${cn('rounded-full bg-gray-400', fallback)}"></div>`;
            }
          }}
        />
      ) : (
        <div className={cn("rounded-full bg-gray-400", fallback)}></div>
      )}
    </div>
  );
};

const FlightStatusWidget = ({ data }: { data?: FlightStatusData }) => {
  const flightData = data || mockFlightStatus;

  // Use the first flight ticket and its first flight data
  const ticket = flightData.flights[0];
  const flight = ticket.flights_data[0];

  // Get airline name from IATA code (you might want to create a mapping)
  const getAirlineName = (iata: string): string => {
    const airlineMap: { [key: string]: string } = {
      '6E': 'IndiGo',
      'AI': 'Air India',
      'SG': 'SpiceJet',
      'G8': 'GoAir',
      'I5': 'AirAsia India',
      'UK': 'Vistara',
      '9W': 'Jet Airways',
      'S2': 'JetLite',
      'DN': 'Alliance Air',
      'LB': 'Libyan Airlines'
    };
    return airlineMap[iata] || iata;
  };

  const departureCountryCode = getCountryCode(flight.departure.country);
  const arrivalCountryCode = getCountryCode(flight.arrival.country);

  return (
    <div
      className="w-full max-w-sm sm:max-w-md mx-auto mt-3 sm:mt-6 p-3 sm:p-5 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200"
      style={{ fontFamily: 'Uber Move, Arial, Helvetica, sans-serif' }}
    >
      {/* Header with PNR and Airline Info */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        {/* PNR Info - Top Left */}
        <div>
          <div className="text-xs text-gray-600 mb-1">PNR</div>
          <div className="font-bold text-black text-base sm:text-lg tracking-wider">
            {ticket.pnr}
          </div>
        </div>

        {/* Airline Info - Top Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <AirlineLogo
            airlineIata={flight.airline_iata}
            airlineName={getAirlineName(flight.airline_iata)}
            size="sm"
          />
          <div className="text-right">
            <div className="font-semibold text-gray-900 text-xs sm:text-sm">
              {getAirlineName(flight.airline_iata)}
            </div>
            <div className="text-xs text-gray-500">
              {flight.flightNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Departure Section */}
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-black mb-1">
              {flight.departure.code}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-base sm:text-lg leading-none"
                style={{
                  fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Twemoji Mozilla, sans-serif',
                  fontSize: '16px'
                }}
              >
                {getCountryFlag(departureCountryCode) || departureCountryCode}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm leading-none">
                {flight.departure.city}
              </span>
            </div>
            <p className="text-black text-xs sm:text-sm font-medium">
              {flight.departure_terminal && `Terminal ${flight.departure_terminal}`}
              {flight.departure_terminal && flight.boarding_gate && ' . '}
              {flight.boarding_gate && `Gate ${flight.boarding_gate}`}
            </p>
          </div>
          <div className="text-right">
            <div className={cn("text-base sm:text-lg font-bold mb-1", getTimeColor(flight.flight_state))}>
              {flight.departure.time}
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <span className={cn("font-medium text-xs sm:text-sm", getStatusColor(flight.flight_state))}>
                {flight.flight_state}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Duration Info */}
      <div className="text-center mb-3 sm:mb-4">
        <p className="text-gray-500 text-xs sm:text-sm">
          {flight.duration} . Direct
        </p>
      </div>

      {/* Arrival Section */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-black mb-1">
              {flight.arrival.code}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-base sm:text-lg leading-none"
                style={{
                  fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Twemoji Mozilla, sans-serif',
                  fontSize: '16px'
                }}
              >
                {getCountryFlag(arrivalCountryCode) || arrivalCountryCode}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm leading-none">
                {flight.arrival.city}
              </span>
            </div>
            <p className="text-black text-xs sm:text-sm font-medium">
              {flight.arrival_terminal && `Terminal ${flight.arrival_terminal}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-base sm:text-lg font-bold text-black mb-1">
              {flight.arrival.time}
            </div>
            <div className="flex items-center justify-end">
              <span className={cn("font-medium text-xs sm:text-sm", getStatusColor(flight.flight_state))}>
                {flight.flight_state}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightStatusWidget;
