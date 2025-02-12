import { View, Text } from "react-native";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const addressStored = false;

  if (!addressStored) return <Redirect href="/postcode" />;

  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
