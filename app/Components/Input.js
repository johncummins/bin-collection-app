import { Text } from "react-native";
import { Input, InputField } from "@/components/ui/input";

export default ({
  label,
  placeholder,
  value,
  onChangeText,
  onSubmitEditing,
}) => (
  <>
    {label && <Text className="text-lg font-semibold">{label}</Text>}
    <Input variant="outline" size="lg">
      <InputField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        autoCapitalize="characters"
      />
    </Input>
  </>
);
