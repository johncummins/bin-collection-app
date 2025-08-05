import { useState, useCallback } from "react";
import { View, Pressable, Text, ScrollView, Keyboard } from "react-native";
import Input from "./components/Input";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Table, TableBody, TableRow, TableData } from "@/components/ui/table";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { capitalize, throttle } from "lodash";
import CollectionBinIcon from "./components/CollectionBinIcon";

export default function PostcodeScreen() {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const router = useRouter();

  const fetchAddresses = async () => {
    if (!postcode.trim()) return;

    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

    // Validate postcode
    if (!postcodeRegex.test(postcode.trim())) {
      setError("Please enter a valid UK postcode.");
      setAddresses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://servicelayer3c.azure-api.net/wastecalendar/address/search?postcode=${encodeURIComponent(
          postcode
        )}`
      );

      if (!response.ok) throw new Error("Failed to fetch addresses");

      const data = await response.json();

      if (!data.length || data[0].id < 0) {
        setError("No addresses found for this postcode");
        setAddresses([]);
        setLoading(false);
        return;
      }

      setAddresses(data);
    } catch (err) {
      setError("Invalid postcode or postcode does not exist");
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

      router.replace("/HomeScreen");
    } catch (error) {
      console.log("Error saving address ID:", error);
    }
  };

  const tableRows = addresses.map(
    ({ houseNumber, street, town, postCode, id }) => {
      const address = `${capitalize(houseNumber)} ${capitalize(street)}`;
      return (
        <Pressable
          key={id}
          onPress={() => handleRowClick({ id, address })}
          className={`border-outline-200 ${
            selectedRowId === id ? "bg-gray-100" : "bg-background-0"
          }`}>
          <TableRow>
            <TableData>
              <View className="w-full">
                <Text>{address}</Text>
                <Text className="text-gray-500 mt-2">
                  {capitalize(town)}, {postCode}
                </Text>
              </View>
            </TableData>
          </TableRow>
        </Pressable>
      );
    }
  );

  return (
    <View className="flex-1">
      {/* Search Input & Button */}
      <View className="pt-6 px-6">
        <VStack space="xl">
          <Input
            placeholder="Enter your postcode..."
            value={postcode}
            onChangeText={(text) => setPostcode(text)}
            onSubmitEditing={throttledFetchAddresses}
          />
          <Button
            size="lg"
            onPress={() => {
              throttledFetchAddresses();
              Keyboard.dismiss();
            }}
            disabled={loading}>
            <ButtonText>
              {loading ? "Finding Your Address..." : "Find My Address"}
            </ButtonText>
          </Button>
          {error && <Text className="text-red-500 mt-2">{error}</Text>}
        </VStack>
      </View>

      {/* Centered Bin Icon & Text */}
      {addresses.length === 0 && (
        <View className="flex-1 items-center pt-32">
          <CollectionBinIcon width={100} height={100} fill="#333" />
          <Text className="mt-6 px-28 text-center text-md">
            Enter your postcode to find your address
          </Text>
        </View>
      )}

      {/* Address List */}
      {addresses.length > 0 && (
        <View className="flex-1 px-6 pt-6">
          <Text className="text-lg font-semibold pb-2">
            Select your address
          </Text>
          <ScrollView className="flex-1">
            <Table>
              <TableBody>{tableRows}</TableBody>
            </Table>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
