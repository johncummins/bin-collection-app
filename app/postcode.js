import { View, StyleSheet } from "react-native";
import Input from "./Components/Input";

import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";

export default function PostcodeScreen() {
  return (
    <View style={styles.container}>
      <VStack space="md">
        <Input label={"Postcode"} placeholder={"CB1 2DF"}></Input>
        <Button
          onPress={(value) => {
            console.log(value);
          }}>
          <ButtonText className="text-typography-0">Search</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
