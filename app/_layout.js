import "@/global.css";

import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useEffect } from "react";
import analytics from "./utils/analytics"; // This now initializes Sentry too
import ErrorBoundary from "./components/ErrorBoundary";

export default function RootLayout() {
  useEffect(() => {
    // Initialize analytics when app starts
    analytics.initialize();
    analytics.trackAppLifecycle("app_started");
  }, []);

  return (
    <ErrorBoundary>
      <GluestackUIProvider mode="light">
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#f7f7f7" },
            contentStyle: { backgroundColor: "#f7f7f7" },
            headerShadowVisible: false,
          }}>
          <Stack.Screen
            name="address-screen"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="home-screen" options={{ title: "" }} />
        </Stack>
      </GluestackUIProvider>
    </ErrorBoundary>
  );
}
