# New Relic Frontend Monitoring Implementation

This document describes the frontend monitoring implementation for the Next.js application using New Relic Browser Agent.

## Overview

The frontend monitoring implementation includes:

- Browser agent script injection
- Error tracking and reporting
- Page view monitoring
- Custom event tracking
- User interaction monitoring
- Error boundaries for React components

## Components

### 1. Document Component (`src/app/_document.tsx`)

- Injects the New Relic browser agent script
- Handles server-side browser timing header generation
- Ensures proper script loading for client-side monitoring

### 2. Error Boundary (`src/components/common/NewRelicErrorBoundary.tsx`)

- Catches React component errors
- Sends error details to New Relic
- Provides fallback UI for error states
- Includes error stack traces and component information
- **Note**: Marked as Client Component with `"use client"` directive

### 3. Error Page (`src/app/_error.tsx`)

- Handles Next.js error pages
- Sends server-side errors to New Relic
- Provides user-friendly error messages

### 4. New Relic Hook (`src/hooks/useNewRelic.ts`)

- Provides easy access to New Relic browser functions
- Includes methods for tracking events, errors, and user interactions
- Handles browser availability checks
- **Note**: Marked as Client Component with `"use client"` directive

### 5. Monitor Component (`src/components/common/NewRelicMonitor.tsx`)

- Automatically tracks page views
- Sets custom attributes for pages
- Provides centralized monitoring logic
- **Note**: Marked as Client Component with `"use client"` directive

## Usage

### Basic Error Tracking

```typescript
import { useNewRelic } from "../hooks/useNewRelic";

const MyComponent = () => {
  const { noticeError } = useNewRelic();

  const handleError = (error: Error) => {
    noticeError(error, {
      component: "MyComponent",
      action: "handleError",
    });
  };

  // ... component logic
};
```

### Custom Event Tracking

```typescript
import { useNewRelic } from "../hooks/useNewRelic";

const MyComponent = () => {
  const { trackEvent, trackUserAction } = useNewRelic();

  const handleButtonClick = () => {
    trackEvent("button_click", {
      buttonId: "submit-button",
      page: "checkout",
    });

    trackUserAction("form_submit", {
      formType: "checkout",
      items: 3,
    });
  };

  // ... component logic
};
```

### Page View Monitoring

```typescript
import NewRelicMonitor from '../components/common/NewRelicMonitor';

const MyPage = () => {
  return (
    <div>
      <NewRelicMonitor
        pageName="Checkout Page"
        customAttributes={{
          pageType: 'checkout',
          userType: 'premium',
        }}
      />
      {/* Page content */}
    </div>
  );
};
```

### Custom Attributes

```typescript
import { useNewRelic } from "../hooks/useNewRelic";

const MyComponent = () => {
  const { setCustomAttribute, setCustomAttributes } = useNewRelic();

  useEffect(() => {
    setCustomAttribute("userType", "premium");
    setCustomAttributes({
      pageLoadTime: performance.now(),
      userAgent: navigator.userAgent,
    });
  }, []);

  // ... component logic
};
```

## Configuration

### Client Components

All New Relic monitoring components that interact with the browser are marked as Client Components using the `"use client"` directive. This is required because:

- Class components (like Error Boundaries) must be Client Components in Next.js App Router
- Browser APIs (like `window.newrelic`) are only available on the client side
- React hooks can only be used in Client Components

### Environment Variables

Make sure these environment variables are set:

```bash
NEW_RELIC_APP_NAME=Your App Name
NEW_RELIC_LICENSE_KEY=your-license-key
```

### New Relic Configuration

The browser monitoring is configured in `newrelic.cjs`:

```javascript
browser_monitoring: {
  enable: true;
}
```

## Monitoring Features

### 1. Automatic Page View Tracking

- Tracks all page views automatically
- Includes page path and custom attributes
- Monitors page load performance

### 2. Error Tracking

- Catches JavaScript errors
- Tracks React component errors
- Includes stack traces and context
- Handles both client and server errors

### 3. User Interaction Monitoring

- Tracks user actions and events
- Monitors form submissions
- Records button clicks and navigation

### 4. Performance Monitoring

- Core Web Vitals tracking
- Page load time monitoring
- AJAX request monitoring
- Resource loading performance

### 5. Custom Event Tracking

- Business-specific events
- User journey tracking
- Conversion funnel monitoring

## Best Practices

1. **Error Handling**: Always wrap error-prone components with the error boundary
2. **Event Naming**: Use consistent naming conventions for events
3. **Attribute Limits**: Keep custom attributes under 255 characters
4. **Performance**: Don't over-instrument; focus on important user actions
5. **Privacy**: Avoid tracking sensitive user information

## Troubleshooting

### Browser Agent Not Loading

- Check if `_document.tsx` is properly configured
- Verify New Relic license key is set
- Check browser console for errors

### Errors Not Appearing in New Relic

- Verify error boundary is wrapping components
- Check if `noticeError` is being called
- Ensure proper error object structure

### Performance Issues

- Monitor custom attribute count
- Avoid excessive event tracking
- Use interaction tracking for complex user flows

## Dashboard Setup

In New Relic, you can create dashboards to monitor:

- Page view performance
- Error rates and types
- User interaction patterns
- Custom business metrics

## Additional Resources

- [New Relic Browser Monitoring Documentation](https://docs.newrelic.com/docs/browser/)
- [Next.js Monitoring Best Practices](https://newrelic.com/blog/how-to-relic/nextjs-monitor-application-data)
- [React Error Boundary Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
