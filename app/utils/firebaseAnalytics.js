/**
 * @fileoverview Firebase Analytics - User Behavior Tracking
 *
 * This handles all user behavior analytics using Firebase Analytics.
 * Tracks screen views, button clicks, user journeys, and app usage patterns.
 *
 * @author Cambridge Bins Team
 * @version 1.0.0
 */

import analytics from "@react-native-firebase/analytics";

/**
 * Firebase Analytics class for user behavior tracking
 *
 * What it does:
 * - Tracks screen views and navigation patterns
 * - Monitors button clicks and user interactions
 * - Records user journeys and funnels
 * - Tracks app usage patterns and engagement
 * - Privacy-focused: Anonymous tracking only
 *
 * @class FirebaseAnalytics
 */
class FirebaseAnalytics {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize Firebase Analytics
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Enable analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);

      // Set user properties
      await analytics().setUserId("anonymous_user");

      this.isInitialized = true;
      console.log("Firebase Analytics initialized");
    } catch (error) {
      console.error("Firebase Analytics initialization failed:", error);
    }
  }

  /**
   * Track screen views - Firebase Analytics handles this really well
   *
   * @param {string} screenName - Name of the screen
   * @param {Object} [properties={}] - Additional screen properties
   */
  async trackScreen(screenName, properties = {}) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName, // For iOS
        ...properties,
      });

      if (__DEV__) {
        console.log(
          `Firebase Analytics - Screen View: ${screenName}`,
          properties
        );
      }
    } catch (error) {
      console.error("Firebase Analytics screen tracking failed:", error);
    }
  }

  /**
   * Track user actions/events - Firebase Analytics is perfect for this
   *
   * @param {string} eventName - Name of the event
   * @param {Object} [parameters={}] - Event parameters
   */
  async trackEvent(eventName, parameters = {}) {
    try {
      await analytics().logEvent(eventName, {
        timestamp: Date.now(),
        ...parameters,
      });

      if (__DEV__) {
        console.log(`Firebase Analytics - Event: ${eventName}`, parameters);
      }
    } catch (error) {
      console.error("Firebase Analytics event tracking failed:", error);
    }
  }

  /**
   * Track button clicks and user interactions
   *
   * @param {string} action - What the user did
   * @param {Object} [properties={}] - Additional properties
   */
  async trackUserAction(action, properties = {}) {
    await this.trackEvent("user_action", {
      action,
      ...properties,
    });
  }

  /**
   * Track bin collection specific events
   *
   * @param {string} eventType - Type of bin collection event
   * @param {Object} [properties={}] - Event properties
   */
  async trackBinCollectionEvent(eventType, properties = {}) {
    await this.trackEvent("bin_collection_event", {
      event_type: eventType,
      ...properties,
    });
  }

  /**
   * Track address selection
   *
   * @param {string} addressId - Address ID
   * @param {string} address - Address string
   * @param {string} [source='manual'] - How they selected it
   */
  async trackAddressSelection(addressId, address, source = "manual") {
    await this.trackBinCollectionEvent("address_selected", {
      address_id: addressId,
      address: address,
      source,
    });
  }

  /**
   * Track API calls for user behavior context
   *
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {number} statusCode - HTTP status code
   * @param {number} duration - Response time in milliseconds
   * @param {Object} [properties={}] - Additional properties
   */
  async trackApiCall(endpoint, method, statusCode, duration, properties = {}) {
    await this.trackEvent("api_call", {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
      ...properties,
    });
  }

  /**
   * Track notification events
   *
   * @param {string} eventType - Notification event type
   * @param {Object} [properties={}] - Event properties
   */
  async trackNotificationEvent(eventType, properties = {}) {
    await this.trackEvent("notification_event", {
      event_type: eventType,
      ...properties,
    });
  }

  /**
   * Track app lifecycle events
   *
   * @param {string} event - Lifecycle event
   */
  async trackAppLifecycle(event) {
    await this.trackEvent("app_lifecycle", {
      lifecycle_event: event,
    });
  }

  /**
   * Set user properties for better segmentation
   *
   * @param {Object} properties - User properties
   */
  async setUserProperties(properties) {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }
    } catch (error) {
      console.error("Firebase Analytics setUserProperties failed:", error);
    }
  }

  /**
   * Track custom events with Firebase Analytics
   *
   * @param {string} eventName - Event name
   * @param {Object} [parameters={}] - Event parameters
   */
  async trackCustomEvent(eventName, parameters = {}) {
    await this.trackEvent(eventName, parameters);
  }
}

/**
 * Firebase Analytics Summary
 *
 * This class focuses ONLY on user behavior analytics via Firebase Analytics.
 * Sentry handles error monitoring and performance tracking.
 *
 * WHAT FIREBASE TRACKS:
 * - trackScreen: Screen views and navigation
 * - trackUserAction: Button clicks and user interactions
 * - trackBinCollectionEvent: Bin collection specific events
 * - trackAddressSelection: Address selection tracking
 * - trackNotificationEvent: Notification events
 * - trackAppLifecycle: App start/stop events
 * - trackApiCall: API usage patterns (for user behavior)
 * - trackCustomEvent: Custom events
 *
 * BENEFITS:
 * - Clean separation of concerns
 * - Firebase focuses on user behavior, Sentry on errors
 * - Better performance (optimized for each service)
 * - Easier debugging and maintenance
 */

// Create singleton instance
const firebaseAnalytics = new FirebaseAnalytics();

export default firebaseAnalytics;
