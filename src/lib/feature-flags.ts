// Feature flags for the enhanced chat system
export const FEATURE_FLAGS = {
  // Enable enhanced layout system
  ENHANCED_LAYOUT:
    process.env.NEXT_PUBLIC_ENABLE_ENHANCED_LAYOUT === "true" || false,

  // Enable enhanced responsive design
  ENHANCED_RESPONSIVE:
    process.env.NEXT_PUBLIC_ENABLE_ENHANCED_RESPONSIVE === "true" || true,

  // Enable widget coordination
  WIDGET_COORDINATION:
    process.env.NEXT_PUBLIC_ENABLE_WIDGET_COORDINATION === "true" || true,

  // Enable performance tracking
  PERFORMANCE_TRACKING:
    process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING === "true" || true,

  // Enable mobile enhancements
  MOBILE_ENHANCEMENTS:
    process.env.NEXT_PUBLIC_ENABLE_MOBILE_ENHANCEMENTS === "true" || true,
} as const;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

// Helper function to get all enabled features
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}
