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

async function scheduleNotification(settings, binData) {
  try {
    // Clear any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get next collection dates from binData
    const collectionDates = binData.collections || [];
    if (collectionDates.length === 0) {
      console.log("No collection dates found");
      return;
    }

    const { dayBefore, dayOf, binTypes } = settings;

    for (const collection of collectionDates) {
      // Only schedule notifications for selected bin types
      if (!binTypes[collection.binType.toLowerCase()]) {
        continue;
      }

      const collectionDate = new Date(collection.date);

      // Day before notification
      if (dayBefore.enabled) {
        const dayBeforeDate = new Date(collectionDate);
        dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);
        dayBeforeDate.setHours(new Date(dayBefore.time).getHours());
        dayBeforeDate.setMinutes(new Date(dayBefore.time).getMinutes());

        if (dayBeforeDate > new Date()) {
          // Only schedule future notifications
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Bin Collection Tomorrow",
              body: `Your ${collection.binType} bin will be collected tomorrow. Please put it out before 7am.`,
            },
            trigger: dayBeforeDate,
          });
          console.log(
            `Scheduled day before notification for ${collection.binType} on ${dayBeforeDate}`
          );
        }
      }

      // Day of notification
      if (dayOf.enabled) {
        const dayOfDateObj = new Date(collectionDate);
        dayOfDateObj.setHours(new Date(dayOf.time).getHours());
        dayOfDateObj.setMinutes(new Date(dayOf.time).getMinutes());

        if (dayOfDateObj > new Date()) {
          // Only schedule future notifications
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Bin Collection Today",
              body: `Your ${collection.binType} bin will be collected today. Make sure it's outside!`,
            },
            trigger: dayOfDateObj,
          });
          console.log(
            `Scheduled day of notification for ${collection.binType} on ${dayOfDateObj}`
          );
        }
      }
    }

    // Schedule a test notification for debugging
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: `This is a test notification scheduled right after setup`,
      },
      trigger: new Date(Date.now() + 5 * 1000),
    });

    return true;
  } catch (error) {
    console.error("Scheduling error:", error);
    return false;
  }
}

export default function ManageNotifications() {
  const route = useRoute();
  const navigation = useNavigation();

  // Initialize state with better error handling
  const [binData, setBinData] = useState(() => {
    try {
      return route.params?.data || null;
    } catch (e) {
      console.error("Error accessing route params:", e);
      return null;
    }
  });

  // Notification settings state
  const [dayBeforeEnabled, setDayBeforeEnabled] = useState(true);
  const [dayOfEnabled, setDayOfEnabled] = useState(true);
  const [dayBeforeTime, setDayBeforeTime] = useState(
    new Date().setHours(1, 0, 0, 0)
  );
  const [dayOfTime, setDayOfTime] = useState(new Date().setHours(7, 0, 0, 0));
  const [binTypes, setBinTypes] = useState({
    black: true,
    green: true,
    brown: true,
  });

  // Time picker state
  const [showDayBeforePicker, setShowDayBeforePicker] = useState(false);
  const [showDayOfPicker, setShowDayOfPicker] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Handle automatic updates when settings change
  useEffect(() => {
    if (settingsChanged) {
      updateNotificationSchedules();
      setSettingsChanged(false);
    }
  }, [settingsChanged]);

  useEffect(() => {
    // Configure notification handler when component mounts
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
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
  const toggleBinType = (type) => {
    setBinTypes((prev) => {
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
    setShowDayBeforePicker(true);
    setDayBeforeTime(currentDate.getTime());
    setSettingsChanged(true);
  };

  // Handle day of time change
  const onChangeDayOfTime = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(dayOfTime);
    setShowDayOfPicker(true);
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
    if (!binData) return;

    const settings = {
      dayBefore: {
        enabled: dayBeforeEnabled,
        time: dayBeforeTime,
      },
      dayOf: {
        enabled: dayOfEnabled,
        time: dayOfTime,
      },
      binTypes: binTypes,
    };

    const success = await scheduleNotification(settings, binData);
    if (success) {
      console.log("Notifications updated successfully");
    }
  };

  // Loading state
  if (!binData) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-gray-800 text-lg">
          No bin data available. Please go back and try again.
        </Text>
      </View>
    );
  }

  console.log(showDayBeforePicker);
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />

      <View className="px-4 py-4">
        {/* Day before collection */}
        <View className="bg-white rounded-xl mb-6 overflow-hidden shadow">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-gray-800 text-base">
              Day before collection
            </Text>
            <Switch
              value={dayBeforeEnabled}
              onValueChange={toggleDayBefore}
              trackColor={{ false: "#e0e0e0", true: "#34c759" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
            />
          </View>
          <TouchableOpacity
            className="flex-row justify-between items-center p-4"
            disabled={!dayBeforeEnabled}
            onPress={() => setShowDayBeforePicker(true)}>
            <Text
              className={`text-base ${
                dayBeforeEnabled ? "text-gray-800" : "text-gray-300"
              }`}>
              Time
            </Text>
            <Text
              className={`text-base ${
                dayBeforeEnabled ? "text-gray-800" : "text-gray-300"
              }`}>
              {formatTime(dayBeforeTime)}
            </Text>
          </TouchableOpacity>

          {showDayBeforePicker && (
            <DateTimePicker
              value={new Date(dayBeforeTime)}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onChangeDayBeforeTime}
              disabled={!dayBeforeEnabled}
            />
          )}
        </View>

        {/* Day of collection */}
        {/* <View className="bg-white rounded-xl mb-6 overflow-hidden shadow">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-gray-800 text-base">Day of collection</Text>
            <Switch
              value={dayOfEnabled}
              onValueChange={toggleDayOf}
              trackColor={{ false: "#e0e0e0", true: "#34c759" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
            />
          </View>

          <TouchableOpacity
            className="flex-row justify-between items-center p-4"
            disabled={!dayOfEnabled}
            onPress={() => setShowDayOfPicker(true)}>
            <Text
              className={`text-base ${
                dayOfEnabled ? "text-gray-800" : "text-gray-300"
              }`}>
              Time
            </Text>
            <Text
              className={`text-base ${
                dayOfEnabled ? "text-gray-800" : "text-gray-300"
              }`}>
              {formatTime(dayOfTime)}
            </Text>
          </TouchableOpacity>

          {showDayOfPicker && (
            <DateTimePicker
              value={new Date(dayOfTime)}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onChangeDayOfTime}
              disabled={!dayOfEnabled}
            />
          )}
        </View>

        <Text className="text-gray-500 text-sm mb-6 ml-2">
          Note: Bins should be placed out by 7am.
        </Text>

        <Text className="text-gray-500 text-sm font-medium mb-2 ml-2 uppercase">
          Bin Types
        </Text> */}

        {/* Bin types selection */}
        <View className="bg-white rounded-xl mb-6 overflow-hidden shadow">
          <TouchableOpacity
            className="flex-row justify-between items-center p-4 border-b border-gray-100"
            onPress={() => toggleBinType("black")}>
            <Text className="text-gray-800 text-base">Black</Text>
            {binTypes.black && <Text className="text-blue-500 text-xl">✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row justify-between items-center p-4 border-b border-gray-100"
            onPress={() => toggleBinType("green")}>
            <Text className="text-gray-800 text-base">Green</Text>
            {binTypes.green && <Text className="text-blue-500 text-xl">✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row justify-between items-center p-4"
            onPress={() => toggleBinType("brown")}>
            <Text className="text-gray-800 text-base">Brown</Text>
            {binTypes.brown && <Text className="text-blue-500 text-xl">✓</Text>}
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 text-sm mb-6 ml-2">
          Choose which bin types to receive notifications for.
        </Text>
      </View>
    </SafeAreaView>
  );
}
