import { View, Text, Pressable } from "react-native";
import { capitalize } from "lodash";

export default function AddressList({
  addresses,
  selectedRowId,
  onAddressSelect,
}) {
  const tableRows = addresses.map(
    ({ houseNumber, street, town, postCode, id }, index) => {
      const address = `${capitalize(houseNumber)} ${capitalize(street)}`;
      return (
        <Pressable
          key={id}
          onPress={() => onAddressSelect({ id, address })}
          className={`${selectedRowId === id ? "bg-blue-50" : "bg-white"} ${
            index < addresses.length - 1 ? "border-b border-gray-200" : ""
          } rounded-lg`}>
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

  return tableRows;
}
