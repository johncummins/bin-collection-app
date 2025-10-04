import "@/global.css";

import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f7f7f7" },
          contentStyle: { backgroundColor: "#f7f7f7" },
          headerShadowVisible: false,
        }}>
        <Stack.Screen name="address-screen" options={{ title: "" }} />
        <Stack.Screen name="home-screen" options={{ title: "" }} />
        <Stack.Screen
          name="notifications-screen"
          options={{ title: "Notifications" }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
