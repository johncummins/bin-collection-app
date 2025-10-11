import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Check if user has a saved address
        const storedAddress = await AsyncStorage.getItem("address");

        if (storedAddress) {
          router.replace("/address-screen");
          // User has an address, go to home screen
          // router.replace("/home-screen");
        } else {
          // No address saved, go to address screen
          router.replace("/address-screen");
        }
      } catch {
        // Default to address screen if there's an error
        router.replace("/address-screen");
      }
    };

    checkInitialRoute();
  }, []);

  // Show loading screen while determining initial route
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#333333" />
    </View>
  );
}
