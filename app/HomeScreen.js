import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import { useEffect, useState, navigation } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import CollectionBinIcon from "./components/CollectionBinIcon";
import { capitalize } from "lodash";
import { getDateWithSuffix, getBinName, getBinColour } from "./utils/HelperFunctions"; // Importing the function

const BinCollectionScreen = () => {
  const router = useRouter(); // Initialize router
  const navigation = useNavigation();

  const [binCollections, setBinCollections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addressName, setAddressName] = useState("");

  useEffect(() => {
    const fetchBinData = async () => {
      try {
        // Load stored address ID
        const storedAddress = await AsyncStorage.getItem("address");

        // Redirect if no address is saved
        if (!storedAddress) return router.replace("/AddressScreen");

        const { id: addressId, address } = JSON.parse(storedAddress);

        setAddressName(address);

        // Fetch fresh data
        const response = await fetch(
          `https://servicelayer3c.azure-api.net/wastecalendar/collection/search/${addressId}/?authority=CCC&numberOfCollections=12`
        );

        let { collections = [] } = await response.json();

        setBinCollections(collections);
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

  const { width = 0, height = 0 } = Dimensions.get("window");

  const cardWidth = width;
  const cardHeight = Math.max(height * 0.45, 280);
  const iconSize = Math.max(width * 0.4, 80);

  const displayCard = ({ item, index }) => {
    const { date, roundTypes } = item;

    const dateObject = new Date(date);
    const day = dateObject.getDate();
    const dateWithSuffix = getDateWithSuffix(dateObject);

    const formattedDate = dateObject
      .toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      .replace(day, dateWithSuffix);

    return (
      <View className="bg-white p-4 rounded-lg mx-6 flex-1 justify-center items-center">
        {/* Badge above the date */}
        {index === 0 && (
          <View className="flex-row justify-start w-full mb-4">
            <Badge
              className="flex-row items-center"
              size="lg"
              variant="outline"
              action="muted">
              {/* <Icon name="calendar" className="mr-2" />{" "} */}
              {/* Replace with relevant icon */}
              <BadgeText>Next Collection</BadgeText>
            </Badge>
          </View>
        )}

        {/* Date */}
        <Text className="text-lg mb-10 font-semibold text-left w-full">
          {formattedDate}
        </Text>

        {/* Icon */}
        <View className="flex flex-row justify-center items-center">
          {roundTypes.map((roundType) => {
            const color = getBinColour(roundType);
            const binName = getBinName(roundType);

            return (
              <View
                className="flex-1 justify-center items-center"
                key={roundType}>
                <CollectionBinIcon
                  width={iconSize}
                  height={iconSize}
                  fill={color}
                />
                <Text className="mt-6 text-lg">{binName}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const visibleBinCollections = binCollections.slice(0, 6);

  return (
    <View className="flex-1 p-6">
      <View className="flex-row justify-between items-center mb-4">
        <Heading size="2xl" className="flex-1 flex-wrap">
          {addressName}
        </Heading>
        <Button
          size="md"
          variant="outline"
          action="primary"
          onPress={() => router.push("/AddressScreen")}>
          <ButtonText>Edit</ButtonText>
        </Button>
      </View>

      <View className="flex-grow justify-center items-center">
        {/* <Text className="text-xl mb-6 text-left w-full">
          Upcoming Bin Collections
        </Text> */}
        <Carousel
          width={cardWidth}
          data={visibleBinCollections}
          pagingEnabled={true}
          snapEnabled={true}
          height={cardHeight}
          loop={false}
          onProgressChange={(_, index) => setActiveIndex(Math.round(index))}
          renderItem={displayCard}
        />

        {/* Pagination dots */}
        <View className="flex-row justify-center mt-8">
          {visibleBinCollections.map((_, index) => (
            <View
              key={index}
              className={`h-3 w-3 rounded-full mx-2 ${
                activeIndex === index ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </View>
      </View>

      {/* Button at the bottom */}
      <View className="pb-12">
        <Button
          size="xl"
          onPress={() => {
            navigation.navigate("NotificationsScreen", {
              data: binCollections,
            });
          }}>
          <ButtonText>Manage Notifications</ButtonText>
        </Button>
      </View>
    </View>
  );
};

export default BinCollectionScreen;
