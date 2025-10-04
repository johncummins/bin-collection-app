import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import CollectionBinIcon from "./components/CollectionBinIcon";
import Toast from "react-native-toast-message";
import {
  getDateWithSuffix,
  getBinName,
  getBinColour,
} from "./utils/HelperFunctions";
import {
  addNotifications,
  setupNotifications,
} from "./utils/NotificationHelperFunctions";

const HomeScreen = () => {
  const router = useRouter(); // Initialize router
  const navigation = useNavigation();

  const [binCollections, setBinCollections] = useState([]);
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
        if (!storedAddress) {
          return router.replace("/address-screen");
        }

        const { id: addressId, address } = JSON.parse(storedAddress);
        setAddressName(address);

        // Fetch fresh data
        const response = await fetch(
          `https://servicelayer3c.azure-api.net/wastecalendar/collection/search/${addressId}/?authority=CCC&numberOfCollections=12`
        );

        if (!response.ok) {
          throw new Error(
            "Couldn't refresh collection dates. Please check your connection."
          );
        }

        let { collections = [] } = await response.json();

        // Filter out past collections - only show future ones
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        const futureCollections = collections.filter((collection) => {
          const collectionDate = new Date(collection.date);
          collectionDate.setHours(0, 0, 0, 0); // Reset time to start of day
          return collectionDate >= today;
        });

        setBinCollections(futureCollections);

        let savedSettings = await AsyncStorage.getItem("settings");
        savedSettings = savedSettings ? JSON.parse(savedSettings) : null;

        // Setup notifications (don't fail if this doesn't work)
        try {
          await setupNotifications();
          await addNotifications(savedSettings, futureCollections);
        } catch (notificationError) {
          console.warn("Notification setup failed:", notificationError.message);
          Toast.show({
            type: "info",
            text1: "Notifications",
            text2:
              "Couldn't set up notifications. You can try again in settings.",
          });
        }
      } catch (err) {
        Alert.alert(
          "Failed to load bin data",
          err.message || "Something went wrong. Please try again.",
          [
            { text: "OK", style: "default" },
            {
              text: "Retry",
              style: "default",
              onPress: () => fetchBinData(),
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBinData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-0">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-typography-600">
          Loading bin collection data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background-0 p-6">
        <View className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-sm">
          <Text className="text-red-800 font-semibold text-lg mb-2">
            Unable to load data
          </Text>
          <Text className="text-red-700 text-sm mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-primary-600 rounded-lg py-3 px-4"
            onPress={() => {
              setError(null);
              setLoading(true);
              // Trigger a re-fetch by updating a dependency
              window.location.reload?.() || router.replace("/home-screen");
            }}>
            <Text className="text-white font-semibold text-center">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          onPress={() => router.push("/address-screen")}>
          <ButtonText>Edit</ButtonText>
        </Button>
      </View>

      <View className="flex-grow justify-center items-center">
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
            navigation.navigate("notifications-screen", {
              data: binCollections,
            });
          }}>
          <ButtonText>Manage Notifications</ButtonText>
        </Button>
      </View>

      <Toast />
    </View>
  );
};

export default HomeScreen;
