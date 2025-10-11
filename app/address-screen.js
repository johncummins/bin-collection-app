import { View, Text, ScrollView } from "react-native";
import React from "react";
import Input from "./components/Input";
import { VStack } from "@/components/ui/vstack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import BinIcon from "./components/BinIcon";
import AddressList from "./components/AddressList";
import { useAddressSearch } from "./hooks/useAddressSearch";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import analytics from "./utils/analytics";

export default function PostcodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Track screen view
  React.useEffect(() => {
    analytics.trackScreen("address_screen");
  }, []);
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
      // Track address selection
      analytics.trackAddressSelection(addressId, address, "initial_setup");

      await AsyncStorage.setItem("address", JSON.stringify(addressObject));
      router.replace("/home-screen");
    } catch (error) {
      analytics.trackError(error, {
        component: "address_screen",
        action: "save_address",
        error_type: "storage_error",
      });
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
              onSubmitEditing={() => {
                analytics.trackAction("postcode_search", { postcode });
                throttledFetchAddresses();
              }}
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
          <BinIcon width={120} height={120} outline={true} />
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

      <Toast
        position="bottom"
        config={{
          error: (props) => (
            <View
              style={{
                backgroundColor: "#ef4444",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                marginHorizontal: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 4,
                  textAlign: "center",
                }}>
                {props.text1}
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  opacity: 0.9,
                  textAlign: "center",
                }}>
                {props.text2}
              </Text>
            </View>
          ),
        }}
      />
    </View>
  );
}
