'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Agent Chat UI'],

  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  /**
   * This application_logging block shows the default configuration. That is,
   * it is not technically necessary; if it were omitted completely, we'd still
   * get the same configuration applied.
   *
   * We are including it here for illustrative purposes. With log forwarding
   * enabled, the Pino instance returned by `lib/logger.js` will be instrumented
   * by the `newrelic` agent and ship logs to New Relic so that they can be
   * viewed in the dashboard.
   */
  application_logging: {
    forwarding: {
      enabled: true
    }
  },

  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'trace'
  },

  /**
   * When true, enables the collection of distributed traces.
   */
  distributed_tracing: {
    enabled: true
  },

  /**
   * When true, enables the collection of span events.
   */
  span_events: {
    enabled: true
  },

  /**
   * Enable support for worker threads
   */
  worker_threads: {
    enabled: true
  },

  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,

  /**
   * Proxy settings for connecting to the New Relic collector
   */
  proxy: {
    enabled: false
  },

  /**
   * Tells the transaction tracer and error collector (transaction errors) whether or
   * not to collect error attributes. Configuration in the server-side config file
   * takes precedence.
   */
  error_collector: {
    enabled: true
  },

  /**
   * Tells the transaction tracer and error collector (transaction errors) whether or
   * not to collect error attributes. Configuration in the server-side config file
   * takes precedence.
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 5,
    record_sql: 'obfuscated',
    stack_trace_threshold: 0.5,
    explain_threshold: 0.5
  },

  /**
   * Transaction naming rules for better identification
   */
  transaction_naming: {
    enabled: true
  },

  /**
   * URL rules for better transaction naming
   */
  url_rules: [
    {
      name: 'API Routes',
      pattern: '/api/*',
      terms: ['api']
    },
    {
      name: 'Homepage',
      pattern: '/',
      terms: ['homepage']
    },
    {
      name: 'Login Page',
      pattern: '/login',
      terms: ['login']
    },
    {
      name: 'Widgets Page',
      pattern: '/widgets',
      terms: ['widgets']
    }
  ],

  /**
   * Browser monitoring configuration
   */
  browser_monitoring: {
    enable: true
  },

  /**
   * Instrumentation configuration
   */
  instrumentation: {
    enabled: true
  },

  /**
   * Security policies and settings
   */
  security_policies_token: process.env.NEW_RELIC_SECURITY_POLICIES_TOKEN,

  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     *
     * @name NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
};
