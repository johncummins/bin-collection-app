import { View, Text, ScrollView } from "react-native";
import Input from "./components/Input";
import { VStack } from "@/components/ui/vstack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CollectionBinIcon from "./components/CollectionBinIcon";
import AddressList from "./components/AddressList";
import { useAddressSearch } from "./hooks/useAddressSearch";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PostcodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    postcode,
    setPostcode,
    addresses,
    loading,
    validationError,
    setValidationError,
    selectedRowId,
    setSelectedRowId,
    throttledFetchAddresses,
    resetState,
  } = useAddressSearch();

  const handleAddressSelect = async ({ id: addressId, address }) => {
    setSelectedRowId(selectedRowId === addressId ? null : addressId);

    const addressObject = { id: addressId, address: address };

    try {
      await AsyncStorage.setItem("address", JSON.stringify(addressObject));
      router.replace("/home-screen");
    } catch (_error) {
      Toast.show({
        type: "error",
        text1: "Save failed",
        text2: "Couldn't save your address. Please try again.",
      });
    }
  };

  return (
    <View className="flex-1">
      {/* Header with title */}
      <View
        className="px-6 items-center"
        style={{ paddingTop: insets.top + 8, paddingBottom: 16 }}>
        <Text className="text-lg font-semibold text-gray-800">
          Enter Postcode
        </Text>
      </View>

      {/* Search Input */}
      <View className="px-6 pb-6">
        <VStack space="lg">
          <View>
            <Input
              placeholder="e.g. CB4 2DF"
              value={postcode}
              onChangeText={(text) => {
                setPostcode(text);
                // Clear validation error when user starts typing
                if (validationError) {
                  setValidationError(null);
                }
                // Clear addresses when input is cleared
                if (!text.trim()) {
                  // Reset all state except postcode (which we're setting)
                  resetState();
                  setPostcode(text);
                }
              }}
              onSubmitEditing={throttledFetchAddresses}
              textContentType="postalCode"
              autoComplete="postal-code"
              error={!!validationError}
            />
            {validationError && (
              <Text className="text-red-500 text-sm mt-2 ml-1">
                {validationError}
              </Text>
            )}
          </View>
        </VStack>
      </View>

      {/* Centered Bin Icon & Text */}
      {addresses.length === 0 && !loading && (
        <View className="flex-1 items-center pt-32">
          <CollectionBinIcon width={120} height={120} fill="#333" />
          <Text className="mt-6 px-18 text-center text-xl">
            Enter your postcode to find your address
          </Text>
          <Text className="mt-4 px-18 text-center text-sm text-gray-600">
            Find out when your bins will be collected
          </Text>
        </View>
      )}

      {/* Loading skeleton for address search */}
      {loading && addresses.length === 0 && (
        <View className="flex-1 px-6 pt-6">
          <Text className="text-lg font-semibold pb-4 text-gray-800">
            Select your address
          </Text>
          <View className="bg-white rounded-lg border border-gray-200">
            {/* Skeleton address items - show more items for full length */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
              <View
                key={index}
                className={`px-4 py-4 ${
                  index < 7 ? "border-b border-gray-200" : ""
                }`}>
                <View className="bg-gray-200 h-5 w-48 rounded mb-2" />
                <View className="bg-gray-200 h-4 w-32 rounded" />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Address List */}
      {addresses.length > 0 && (
        <View className="flex-1 px-6  pb-12">
          <Text className="text-lg font-semibold pb-4 text-gray-800">
            Select your address
          </Text>
          <ScrollView
            className="bg-white rounded-lg border border-gray-200 flex-1"
            showsVerticalScrollIndicator={false}>
            <AddressList
              addresses={addresses}
              selectedRowId={selectedRowId}
              onAddressSelect={handleAddressSelect}
            />
          </ScrollView>
        </View>
      )}

      <Toast />
    </View>
  );
}
