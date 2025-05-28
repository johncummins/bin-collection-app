import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import * as Device from "expo-device";
import { useRoute, useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getBinColour } from "./HelperFunctions"; // Importing the function

let FURTHEST_DATE = null;

async function addNotifications(settings, binCollections = []) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Reset furthest date
    FURTHEST_DATE = null;

    if (binCollections.length === 0) return console.log("No collection dates");

    const { dayBefore, dayOf, roundTypes: selectedRoundTypes = {} } = settings;

    // End here if both notifications are turned offf
    if (!dayBefore.enabled && !dayOf.enabled) return;

    for (const collection of binCollections) {
      const { date, roundTypes } = collection || {};
      const collectionDate = new Date(date);

      // Filter to only the round types the user has selected
      const collectionTypes = roundTypes.filter(
        (type) => selectedRoundTypes[type.toLowerCase()]
      );

      // If none of the user's selected round types are present, skip
      if (collectionTypes.length === 0) continue;

      // Day before notification
      await addNotification({
        offsetDays: 1,
        config: dayBefore,
        collectionDate,
        collectionTypes,
      });

      // Day of notification
      await addNotification({
        offsetDays: 0,
        config: dayOf,
        collectionDate,
        collectionTypes,
      });
    }

    if (FURTHEST_DATE === null) return;

    const notificationRefreshDate = new Date(FURTHEST_DATE);
    notificationRefreshDate.setDate(notificationRefreshDate.getDate() + 1);

    // Refresh notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to refresh your bin schedule",
        body: "Your bin collection dates may have changed. Please open the app to get the latest updates.",
      },
      trigger: { type: "date", date: notificationRefreshDate },
    });

    return true;
  } catch (error) {
    console.error("Scheduling error:", error);
    return false;
  }
}

async function addNotification({
  offsetDays = 0,
  config,
  collectionDate,
  collectionTypes,
}) {
  if (!config?.enabled) return;

  const triggerDate = new Date(collectionDate);
  triggerDate.setDate(triggerDate.getDate() - offsetDays);

  const time = new Date(config.time);
  triggerDate.setHours(time.getHours());
  triggerDate.setMinutes(time.getMinutes());

  // Save the furthest date in the future
  if (!FURTHEST_DATE || triggerDate > FURTHEST_DATE) {
    FURTHEST_DATE = triggerDate;
  }

  if (triggerDate < new Date()) return;

  // Convert collection types to just be colours and join
  const typeList = collectionTypes
    .map((type) => getBinColour(type))
    .join(" and ");
  const plural = collectionTypes.length > 1 ? "bins" : "bin";

  const title =
    offsetDays === 0 ? "Bin Collection Today" : "Bin Collection Tomorrow";

  const message =
    offsetDays === 0
      ? `Your ${typeList} ${plural} will be collected today. Make sure ${
          collectionTypes.length > 1 ? "they're" : "it's"
        } outside!`
      : `Your ${typeList} ${plural} will be collected tomorrow. Please put ${
          collectionTypes.length > 1 ? "them" : "it"
        } out before 7am.`;

  await Notifications.scheduleNotificationAsync({
    content: { title, body: message },
    trigger: { type: "date", date: triggerDate },
  });
}

export default function ManageNotifications() {
  const route = useRoute();

  const [binCollections, setBinCollections] = useState(
    route.params?.data ?? null
  );

  // Notification settings state
  const [dayBeforeEnabled, setDayBeforeEnabled] = useState(true);
  const [dayOfEnabled, setDayOfEnabled] = useState(true);
  const [dayBeforeTime, setDayBeforeTime] = useState(
    new Date().setHours(21, 0, 0, 0)
  );
  const [dayOfTime, setDayOfTime] = useState(new Date().setHours(7, 0, 0, 0));
  const [roundTypes, setRoundTypes] = useState({
    domestic: true,
    recycle: true,
    organic: true,
  });

  // Time picker state
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Handle automatic updates when settings change
  useEffect(() => {
    if (settingsChanged) {
      updateNotificationSchedules();
      setSettingsChanged(false);
    }
  }, [settingsChanged]);

  // Configure notification handler when component mounts
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true, // shows a banner when app is in foreground
        shouldShowList: true, // adds notification to notification centre
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    // Request permission for notifications
    const requestNotificationPermissions = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === "granted";
      }
      return false;
    };

    requestNotificationPermissions();

    // Initial notification setup
    updateNotificationSchedules();
  }, []);

  // Format time for display
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Toggle bin type selection
  const toggleRoundType = (type) => {
    setRoundTypes((prev) => {
      const newState = {
        ...prev,
        [type]: !prev[type],
      };
      setSettingsChanged(true);
      return newState;
    });
  };

  // Handle day before time change
  const onChangeDayBeforeTime = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(dayBeforeTime);
    setDayBeforeTime(currentDate.getTime());
    setSettingsChanged(true);
  };

  // Handle day of time change
  const onChangeDayOfTime = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(dayOfTime);
    setDayOfTime(currentDate.getTime());
    setSettingsChanged(true);
  };

  // Toggle day before notifications
  const toggleDayBefore = (value) => {
    setDayBeforeEnabled(value);
    setSettingsChanged(true);
  };

  // Toggle day of notifications
  const toggleDayOf = (value) => {
    setDayOfEnabled(value);
    setSettingsChanged(true);
  };

  // Update notification schedules
  const updateNotificationSchedules = async () => {
    if (!binCollections) return;

    const settings = {
      dayBefore: { enabled: dayBeforeEnabled, time: dayBeforeTime },
      dayOf: { enabled: dayOfEnabled, time: dayOfTime },
      roundTypes,
    };

    const success = await addNotifications(settings, binCollections);
    if (success) {
      console.log("Notifications updated successfully");
    }

    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    // console.log("Currently scheduled notifications:", notifications);
    console.log(notifications.length);
  };

  // Loading state
  if (!binCollections) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-gray-00 text-lg">
          No bin data available. Please go back and try again.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />

      <View className="px-4 py-4">
        {/* Day before collection */}
        <View className="bg-white rounded-xl mb-6 overflow-hidden shadow">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-gray-800 font-medium text-lg">Day before collection</Text>
            <Switch
              value={dayBeforeEnabled}
              onValueChange={toggleDayBefore}
              trackColor={{ false: "#e0e0e0", true: "#34c759" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
            />
          </View>
          <TouchableOpacity
            className="flex-row justify-between items-center px-4 py-2"
            disabled={!dayBeforeEnabled}>
            <Text
              className={`text-lg ${
                dayBeforeEnabled ? "text-gray-800 font-medium" : "text-gray-300"
              }`}>
              Time
            </Text>
            <DateTimePicker
              value={new Date(dayBeforeTime)}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onChangeDayBeforeTime}
              disabled={!dayBeforeEnabled}
            />
          </TouchableOpacity>
        </View>

        {/* Day of collection */}
        <View className="bg-white rounded-xl mb-6 overflow-hidden shadow">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-gray-800 font-medium text-lg">Day of collection</Text>
            <Switch
              value={dayOfEnabled}
              onValueChange={toggleDayOf}
              trackColor={{ false: "#e0e0e0", true: "#34c759" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
            />
          </View>

          <TouchableOpacity
            className="flex-row justify-between items-center px-4 py-2"
            disabled={!dayOfEnabled}>
            <Text
              className={`text-lg ${
                dayOfEnabled ? "text-gray-800 font-medium" : "text-gray-300"
              }`}>
              Time
            </Text>
            <DateTimePicker
              value={new Date(dayOfTime)}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onChangeDayOfTime}
              disabled={!dayOfEnabled}
            />
          </TouchableOpacity>
        </View>

        {/* <Text className="text-gray-500 text-sm mb-6 ml-2">
          Note: Bins should be placed out by 7am
        </Text> */}

        {/* <Text className="text-gray-500 text-sm font-medium mb-2 ml-2">
          Bin Types
        </Text> */}

        {/* Bin types selection */}
        <View className="bg-white rounded-xl mb-2 overflow-hidden shadow">
          <TouchableOpacity
            className="flex-row justify-between items-center border-b border-gray-100"
            onPress={() => toggleRoundType("domestic")}>
            <Text className="text-gray-800 font-medium text-lg p-4">
              Black (general waste)
            </Text>
            {roundTypes.domestic && (
              <Text className="text-blue-500 text-2xl pr-4">✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row justify-between items-center border-b border-gray-100"
            onPress={() => toggleRoundType("organic")}>
            <Text className="text-gray-800 font-medium text-lg p-4">
              Green (food waste)
            </Text>
            {roundTypes.organic && (
              <Text className="text-blue-500 text-2xl pr-4">✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row justify-between items-center"
            onPress={() => toggleRoundType("recycle")}>
            <Text className="text-gray-800 font-medium text-lg p-4">
              Blue (recyclables)
            </Text>
            {roundTypes.recycle && (
              <Text className="text-blue-500 text-2xl pr-4">✓</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 text-sm mb-6 ml-2">
          Choose which bin types to receive notifications for
        </Text>
      </View>
    </SafeAreaView>
  );
}
