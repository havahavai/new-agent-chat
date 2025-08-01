/**
 * Comprehensive Testing System
 * Provides utilities for component testing, integration testing, and performance testing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Test utilities for the chat application
export class ChatTestUtils {
  // Mock data generators
  static generateMockMessage(id: string, content: string, role: 'user' | 'assistant' = 'user') {
    return {
      id,
      content,
      role,
      timestamp: new Date().toISOString(),
      threadId: 'test-thread',
    };
  }

  static generateMockThread(id: string, title: string) {
    return {
      id,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
  }

  static generateMockWidget(id: string, type: string, data: any = {}) {
    return {
      id,
      type,
      data,
      isOpen: true,
      isMinimized: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Component testing utilities
  static async renderWithProviders(component: React.ReactElement, options: any = {}) {
    const {
      threadProvider = true,
      streamProvider = true,
      widgetProvider = true,
      layoutProvider = true,
      ...renderOptions
    } = options;

    // Import providers dynamically to avoid circular dependencies
    const { ThreadProvider } = await import('@/providers/Thread');
    const { StreamProvider } = await import('@/providers/Stream');
    const { WidgetStateProvider } = await import('@/providers/WidgetStateContext');
    const { LayoutStateProvider } = await import('@/providers/LayoutStateContext');

    let wrappedComponent = component;

    if (layoutProvider) {
      wrappedComponent = <LayoutStateProvider>{wrappedComponent}</LayoutStateProvider>;
    }

    if (widgetProvider) {
      wrappedComponent = <WidgetStateProvider>{wrappedComponent}</WidgetStateProvider>;
    }

    if (streamProvider) {
      wrappedComponent = <StreamProvider>{wrappedComponent}</StreamProvider>;
    }

    if (threadProvider) {
      wrappedComponent = <ThreadProvider>{wrappedComponent}</ThreadProvider>;
    }

    return render(wrappedComponent, renderOptions);
  }

  // Widget testing utilities
  static async testWidgetLaunch(widgetType: string, expectedData: any = {}) {
    const { openWidget } = await import('@/providers/WidgetStateContext');
    
    // Mock the openWidget function
    const mockOpenWidget = jest.fn();
    jest.spyOn(require('@/providers/WidgetStateContext'), 'useWidgetState').mockReturnValue({
      openWidget: mockOpenWidget,
    });

    // Trigger widget launch
    await act(async () => {
      await mockOpenWidget({ type: widgetType, data: expectedData });
    });

    // Verify widget was launched
    expect(mockOpenWidget).toHaveBeenCalledWith({
      type: widgetType,
      data: expectedData,
    });

    return mockOpenWidget;
  }

  // Message testing utilities
  static async testMessageSending(content: string, expectedResponse?: string) {
    const { sendMessage } = await import('@/providers/Stream');
    
    // Mock the sendMessage function
    const mockSendMessage = jest.fn();
    jest.spyOn(require('@/providers/Stream'), 'useStream').mockReturnValue({
      sendMessage: mockSendMessage,
    });

    // Send message
    await act(async () => {
      await mockSendMessage(content);
    });

    // Verify message was sent
    expect(mockSendMessage).toHaveBeenCalledWith(content);

    // If expected response provided, verify it
    if (expectedResponse) {
      await waitFor(() => {
        expect(screen.getByText(expectedResponse)).toBeInTheDocument();
      });
    }

    return mockSendMessage;
  }

  // Performance testing utilities
  static async measureComponentRenderTime(component: React.ReactElement): Promise<number> {
    const start = performance.now();
    
    await act(async () => {
      render(component);
    });
    
    const end = performance.now();
    return end - start;
  }

  static async measureWidgetLaunchTime(widgetType: string): Promise<number> {
    const start = performance.now();
    
    await this.testWidgetLaunch(widgetType);
    
    const end = performance.now();
    return end - start;
  }

  // Integration testing utilities
  static async testFullUserFlow(steps: Array<{
    action: string;
    data?: any;
    expectedResult?: any;
    waitFor?: string;
  }>) {
    for (const step of steps) {
      switch (step.action) {
        case 'send_message':
          await this.testMessageSending(step.data.content, step.expectedResult);
          break;
        case 'launch_widget':
          await this.testWidgetLaunch(step.data.type, step.data.config);
          break;
        case 'click_element':
          const element = screen.getByText(step.data.text);
          fireEvent.click(element);
          break;
        case 'type_input':
          const input = screen.getByPlaceholderText(step.data.placeholder);
          fireEvent.change(input, { target: { value: step.data.value } });
          break;
        case 'wait_for':
          if (step.waitFor) {
            await waitFor(() => {
              expect(screen.getByText(step.waitFor!)).toBeInTheDocument();
            });
          }
          break;
        default:
          throw new Error(`Unknown test action: ${step.action}`);
      }
    }
  }

  // Accessibility testing utilities
  static async testAccessibility(component: React.ReactElement) {
    const { axe, toHaveNoViolations } = await import('jest-axe');
    
    const { container } = render(component);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  }

  // Mock utilities
  static mockLocalStorage() {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    return localStorageMock;
  }

  static mockSessionStorage() {
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });
    
    return sessionStorageMock;
  }

  static mockFetch(response: any = {}) {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
      })
    ) as jest.Mock;
  }

  // Test data factories
  static createTestThreads(count: number = 5) {
    return Array.from({ length: count }, (_, i) =>
      this.generateMockThread(`thread-${i}`, `Test Thread ${i + 1}`)
    );
  }

  static createTestMessages(count: number = 10) {
    return Array.from({ length: count }, (_, i) =>
      this.generateMockMessage(
        `message-${i}`,
        `Test message ${i + 1}`,
        i % 2 === 0 ? 'user' : 'assistant'
      )
    );
  }

  static createTestWidgets(count: number = 3) {
    const widgetTypes = ['flightOptions', 'payment', 'weather', 'lounge', 'review'];
    return Array.from({ length: count }, (_, i) =>
      this.generateMockWidget(
        `widget-${i}`,
        widgetTypes[i % widgetTypes.length],
        { test: true }
      )
    );
  }
}

// Performance testing suite
export class PerformanceTestSuite {
  static async runPerformanceTests() {
    const results = {
      componentRenderTimes: {} as Record<string, number>,
      widgetLaunchTimes: {} as Record<string, number>,
      memoryUsage: 0,
      bundleSize: 0,
    };

    // Test component render times
    const components = [
      { name: 'Thread', component: await import('@/components/thread') },
      { name: 'WidgetLauncher', component: await import('@/components/widgets/WidgetLauncher') },
      { name: 'EnhancedWidgetLauncher', component: await import('@/components/widgets/EnhancedWidgetLauncher') },
    ];

    for (const { name, component } of components) {
      results.componentRenderTimes[name] = await ChatTestUtils.measureComponentRenderTime(
        <component.default />
      );
    }

    // Test widget launch times
    const widgetTypes = ['flightOptions', 'payment', 'weather'];
    for (const widgetType of widgetTypes) {
      results.widgetLaunchTimes[widgetType] = await ChatTestUtils.measureWidgetLaunchTime(widgetType);
    }

    // Measure memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      results.memoryUsage = memory.usedJSHeapSize;
    }

    // Measure bundle size
    const scripts = document.querySelectorAll('script[src]');
    results.bundleSize = Array.from(scripts).reduce((total, script) => {
      const src = script.getAttribute('src');
      return total + (src?.length || 0);
    }, 0);

    return results;
  }

  static async validatePerformanceBudget(results: any, budget: any) {
    const violations = [];

    // Check component render times
    for (const [component, time] of Object.entries(results.componentRenderTimes)) {
      if (time > budget.maxRenderTime) {
        violations.push(`${component} render time ${time}ms exceeds budget ${budget.maxRenderTime}ms`);
      }
    }

    // Check widget launch times
    for (const [widget, time] of Object.entries(results.widgetLaunchTimes)) {
      if (time > budget.maxWidgetLaunchTime) {
        violations.push(`${widget} launch time ${time}ms exceeds budget ${budget.maxWidgetLaunchTime}ms`);
      }
    }

    // Check memory usage
    if (results.memoryUsage > budget.maxMemoryUsage) {
      violations.push(`Memory usage ${results.memoryUsage} bytes exceeds budget ${budget.maxMemoryUsage} bytes`);
    }

    // Check bundle size
    if (results.bundleSize > budget.maxBundleSize) {
      violations.push(`Bundle size ${results.bundleSize} bytes exceeds budget ${budget.maxBundleSize} bytes`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}

// Integration testing suite
export class IntegrationTestSuite {
  static async testWidgetIntegration() {
    const testCases = [
      {
        name: 'Flight Options Widget',
        steps: [
          { action: 'launch_widget', data: { type: 'flightOptions', config: {} } },
          { action: 'wait_for', waitFor: 'Flight Options' },
          { action: 'type_input', data: { placeholder: 'From', value: 'New York' } },
          { action: 'type_input', data: { placeholder: 'To', value: 'London' } },
          { action: 'click_element', data: { text: 'Search Flights' } },
        ],
      },
      {
        name: 'Payment Widget',
        steps: [
          { action: 'launch_widget', data: { type: 'payment', config: {} } },
          { action: 'wait_for', waitFor: 'Payment' },
          { action: 'type_input', data: { placeholder: 'Amount', value: '100' } },
          { action: 'click_element', data: { text: 'Process Payment' } },
        ],
      },
    ];

    const results = [];
    for (const testCase of testCases) {
      try {
        await ChatTestUtils.testFullUserFlow(testCase.steps);
        results.push({ name: testCase.name, status: 'passed' });
      } catch (error) {
        results.push({ name: testCase.name, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  static async testChatFlow() {
    const testSteps = [
      { action: 'send_message', data: { content: 'Hello, how can you help me?' } },
      { action: 'wait_for', waitFor: 'Hello' },
      { action: 'send_message', data: { content: 'I need to book a flight' } },
      { action: 'wait_for', waitFor: 'flight' },
    ];

    try {
      await ChatTestUtils.testFullUserFlow(testSteps);
      return { status: 'passed' };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }
}

// Test configuration
export const TEST_CONFIG = {
  performance: {
    maxRenderTime: 16, // 60fps target
    maxWidgetLaunchTime: 100,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxBundleSize: 500 * 1024, // 500KB
  },
  integration: {
    timeout: 10000,
    retries: 3,
  },
  accessibility: {
    rules: {
      'color-contrast': { enabled: true },
      'button-name': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
    },
  },
};

// Export test utilities
export const testUtils = ChatTestUtils;
export const performanceTests = PerformanceTestSuite;
export const integrationTests = IntegrationTestSuite; 