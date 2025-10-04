import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Input from "./Input";
import { VStack } from "../../components/ui/vstack";
import CollectionBinIcon from "./CollectionBinIcon";
import AddressList from "./AddressList";
import { useAddressSearch } from "../hooks/useAddressSearch";
import Toast from "react-native-toast-message";

export default function AddressSelectionModal({
  visible,
  onClose,
  onAddressSelected,
}) {
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
    clearAddresses,
  } = useAddressSearch();

  const handleAddressSelect = async ({ id: addressId, address }) => {
    setSelectedRowId(selectedRowId === addressId ? null : addressId);

    const addressObject = { id: addressId, address: address };

    try {
      await AsyncStorage.setItem("address", JSON.stringify(addressObject));

      // Call the callback to notify parent component
      if (onAddressSelected) {
        onAddressSelected(addressObject);
      }

      // Close the modal
      handleClose();

      Toast.show({
        type: "success",
        text1: "Address updated",
        text2: "Your address has been updated successfully.",
      });
    } catch (_error) {
      Toast.show({
        type: "error",
        text1: "Save failed",
        text2: "Couldn't save your address. Please try again.",
      });
    }
  };

  const handleClose = () => {
    // Reset state when closing
    resetState();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
        {/* iOS-style Header */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderBottomWidth: 0.5,
            borderBottomColor: "#c6c6c8",
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}>
            <Text
              style={{
                fontSize: 17,
                color: "#007AFF",
                fontWeight: "400",
              }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#000000",
            }}>
            Change Address
          </Text>

          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
          <View style={{ padding: 16 }}>
            {/* Search Input & Button */}
            <VStack space="lg">
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
                    // Clear addresses when text is cleared (X button clicked)
                    if (text === "") {
                      clearAddresses();
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

            {/* Centered Bin Icon & Text */}
            {addresses.length === 0 && !loading && (
              <View className="items-center pt-16">
                <CollectionBinIcon width={80} height={80} fill="#333" />
                <Text className="mt-4 px-8 text-center text-md text-gray-600">
                  Enter your postcode to find your address
                </Text>
              </View>
            )}

            {/* Loading skeleton for address search */}
            {loading && (
              <View className="pt-6">
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
              <View className="flex-1 pt-6 pb-6">
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
          </View>
        </ScrollView>

        <Toast />
      </SafeAreaView>
    </Modal>
  );
}
