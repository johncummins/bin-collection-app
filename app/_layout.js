import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen name="postcode" options={{ title: "Find Address" }} />
        <Stack.Screen name="index" options={{ title: `Address name here` }} />
      </Stack>
    </GluestackUIProvider>
  );
}
