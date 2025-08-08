import FlightOptionsWidget from "./flightOptions.widget";
import FlightStatusWidget from "./flightStatus.wdiget";
import SearchCriteriaWidget from "./searchCriteria.widget";
import HotelSearchCriteriaWidget from "./hotelSearchCriteria.widget";
import LoungeWidget from "./lounge.widget";
import weatherWidget from "./weather.widget";
import ReviewWidget from "./review.widget";
import PaymentWidget from "./payment.widget";
import NonAgentFlowWidget from "./non-agent-flow.widget";
import SeatPreferenceWidget from "./seatPreference.widget";
import SeatSelectionWidget from "./seatSelection.widget";
import SeatPaymentWidget from "./seatPayment.widget";
import SeatCombinedWidget from "./seatCombined.widget";
import AddBaggageWidget from "./addBaggage.widget";
import WhosTravellingWidget from "./whosTravelling.widget";
import HotelResultsWidget from "./hotelResults.widget";

export const componentMap = {
  SearchCriteriaWidget, // Add mapping for SearchCriteria type
  HotelSearchCriteriaWidget, // Add mapping for HotelSearchCriteria type
  HotelResults: HotelResultsWidget, // Add mapping for HotelResults type (from gojo-bot)
  FlightOptionsWidget,
  FlightStatusWidget, /// simple widget needs to send from server
  LoungeWidget, ///  simple widget needs to send from server
  weatherWidget, ///  simple widget needs to send from server
  TravelerDetailsWidget: WhosTravellingWidget, /// Flight booking review widget
  // Additional mappings for gojo-bot widgets
  flightSearch: FlightOptionsWidget, // Map flightSearch to FlightOptionsWidget
  weather: weatherWidget, // Map weather to weatherWidget
  LoungesWidget: LoungeWidget, // Map LoungesWidget to LoungeWidget
  PaymentWidget, /// Razorpay payment widget
  NonAgentFlowWidget, /// Non-agent flow payment widget with bottom sheet
  SeatPreferenceWidget, /// Seat preference selection widget
  SeatSelectionWidget, /// Visual seat map selection widget
  SeatPaymentWidget, /// Seat payment confirmation widget
  SeatCombinedWidget, /// Combined seat selection widget with all options
  AddBaggageWidget, /// Baggage selection widget with weight and price options
  WhosTravellingWidget, /// Passenger selection widget for booking
} as const;

export type ComponentType = keyof typeof componentMap;
