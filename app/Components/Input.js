import { Text, ActivityIndicator, View } from "react-native";
import { Input, InputField } from "@/components/ui/input";

export default ({
  label,
  placeholder,
  value,
  onChangeText,
  onSubmitEditing,
  textContentType,
  autoComplete,
  error,
  loading = false,
  ...props
}) => (
  <>
    {label && <Text className="text-lg font-semibold">{label}</Text>}
    <Input
      variant="outline"
      size="lg"
      className={error ? "border-red-500" : ""}>
      <InputField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        autoCapitalize="characters"
        textContentType={textContentType}
        autoComplete={autoComplete}
        editable={!loading}
        {...props}
      />
      {loading && (
        <View
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: [{ translateY: -10 }],
          }}>
          <ActivityIndicator size="small" color="#333333" />
        </View>
      )}
    </Input>
  </>
);
