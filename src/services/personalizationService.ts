import { getCurrentLanguage } from "@/utils/i18n";
import { getJwtToken } from "@/services/authService";

// Types for the personalization API
export interface QuickTab {
  title: string;
  text: string;
}

export interface PersonalizationResponse {
  success: boolean;
  data: {
    quickTabs: QuickTab[];
  };
}

export interface PersonalizationError {
  success: false;
  error: string;
}

export type PersonalizationResult =
  | PersonalizationResponse
  | PersonalizationError;

// API configuration
const PERSONALIZATION_API_URL =
  "https://prod-api.flyo.ai/core/v2/user/personalization";

export interface PersonalizationParams {
  latitude?: number;
  longitude?: number;
  language?: string;
}

/**
 * Fetch personalization data from the API
 * @param params - Optional parameters for location and language
 * @returns Promise<PersonalizationResult>
 */
export async function fetchPersonalizationData(
  params: PersonalizationParams = {},
): Promise<PersonalizationResult> {
  try {
    // Get JWT token from localStorage
    const jwtToken = getJwtToken();
    if (!jwtToken) {
      return {
        success: false,
        error:
          "No authentication token found. Please log in to access personalized content.",
      };
    }

    // Build query parameters conditionally
    const queryParams = new URLSearchParams();

    // Add location parameters only if both latitude and longitude are provided
    if (params.latitude !== undefined && params.longitude !== undefined) {
      queryParams.append("latitude", params.latitude.toString());
      queryParams.append("longitude", params.longitude.toString());
    }

    // Add language parameter only if it's Arabic
    if (params.language === "ar") {
      queryParams.append("language", "ar");
    }

    // Construct the full URL with query parameters
    const url = queryParams.toString()
      ? `${PERSONALIZATION_API_URL}?${queryParams.toString()}`
      : PERSONALIZATION_API_URL;

    console.log("Fetching personalization data from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PersonalizationResponse = await response.json();

    // Validate the response structure
    if (!data.success || !data.data || !Array.isArray(data.data.quickTabs)) {
      throw new Error("Invalid response structure from personalization API");
    }

    console.log("Personalization data fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Error fetching personalization data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get personalization parameters based on current context
 * @param locationData - Optional location data
 * @returns PersonalizationParams
 */
export function getPersonalizationParams(locationData?: {
  latitude: number;
  longitude: number;
}): PersonalizationParams {
  const params: PersonalizationParams = {};

  // Add location if available
  if (locationData) {
    params.latitude = locationData.latitude;
    params.longitude = locationData.longitude;
  }

  // Add language if it's Arabic
  const currentLanguage = getCurrentLanguage();
  if (currentLanguage === "ar") {
    params.language = "ar";
  }

  return params;
}

/**
 * Validate quick tab data
 * @param quickTab - Quick tab to validate
 * @returns boolean
 */
export function isValidQuickTab(quickTab: any): quickTab is QuickTab {
  return (
    typeof quickTab === "object" &&
    quickTab !== null &&
    typeof quickTab.title === "string" &&
    typeof quickTab.text === "string" &&
    quickTab.title.trim().length > 0 &&
    quickTab.text.trim().length > 0
  );
}

/**
 * Filter and validate quick tabs from API response
 * @param quickTabs - Array of quick tabs from API
 * @returns QuickTab[]
 */
export function validateQuickTabs(quickTabs: any[]): QuickTab[] {
  if (!Array.isArray(quickTabs)) {
    return [];
  }

  return quickTabs.filter(isValidQuickTab);
}
