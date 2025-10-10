/**
 * @fileoverview Sentry Analytics - Error Monitoring & Performance Tracking
 *
 * This handles error monitoring, crash reporting, and performance tracking via Sentry.
 * For user behavior analytics (screen views, button clicks, user journeys),
 * we use Firebase Analytics instead.
 *
 * @author Cambridge Bins Team
 * @version 1.0.0
 */

import * as Sentry from "@sentry/react-native";

// Initialize Sentry
Sentry.init({
  dsn: "https://1534af3ab42ac4d2bc3820f20a467ba0@o4510132435288064.ingest.de.sentry.io/4510132436992080",
  debug: __DEV__, // Enable debug mode in development
  environment: __DEV__ ? "development" : "production",

  // Performance monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,

  // Session tracking
  enableAutoSessionTracking: true,

  // Capture unhandled promise rejections
  enableAutoErrorTracking: true,

  // Additional options
  beforeSend(event) {
    // Filter out development errors if needed
    return event;
  },

  // Set user context
  beforeBreadcrumb(breadcrumb) {
    // Only filter out sensitive data, let everything else through
    if (
      breadcrumb.category === "http" &&
      breadcrumb.data?.url?.includes("password")
    ) {
      return null;
    }
    return breadcrumb;
  },
});

// Sentry initialization complete

/**
 * Sentry-focused analytics class for error monitoring and performance
 *
 * What it does:
 * - Catches errors and sends them to Sentry (so we know when things break)
 * - Monitors API performance (response times, error rates)
 * - Tracks app performance metrics
 * - Provides context for debugging errors
 * - Respects privacy (only uses anonymous IDs, no personal data)
 *
 * @class SentryAnalytics
 */
class SentryAnalytics {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Creates a unique session ID so we can track user sessions
   * @returns {string} A unique session identifier
   */
  generateSessionId() {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Sets up the analytics system - call this first!
   *
   * This gets everything ready: creates a user ID, sets up Sentry,
   * and makes sure we can start tracking stuff. You need to call this
   * before any other tracking methods will work.
   *
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set basic user context for Sentry
      Sentry.setUser({
        id: "anonymous_user",
        sessionId: this.generateSessionId(),
      });

      this.isInitialized = true;
    } catch (error) {
      console.error("Sentry Analytics initialization failed:", error);
    }
  }

  /**
   * Tracks errors - sends them to Sentry so we know when things break
   *
   * Error types we catch:
   * - data_fetch_error: When API calls fail
   * - address_update_error: When address selection goes wrong
   * - storage_error: When saving to device storage fails
   * - notification_setup: When notification setup fails
   * - component_did_catch: When React components crash
   *
   * @param {Error} error - The error that happened
   * @param {Object} [context={}] - Extra info about where/when it happened
   */
  trackError(error, context = {}) {
    Sentry.captureException(error, {
      tags: {
        component: context.component || "unknown",
        action: context.action || "unknown",
      },
      extra: context,
    });
  }

  /**
   * Track API calls - how fast they are, if they fail, etc.
   *
   * @param {string} endpoint - Which API endpoint
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {number} statusCode - HTTP status code (200, 404, etc.)
   * @param {number} duration - How long it took in milliseconds
   * @param {Object} [properties={}] - Extra API details
   */
  trackApiCall(endpoint, method, statusCode, duration, properties = {}) {
    // Only track API calls in Sentry if they're errors or slow
    if (statusCode >= 400) {
      // Track failed API calls as errors
      Sentry.addBreadcrumb({
        message: `API Error: ${method} ${endpoint} - ${statusCode}`,
        category: "http",
        level: "error",
        data: {
          endpoint,
          method,
          status_code: statusCode,
          duration_ms: duration,
          ...properties,
        },
      });
    } else if (duration > 2000) {
      // Track slow API calls as performance warnings
      Sentry.addBreadcrumb({
        message: `Slow API call: ${endpoint} (${duration}ms)`,
        category: "performance",
        level: "warning",
        data: { duration_ms: duration, endpoint },
      });
    }
  }

  /**
   * Track performance - only track significant performance issues
   *
   * @param {string} metricName - What we're measuring
   * @param {number} value - How long it took
   * @param {string} [unit='ms'] - Unit of time (milliseconds by default)
   * @param {Object} [properties={}] - Extra details about the measurement
   */
  trackPerformance(metricName, value, unit = "ms", properties = {}) {
    // Only track performance issues that are actually problematic
    if (value > 3000) {
      // More than 3 seconds
      Sentry.addBreadcrumb({
        message: `Slow Performance: ${metricName} (${value}${unit})`,
        category: "performance",
        level: "warning",
        data: {
          metric_name: metricName,
          value,
          unit,
          ...properties,
        },
      });
    }
  }

  /**
   * Add breadcrumb for debugging context
   *
   * @param {string} message - Breadcrumb message
   * @param {string} category - Breadcrumb category
   * @param {Object} [data={}] - Additional data
   */
  addBreadcrumb(message, category = "info", data = {}) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: "info",
      data,
    });
  }

  /**
   * Sets user properties in Sentry for better error context
   *
   * @param {Object} properties - User info to add to Sentry
   */
  setUserProperties(properties) {
    Sentry.setUser({
      id: "anonymous_user",
      sessionId: this.generateSessionId(),
      ...properties,
    });
  }
}

/**
 * Sentry Error Monitoring Summary
 *
 * This class focuses ONLY on error monitoring and performance issues via Sentry.
 * Firebase Analytics handles all user behavior tracking.
 *
 * WHAT SENTRY TRACKS:
 * - trackError: All errors with full context
 * - trackApiCall: Only failed API calls (400+) and slow calls (>2s)
 * - trackPerformance: Only slow performance issues (>3s)
 *
 * WHAT SENTRY DOESN'T TRACK (Firebase handles these):
 * - User behavior (screen views, button clicks)
 * - User journeys and funnels
 * - Successful API calls
 * - Normal performance metrics
 *
 * BENEFITS:
 * - Clean separation of concerns
 * - Sentry focuses on problems, Firebase on user behavior
 * - Reduced noise in Sentry dashboard
 * - Better performance (less data sent to Sentry)
 */

// Create singleton instance
const sentryAnalytics = new SentryAnalytics();

export default sentryAnalytics;
