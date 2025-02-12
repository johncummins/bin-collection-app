import { Text } from "react-native";

import { Input, InputField } from "@/components/ui/input";

export default ({ label, placeholder }) => (
  <>
    <Text className="text-typography-500">{label}</Text>
    <Input className="min-w-[350px]" variant="outline" size="xl">
      <InputField placeholder={placeholder} />
    </Input>
  </>
);
