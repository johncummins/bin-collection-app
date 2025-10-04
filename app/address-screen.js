import { useState, useCallback } from "react";
import {
  View,
  Pressable,
  Text,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import Input from "./components/Input";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Table, TableBody, TableRow, TableData } from "@/components/ui/table";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { capitalize, throttle } from "lodash";
import CollectionBinIcon from "./components/CollectionBinIcon";
import Toast from "react-native-toast-message";

export default function PostcodeScreen() {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const router = useRouter();

  const fetchAddresses = async () => {
    // Clear previous errors
    setError(null);
    setValidationError(null);

    // Check for empty input
    if (!postcode.trim()) {
      setValidationError("Please enter a postcode");
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

    // Validate postcode format
    if (!postcodeRegex.test(postcode.trim())) {
      setValidationError("Please enter a valid UK postcode");
      setAddresses([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://servicelayer3c.azure-api.net/wastecalendar/address/search?postcode=${encodeURIComponent(
          postcode
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Couldn't reach the server. Please check your connection."
        );
      }

      const data = await response.json();

      if (!data.length || data[0].id < 0) {
        setValidationError("No addresses found for this postcode");
        setAddresses([]);
        setLoading(false);
        return;
      }

      setAddresses(data);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Search failed",
        text2: err.message || "Something went wrong. Please try again.",
      });
      setAddresses([]);
    }

    setLoading(false);
  };

  // At most one API call every 10 seconds with latest postcode
  const throttledFetchAddresses = useCallback(
    throttle(() => fetchAddresses(), 10000),
    [postcode]
  );

  const handleRowClick = async ({ id: addressId, address }) => {
    setSelectedRowId(selectedRowId === addressId ? null : addressId);

    const addressObject = { id: addressId, address: address };

    try {
      await AsyncStorage.setItem("address", JSON.stringify(addressObject));
      router.replace("/home-screen");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Save failed",
        text2: "Couldn't save your address. Please try again.",
      });
    }
  };

  const tableRows = addresses.map(
    ({ houseNumber, street, town, postCode, id }, index) => {
      const address = `${capitalize(houseNumber)} ${capitalize(street)}`;
      return (
        <Pressable
          key={id}
          onPress={() => handleRowClick({ id, address })}
          className={`${selectedRowId === id ? "bg-blue-50" : "bg-white"} ${
            index < addresses.length - 1 ? "border-b border-gray-200" : ""
          }`}>
          <View className="px-4 py-4">
            <Text className="text-lg font-medium text-gray-900 mb-1">
              {address}
            </Text>
            <Text className="text-sm text-gray-500">
              {capitalize(town)}, {postCode}
            </Text>
          </View>
        </Pressable>
      );
    }
  );

  return (
    <View className="flex-1">
      {/* Search Input & Button */}
      <View className="pt-6 px-6">
        <VStack space="xl">
          <View>
            <Input
              placeholder="Enter your postcode..."
              value={postcode}
              onChangeText={(text) => {
                setPostcode(text);
                // Clear validation error when user starts typing
                if (validationError) {
                  setValidationError(null);
                }
              }}
              onSubmitEditing={throttledFetchAddresses}
              textContentType="postalCode"
              autoComplete="postal-code"
              error={!!validationError}
              loading={loading}
            />
            {validationError && (
              <Text className="text-red-500 text-sm mt-2 ml-1">
                {validationError}
              </Text>
            )}
          </View>
          <Button
            size="lg"
            onPress={() => {
              throttledFetchAddresses();
              Keyboard.dismiss();
            }}
            disabled={loading}>
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                  className="mr-2"
                />
                <ButtonText>Finding Your Address...</ButtonText>
              </View>
            ) : (
              <ButtonText>Find My Address</ButtonText>
            )}
          </Button>
        </VStack>
      </View>

      {/* Centered Bin Icon & Text */}
      {addresses.length === 0 && !loading && (
        <View className="flex-1 items-center pt-32">
          <CollectionBinIcon width={100} height={100} fill="#333" />
          <Text className="mt-6 px-28 text-center text-md">
            Enter your postcode to find your address
          </Text>
        </View>
      )}

      {/* Loading skeleton for address search */}
      {loading && (
        <View className="flex-1 px-6 pt-6">
          <Text className="text-lg font-semibold pb-4 text-gray-800">
            Select your address
          </Text>
          <View className="bg-white rounded-lg border border-gray-200">
            {/* Skeleton address items */}
            {[1, 2, 3, 4].map((_, index) => (
              <View
                key={index}
                className={`px-4 py-4 ${
                  index < 3 ? "border-b border-gray-200" : ""
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
        <View className="flex-1 px-6 pt-6">
          <Text className="text-lg font-semibold pb-4 text-gray-800">
            Select your address
          </Text>
          <ScrollView
            className="bg-white rounded-lg border border-gray-200"
            style={{ maxHeight: Math.min(addresses.length * 80 + 40, 400) }}
            showsVerticalScrollIndicator={false}>
            {tableRows}
          </ScrollView>
        </View>
      )}

      <Toast />
    </View>
  );
}
