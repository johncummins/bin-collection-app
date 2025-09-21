import { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import {
  DEFAULT_SETTINGS,
  addNotifications,
  setupNotifications,
} from "./utils/NotificationHelperFunctions";

export default function NotificationsScreen() {
  const route = useRoute();
  const [binCollections] = useState(route.params?.data ?? null);
  const [settingsChanged, setSettingsChanged] = useState(false);

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

  // Immediately call an async function
  useEffect(() => {
    init();
  }, []);

  // Configure notification handler
  const init = async () => {
    setupNotifications();

    let savedSettings = await AsyncStorage.getItem("settings");

    savedSettings = savedSettings ? JSON.parse(savedSettings) : null;

    setupInitialSettingsState(savedSettings);
  };

  const setupInitialSettingsState = (settings) => {
    // Day before settings
    setDayBeforeEnabled(
      settings?.dayBefore?.enabled ?? DEFAULT_SETTINGS.dayBefore.enabled
    );
    setDayBeforeTime(
      settings?.dayBefore?.time ?? DEFAULT_SETTINGS.dayBefore.time
    );

    // Day of settings
    setDayOfEnabled(settings?.dayOf?.enabled ?? DEFAULT_SETTINGS.dayOf.enabled);
    setDayOfTime(settings?.dayOf?.time ?? DEFAULT_SETTINGS.dayOf.time);

    // Round types settings
    setRoundTypes(settings?.roundTypes ?? DEFAULT_SETTINGS.roundTypes);
  };

  // Handle automatic updates when settings change
  useEffect(() => {
    if (settingsChanged) handleNewSettings();
  }, [settingsChanged]);

  const handleNewSettings = async () => {
    const settings = {
      dayBefore: { enabled: dayBeforeEnabled, time: dayBeforeTime },
      dayOf: { enabled: dayOfEnabled, time: dayOfTime },
      roundTypes,
    };

    // Save settings to AsyncStorage
    await AsyncStorage.setItem("settings", JSON.stringify(settings));

    // Add notifications based on the new settings
    await addNotifications(settings, binCollections);

    setSettingsChanged(false);
  };

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

  const onChangeDayBeforeTime = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(dayBeforeTime);
    setDayBeforeTime(currentDate.getTime());
    setSettingsChanged(true);
  };

  const onChangeDayOfTime = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(dayOfTime);
    setDayOfTime(currentDate.getTime());
    setSettingsChanged(true);
  };

  const toggleDayBefore = (value) => {
    setDayBeforeEnabled(value);
    setSettingsChanged(true);
  };

  const toggleDayOf = (value) => {
    setDayOfEnabled(value);
    setSettingsChanged(true);
  };

  // Loading state
  if (!binCollections) {
    return (
      <View className="flex-1 items-center justify-center bg-background-0 p-6">
        <Text className="text-typography-600 text-lg text-center">
          No bin data available. Please go back and try again.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <StatusBar barStyle="dark-content" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <Heading size="2xl" className="mb-6 text-typography-900">
            Notification Settings
          </Heading>
          {/* Day before collection */}
          <View className="bg-background-0 rounded-lg shadow-soft-1 mb-6 ">
            <View className="flex-row justify-between items-center p-4 border-b border-outline-200">
              <View className="flex-1">
                <Text className="text-typography-800 font-medium text-lg">
                  Day before collection
                </Text>
                <Text className="text-typography-500 text-sm mt-1">
                  Get reminded the day before your bins are collected
                </Text>
              </View>
              <Switch
                value={dayBeforeEnabled}
                onValueChange={toggleDayBefore}
                trackColor={{ false: "#e0e0e0", true: "#34c759" }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e0e0e0"
              />
            </View>
            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-3"
              disabled={!dayBeforeEnabled}>
              <Text
                className={`text-lg ${
                  dayBeforeEnabled
                    ? "text-typography-700 font-medium"
                    : "text-typography-400"
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
          <View className="bg-background-0 rounded-lg shadow-soft-1 mb-6 ">
            <View className="flex-row justify-between items-center p-4 border-b border-outline-200">
              <View className="flex-1">
                <Text className="text-typography-800 font-medium text-lg">
                  Day of collection
                </Text>
                <Text className="text-typography-500 text-sm mt-1">
                  Get reminded on the day your bins are collected
                </Text>
              </View>
              <Switch
                value={dayOfEnabled}
                onValueChange={toggleDayOf}
                trackColor={{ false: "#e0e0e0", true: "#34c759" }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e0e0e0"
              />
            </View>

            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-3"
              disabled={!dayOfEnabled}>
              <Text
                className={`text-lg ${
                  dayOfEnabled
                    ? "text-typography-700 font-medium"
                    : "text-typography-400"
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
          <View className="bg-background-0 rounded-lg shadow-soft-1 mb-4 ">
            <View className="p-4 border-b border-outline-200">
              <Text className="text-typography-800 font-medium text-lg">
                Bin Types
              </Text>
              <Text className="text-typography-500 text-sm mt-1">
                Select which bin types you want to receive notifications for
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row justify-between items-center border-b border-outline-200"
              onPress={() => toggleRoundType("domestic")}>
              <Text className="text-typography-700 font-medium text-lg p-4">
                Black (general waste)
              </Text>
              {roundTypes.domestic && (
                <Text className="text-primary-500 text-2xl pr-4">✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row justify-between items-center border-b border-outline-200"
              onPress={() => toggleRoundType("organic")}>
              <Text className="text-typography-700 font-medium text-lg p-4">
                Green (food waste)
              </Text>
              {roundTypes.organic && (
                <Text className="text-primary-500 text-2xl pr-4">✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row justify-between items-center"
              onPress={() => toggleRoundType("recycle")}>
              <Text className="text-typography-700 font-medium text-lg p-4">
                Blue (recyclables)
              </Text>
              {roundTypes.recycle && (
                <Text className="text-primary-500 text-2xl pr-4">✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
