import { Text, ActivityIndicator, View, TouchableOpacity } from "react-native";
import { Input, InputField } from "@/components/ui/input";
import { Ionicons } from "@expo/vector-icons";

export default function CustomInput({
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
}) {
  return (
    <>
      {label && <Text className="text-lg font-semibold">{label}</Text>}
      <Input
        variant="filled"
        size="xl"
        className="bg-white focus:outline-none focus:ring-0 rounded-full pl-4 pr-4 py-3"
        style={{
          borderColor: error ? "#EF4444" : "#E5E7EB",
          borderWidth: 1,
        }}>
        <View className="flex-row items-center">
          <View
            style={{
              marginRight: 4,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Ionicons name="search" size={18} color="#6B7280" />
          </View>
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
            className="flex-1"
            style={{ outline: "none", border: "none" }}
            {...props}
          />
          {value && value.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeText("")}
              style={{
                marginLeft: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
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
}
