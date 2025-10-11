import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Input from "./Input";
import { VStack } from "../../components/ui/vstack";
import BinIcon from "./BinIcon";
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
      <GestureHandlerRootView style={{ flex: 1 }}>
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

          {/* Sticky Search Input */}
          <View
            style={{
              backgroundColor: "#f7f7f7",
              padding: 16,
              // borderBottomWidth: 1,
              // borderBottomColor: "#e5e5e5",
            }}>
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

            {/* Sticky "Select your address" text */}
            {addresses.length > 0 || loading ? (
              <Text className="text-lg font-semibold pt-4 text-gray-800 mt-4">
                Select your address
              </Text>
            ) : null}
          </View>

          {/* Scrollable Content Area */}
          <ScrollView
            style={{ flex: 1, backgroundColor: "#f7f7f7" }}
            bounces={false}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}>
            <View style={{ paddingHorizontal: 16 }}>
              {/* Centered Bin Icon & Text */}
              {addresses.length === 0 && !loading && (
                <View className="items-center pt-16">
                  <BinIcon width={160} height={160} outline={true} />
                  <Text className="px-8 text-center text-lg text-gray-600">
                    Enter your postcode to find your address
                  </Text>
                </View>
              )}

              {/* Loading skeleton for address search */}
              {loading && (
                <View>
                  <View className="bg-white rounded-xl border border-gray-200">
                    {/* Skeleton address items - show more items for full length */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                      <View
                        key={index}
                        className={`px-4 py-4 ${
                          index < 7 ? "border-b border-gray-200" : ""
                        }`}>
                        <View className="bg-gray-200 h-5 w-48 rounded-md mb-2" />
                        <View className="bg-gray-200 h-4 w-32 rounded-md" />
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Address List */}
              {addresses.length > 0 && (
                <View className="pb-6">
                  <View className="bg-white rounded-xl border border-gray-200">
                    <AddressList
                      addresses={addresses}
                      selectedRowId={selectedRowId}
                      onAddressSelect={handleAddressSelect}
                    />
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

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
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}
