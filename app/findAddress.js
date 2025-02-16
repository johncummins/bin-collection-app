import { useState } from "react";
import { View, Pressable, Text, ScrollView } from "react-native";
import Input from "./Components/Input";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Table, TableBody, TableRow, TableData } from "@/components/ui/table";

import _ from "lodash";

export default function PostcodeScreen() {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const fetchAddresses = async () => {
    if (!postcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // const response = await fetch(
      //   `https://servicelayer3c.azure-api.net/wastecalendar/address/search?postcode=${encodeURIComponent(
      //     postcode
      //   )}`
      // );

      // if (!response.ok) throw new Error("Failed to fetch addresses");

      // const data = await response.json();

      // console.log(data);

      const tempData = [
        {
          houseNumber: "77",
          id: "10002568378",
          postCode: "CB13EE",
          street: "CROMWELL ROAD ROAD ROAD ROAD ROAD ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "79",
          id: "10002568379",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "81",
          id: "10002568380",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "83",
          id: "10002568381",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "83A",
          id: "10002568382",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "83B",
          id: "10002568383",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "87",
          id: "10002565529",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "89",
          id: "10023617458",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "91",
          id: "10023617459",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "127",
          id: "10090967531",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "129",
          id: "10090967532",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "131",
          id: "10090967533",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "133",
          id: "10090967534",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "135",
          id: "10090967535",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "137",
          id: "10090967536",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "139",
          id: "10090967537",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "141",
          id: "10090967538",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "143",
          id: "10090967539",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "145",
          id: "10090967540",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
        {
          houseNumber: "147",
          id: "10090967541",
          postCode: "CB13EE",
          street: "CROMWELL ROAD",
          town: "CAMBRIDGE",
        },
      ];

      setAddresses(tempData);
    } catch (err) {
      setError("Invalid postcode or postcode does not exist");
      setAddresses([]);
    }

    setLoading(false);
  };

  const handleRowClick = (id) => {
    setSelectedRowId(selectedRowId === id ? null : id);

    console.log(id);
  };

  return (
    <View className="flex-1 justify-start">
      <View className="pt-6 pl-6 pr-6">
        <VStack space="md">
          <Input
            placeholder="Search Postcode..."
            value={postcode}
            onChangeText={setPostcode}
            onSubmitEditing={fetchAddresses}
          />
          {/* <Button size="lg" onPress={fetchAddresses} disabled={loading}>
            <ButtonText className="text-typography-0">
              {loading ? "Searching..." : "Search"}
            </ButtonText>
          </Button> */}

          {error && <Text className="text-red-500 mt-2">{error}</Text>}
        </VStack>
      </View>

      {addresses.length > 0 && (
        <View className="flex-1 pl-6 pr-6 pt-6">
          <Text className="text-lg font-semibold pb-2">
            Select your address
          </Text>
          <ScrollView className="flex-1">
            <Table>
              <TableBody>
                {addresses.map(
                  ({ houseNumber, street, town, postCode, id }) => (
                    <Pressable
                      key={id}
                      onPress={() => handleRowClick(id)}
                      className={` border-outline-200 ${
                        selectedRowId === id ? "bg-gray-100" : "bg-background-0"
                      }`}>
                      <TableRow>
                        <TableData>
                          <View className="w-full">
                            <Text>
                              {_.capitalize(houseNumber)} {_.capitalize(street)}
                            </Text>
                            <Text className="text-gray-500 mt-2">
                              {_.capitalize(town)}, {postCode}
                            </Text>
                          </View>
                        </TableData>
                      </TableRow>
                    </Pressable>
                  )
                )}
              </TableBody>
            </Table>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
