import React from "react";
import { View, Text, Button } from "react-native";
import * as Sentry from "@sentry/react-native";
import analytics from "../utils/analytics";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        component: "ErrorBoundary",
        errorBoundary: true,
      },
    });

    // Track error in analytics
    analytics.trackError(error, {
      component: "ErrorBoundary",
      action: "component_did_catch",
      errorInfo: errorInfo.componentStack,
    });

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    analytics.trackAction("error_boundary_retry");
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#f9fafb",
          }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 32,
              maxWidth: 320,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}>
            <Text
              style={{
                color: "#111827",
                fontWeight: "bold",
                fontSize: 20,
                textAlign: "center",
                marginBottom: 8,
              }}>
              Something went wrong
            </Text>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 24,
              }}>
              The app encountered an unexpected error. This has been reported to
              our team.
            </Text>
            <Button
              title="Try Again"
              onPress={this.handleRetry}
              color="#007AFF"
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
