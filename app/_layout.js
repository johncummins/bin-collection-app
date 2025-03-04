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
        <Stack.Screen name="AddressScreen" options={{ title: "" }} />
        <Stack.Screen name="index" options={{ title: "Home page" }} />
        <Stack.Screen
          name="ManageNotifications"
          options={{ title: "Manage Notifications" }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
