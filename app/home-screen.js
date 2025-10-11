import {
  View,
  Text,
  Dimensions,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Carousel from "react-native-reanimated-carousel";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import BinIcon from "./components/BinIcon";
import NotificationsModal from "./components/NotificationsModal";
import AddressSelectionModal from "./components/AddressSelectionModal";
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
import analytics from "./utils/analytics";

const HomeScreen = () => {
  const router = useRouter();

  const [binCollections, setBinCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addressName, setAddressName] = useState("");
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  const fetchBinData = useCallback(
    async (isRefresh = false) => {
      const startTime = Date.now();

      try {
        if (isRefresh) {
          setRefreshing(true);
          analytics.trackAction("refresh_bin_data");
        } else {
          setLoading(true);
          analytics.trackAction("load_bin_data");
        }
        setError(null);

        const storedAddress = await AsyncStorage.getItem("address");
        const parsedAddress = storedAddress ? JSON.parse(storedAddress) : null;

        // Redirect if no address is saved
        if (!parsedAddress?.id) {
          analytics.trackBinCollectionEvent("no_address_saved");
          return router.replace("/address-screen");
        }

        const { id: addressId, address } = parsedAddress;
        setAddressName(address);

        // Fetch fresh data
        const apiStartTime = Date.now();
        const response = await fetch(
          `https://servicelayer3c.azure-api.net/wastecalendar/collection/search/${addressId}/?authority=CCC&numberOfCollections=12`
        );
        const apiDuration = Date.now() - apiStartTime;

        if (!response.ok) {
          analytics.trackApiCall(
            "bin_collection_api",
            "GET",
            response.status,
            apiDuration,
            {
              address_id: addressId,
              error: "api_error",
            }
          );
          throw new Error(
            "Couldn't refresh collection dates. Please check your connection."
          );
        }

        let { collections = [] } = await response.json();

        // Track successful API call
        analytics.trackApiCall(
          "bin_collection_api",
          "GET",
          response.status,
          apiDuration,
          {
            address_id: addressId,
            collections_count: collections.length,
          }
        );

        // Filter out past collections - only show future ones
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        const futureCollections = collections.filter((collection) => {
          const collectionDate = new Date(collection.date);
          collectionDate.setHours(0, 0, 0, 0); // Reset time to start of day
          return collectionDate >= today;
        });

        setBinCollections(futureCollections);

        // Track successful data load
        const totalDuration = Date.now() - startTime;
        analytics.trackPerformance("bin_data_load_time", totalDuration);
        analytics.trackBinCollectionEvent("data_loaded_successfully", {
          collections_count: futureCollections.length,
          address_id: addressId,
          load_time_ms: totalDuration,
        });

        let savedSettings = await AsyncStorage.getItem("settings");
        savedSettings = savedSettings ? JSON.parse(savedSettings) : null;

        // Setup notifications (don't fail if this doesn't work)
        try {
          await setupNotifications();
          await addNotifications(savedSettings, futureCollections);
          analytics.trackNotificationEvent("notifications_setup_success");
        } catch (notificationError) {
          analytics.trackError(notificationError, {
            component: "notification_setup",
            action: "setup_notifications",
          });
          console.warn("Notification setup failed:", notificationError.message);
          Toast.show({
            type: "info",
            text1: "Notifications",
            text2:
              "Couldn't set up notifications. You can try again in settings.",
          });
        }
      } catch (err) {
        setError(err.message || "Something went wrong. Please try again.");

        // Track error
        analytics.trackError(err, {
          component: "home_screen",
          action: isRefresh ? "refresh_bin_data" : "load_bin_data",
          error_type: "data_fetch_error",
        });

        if (!isRefresh) {
          Toast.show({
            type: "error",
            text1: "Failed to load bin data",
            text2: err.message || "Something went wrong. Please try again.",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Refresh failed",
            text2: err.message || "Something went wrong. Please try again.",
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    analytics.trackScreen("home_screen");
    fetchBinData();
  }, [fetchBinData]);

  const { width = 0, height = 0 } = Dimensions.get("window");
  const cardWidth = width;
  const cardHeight = Math.max(height * 0.45, 280);
  const iconSize = Math.max(width * 0.4, 80);

  // Skeleton loading component
  const SkeletonCard = () => (
    <View className="bg-white p-4 rounded-lg mx-6 flex-1 justify-center items-center">
      {/* Skeleton badge */}
      <View className="flex-row justify-start w-full mb-4">
        <View className="bg-gray-200 h-6 w-24 rounded-full" />
      </View>

      {/* Skeleton date */}
      <View className="bg-gray-200 h-6 w-48 rounded mb-10" />

      {/* Skeleton icon */}
      <View className="flex flex-row justify-center items-center">
        <View className="flex-1 justify-center items-center">
          <View
            className="bg-gray-200 rounded-full"
            style={{ width: iconSize, height: iconSize }}
          />
          <View className="bg-gray-200 h-4 w-16 rounded mt-6" />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 p-6">
        {/* Skeleton header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="bg-gray-200 h-8 w-48 rounded" />
          <View className="bg-gray-200 h-10 w-16 rounded" />
        </View>

        {/* Skeleton carousel */}
        <View className="flex-grow justify-center items-center">
          <Carousel
            width={cardWidth}
            data={[1, 2, 3]} // Show 3 skeleton cards
            pagingEnabled={true}
            snapEnabled={true}
            height={cardHeight}
            loop={false}
            renderItem={() => <SkeletonCard />}
          />

          {/* Skeleton pagination dots */}
          <View className="flex-row justify-center mt-8">
            {[1, 2, 3].map((_, index) => (
              <View
                key={index}
                className="h-3 w-3 rounded-full mx-2 bg-gray-200"
              />
            ))}
          </View>
        </View>

        {/* Skeleton button */}
        <View className="pb-12">
          <View className="bg-gray-200 h-12 w-full rounded" />
        </View>
      </View>
    );
  }

  // Error UI - Show when there's an actual error (but not during address updates)
  if (error && !isUpdatingAddress) {
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafb",
          padding: 24,
        }}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 32,
            maxWidth: 320,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}>
          {/* Error Icon */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 50,
                padding: 16,
                marginBottom: 16,
              }}>
              <Ionicons name="warning-outline" size={32} color="#64748b" />
            </View>
            <Text
              style={{
                color: "#111827",
                fontWeight: "bold",
                fontSize: 20,
                textAlign: "center",
                marginBottom: 8,
              }}>
              Something went wrong
            </Text>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}>
              {error &&
              (error.includes("connection") || error.includes("network"))
                ? "Please check your internet connection and try again."
                : error &&
                  (error.includes("address") || error.includes("collection"))
                ? "We couldn't find collection data for your address. Please try selecting a different address."
                : "We couldn't load your bin schedule. Please try again."}
            </Text>
          </View>

          {/* Try Again Button */}
          <Button
            size="lg"
            action="primary"
            onPress={() => {
              setError(null);
              fetchBinData();
            }}>
            <ButtonText>Try Again</ButtonText>
          </Button>
        </View>
      </View>
    );
  }

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
      <View
        className="bg-white p-4 rounded-lg mx-6 my-6 flex-1 justify-center items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
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
                <BinIcon width={iconSize} height={iconSize} fill={color} />
                <Text className="mt-6 text-lg">{binName}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const visibleBinCollections = binCollections.slice(0, 6);

  const handleAddressSelected = async (addressObject) => {
    // Set flag to prevent error UI from showing during address update
    setIsUpdatingAddress(true);

    try {
      // Track address selection
      analytics.trackAddressSelection(
        addressObject.id,
        addressObject.address,
        "modal"
      );

      // Update the address name in the UI
      setAddressName(addressObject.address);

      // Refresh the bin data with the new address (as a background update, not a manual refresh)
      await fetchBinData(false);
    } catch (error) {
      analytics.trackError(error, {
        component: "home_screen",
        action: "address_selection",
        error_type: "address_update_error",
      });
    } finally {
      // Always clear the flag, even if there's an error
      setIsUpdatingAddress(false);
    }
  };

  return (
    <View className="flex-1">
      {/* Header - Fixed at top */}
      <View className="p-6 pb-4">
        <View className="flex-row justify-between items-center">
          <Heading size="2xl" className="flex-1 flex-wrap">
            {addressName}
          </Heading>
          <Button
            size="md"
            variant="outline"
            action="primary"
            onPress={() => {
              analytics.trackAction("open_address_modal");
              setAddressModalVisible(true);
            }}>
            <ButtonText>Edit</ButtonText>
          </Button>
        </View>
      </View>

      {/* Centered Carousel Area */}
      <View className="flex-1 justify-center items-center">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingVertical: 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBinData(true)}
              tintColor="#007AFF"
            />
          }>
          <View className="justify-center items-center">
            <Carousel
              width={cardWidth}
              data={visibleBinCollections}
              pagingEnabled={true}
              snapEnabled={true}
              height={cardHeight}
              loop={false}
              onProgressChange={(_, index) => {
                const newIndex = Math.round(index);
                if (newIndex !== activeIndex) {
                  analytics.trackAction("carousel_swipe", {
                    from_index: activeIndex,
                    to_index: newIndex,
                    collection_date: visibleBinCollections[newIndex]?.date,
                  });
                }
                setActiveIndex(newIndex);
              }}
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
        </ScrollView>
      </View>

      {/* Button at the bottom */}
      <View className="pb-20 px-6">
        <Button
          size="xl"
          onPress={() => {
            analytics.trackAction("open_notifications_modal");
            setNotificationsModalVisible(true);
          }}>
          <ButtonText>Manage Notifications</ButtonText>
        </Button>
      </View>

      <Toast />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        binCollections={binCollections}
      />

      {/* Address Selection Modal */}
      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onAddressSelected={handleAddressSelected}
      />
    </View>
  );
};

export default HomeScreen;
