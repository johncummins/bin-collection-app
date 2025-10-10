/**
 * @fileoverview Combined Analytics - Firebase for User Behavior, Sentry for Errors
 *
 * This combines Firebase Analytics (for user behavior) and Sentry (for error monitoring)
 * to give you the best of both worlds.
 *
 * @author Cambridge Bins Team
 * @version 1.0.0
 */

import firebaseAnalytics from "./firebaseAnalytics";
import sentryAnalytics from "./sentryAnalytics";

class CombinedAnalytics {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initializes both Firebase Analytics and Sentry Analytics.
   * Call this once when your app starts.
   *
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize Firebase Analytics for user behavior
      await firebaseAnalytics.initialize();

      // Initialize Sentry Analytics for error monitoring
      await sentryAnalytics.initialize();

      this.isInitialized = true;
    } catch (error) {
      console.error("Combined Analytics initialization failed:", error);
    }
  }

  // === USER BEHAVIOR (Firebase Analytics) ===

  /**
   * Track screen views - goes to Firebase Analytics
   */
  async trackScreen(screenName, properties = {}) {
    await firebaseAnalytics.trackScreen(screenName, properties);
  }

  /**
   * Track user actions - goes to Firebase Analytics
   */
  async trackAction(action, properties = {}) {
    await firebaseAnalytics.trackUserAction(action, properties);
  }

  /**
   * Track bin collection events - goes to Firebase Analytics
   */
  async trackBinCollectionEvent(eventType, properties = {}) {
    await firebaseAnalytics.trackBinCollectionEvent(eventType, properties);
  }

  /**
   * Track address selection - goes to Firebase Analytics
   */
  async trackAddressSelection(addressId, address, source = "manual") {
    await firebaseAnalytics.trackAddressSelection(addressId, address, source);
  }

  /**
   * Track notification events - goes to Firebase Analytics
   */
  async trackNotificationEvent(eventType, properties = {}) {
    await firebaseAnalytics.trackNotificationEvent(eventType, properties);
  }

  /**
   * Track app lifecycle events - goes to Firebase Analytics
   */
  async trackAppLifecycle(event) {
    await firebaseAnalytics.trackAppLifecycle(event);
  }

  /**
   * Set user properties - goes to Firebase Analytics
   */
  async setUserProperties(properties) {
    await firebaseAnalytics.setUserProperties(properties);
  }

  /**
   * Track custom events - goes to Firebase Analytics
   */
  async trackCustomEvent(eventName, parameters = {}) {
    await firebaseAnalytics.trackCustomEvent(eventName, parameters);
  }

  // === ERROR MONITORING & PERFORMANCE (Sentry Analytics) ===

  /**
   * Track errors - goes to Sentry
   */
  trackError(error, context = {}) {
    sentryAnalytics.trackError(error, context);
  }

  /**
   * Track API calls - goes to both Firebase (for user context) and Sentry (for performance/errors)
   */
  async trackApiCall(endpoint, method, statusCode, duration, properties = {}) {
    // Send to Firebase for user behavior analytics
    await firebaseAnalytics.trackApiCall(
      endpoint,
      method,
      statusCode,
      duration,
      properties
    );

    // Send to Sentry for performance monitoring
    sentryAnalytics.trackApiCall(
      endpoint,
      method,
      statusCode,
      duration,
      properties
    );
  }

  /**
   * Track performance metrics - goes to Sentry
   */
  trackPerformance(metricName, value, unit = "ms", properties = {}) {
    sentryAnalytics.trackPerformance(metricName, value, unit, properties);
  }
}

// Create singleton instance
const analytics = new CombinedAnalytics();

export default analytics;
