import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import { Button, ButtonText } from "@/components/ui/button";
import CollectionBinIcon from "./Components/CollectionBinIcon";
import { capitalize } from "lodash";

const BinCollectionScreen = () => {
  const router = useRouter(); // Initialize router
  const navigation = useNavigation(); // Use navigation for dynamic title

  const [binData, setBinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addressName, setAddressName] = useState("");

  const goToAddressScreen = () => router.replace("/AddressScreen");

  useEffect(() => {
    const fetchBinData = async () => {
      try {
        // Load stored address ID
        const storedAddress = await AsyncStorage.getItem("address");

        // Redirect if no address is saved
        if (!storedAddress) return goToAddressScreen();

        const { id: addressId, address } = JSON.parse(storedAddress);

        // Update screen title dynamically
        navigation.setOptions({ title: address });

        setAddressName(address);

        // Fetch fresh data
        const response = await fetch(
          `https://servicelayer3c.azure-api.net/wastecalendar/collection/search/${addressId}/?authority=CCC&numberOfCollections=12`
        );

        let { collections = [] } = await response.json();

        collections = collections.slice(0, 6);

        // Set first 6 collections to binData
        setBinData(collections);
      } catch (err) {
        setError(`Failed to fetch bin collection data... ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBinData();
  }, []);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  const { width } = Dimensions.get("window");

  const itemHeight = 350;

  const displayCard = ({ item }) => {
    const { date, roundTypes } = item;

    const formattedDate = new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

    const binColours = {
      DOMESTIC: "black",
      ORGANIC: "green",
      RECYCLE: "blue",
    };

    return (
      <View className="bg-white p-4 rounded-lg mx-8 flex-1 justify-center items-center">
        {/* date */}
        <Text className="text-lg font-semibold mb-8">{formattedDate}</Text>

        {/* Icon */}
        <View className="flex flex-row justify-center items-center">
          {roundTypes.map((type) => {
            const color = binColours[type];
            const typeTitle = capitalize(type);
            return (
              <View className="flex-1 justify-center items-center" key={type}>
                <CollectionBinIcon width={150} height={150} fill={color} />
                <Text className="mt-4">{typeTitle}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 p-6">
      <Button size="xl" onPress={goToAddressScreen}>
        <ButtonText className="text-typography-0">Edit Address</ButtonText>
      </Button>
      {/* <View className="justify-start">
        <Text className="text-lg ">Expected collections for {addressName}</Text>
      </View> */}

      <View className="flex-grow justify-center items-center">
        <Carousel
          width={width}
          data={binData}
          pagingEnabled={true}
          snapEnabled={true}
          height={itemHeight}
          onProgressChange={(_, index) => setActiveIndex(Math.round(index))}
          renderItem={displayCard}
        />

        {/* Pagination dots */}
        <View className="flex-row justify-center mt-4">
          {binData.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 rounded-full mx-1 ${
                activeIndex === index ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </View>
      </View>

      {/* Button at the bottom */}
      <View className="pb-12">
        <Button size="xl" onPress={() => router.push("/ManageNotifications")}>
          <ButtonText className="text-typography-0">
            Manage Notifications
          </ButtonText>
        </Button>
      </View>
    </View>
  );
};

export default BinCollectionScreen;
