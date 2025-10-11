import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_SETTINGS,
  addNotifications,
  setupNotifications,
} from "../utils/NotificationHelperFunctions";

export default function NotificationsModal({
  visible,
  onClose,
  binCollections,
}) {
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
    if (visible) {
      init();
    }
  }, [visible, init]);

  // Configure notification handler
  const init = useCallback(async () => {
    try {
      await setupNotifications();

      let savedSettings = await AsyncStorage.getItem("settings");
      savedSettings = savedSettings ? JSON.parse(savedSettings) : null;
      setupInitialSettingsState(savedSettings);
    } catch (_error) {
      // Silent error handling - no user feedback needed
    }
  }, []);

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
  }, [settingsChanged, handleNewSettings]);

  const handleNewSettings = useCallback(async () => {
    try {
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
    } catch (_error) {
      // Silent error handling - no user feedback needed
    }
  }, [
    dayBeforeEnabled,
    dayBeforeTime,
    dayOfEnabled,
    dayOfTime,
    roundTypes,
    binCollections,
  ]);

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

  const handleClose = () => {
    setSettingsChanged(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
        {/* iOS-style Header */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderBottomWidth: 0.5,
            borderBottomColor: "#c6c6c8",
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}>
            <Text
              style={{
                fontSize: 17,
                color: "#007AFF",
                fontWeight: "400",
              }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#000000",
            }}>
            Notifications
          </Text>

          <TouchableOpacity
            onPress={handleClose}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}>
            <Text
              style={{
                fontSize: 17,
                color: "#007AFF",
                fontWeight: "600",
              }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
          <View style={{ padding: 16 }}>
            {/* Day before collection */}
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 10,
                marginBottom: 16,
                overflow: "hidden",
                borderColor: "#E5E7EB",
                borderWidth: 1,
              }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#c6c6c8",
                }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "500",
                      color: "#000000",
                      marginBottom: 2,
                    }}>
                    Day before collection
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#8e8e93",
                      marginTop: 2,
                    }}>
                    Get reminded the evening before your bins are collected
                  </Text>
                </View>
                <Switch
                  value={dayBeforeEnabled}
                  onValueChange={toggleDayBefore}
                  trackColor={{ false: "#e0e0e0", true: "#34c759" }}
                  thumbColor={dayBeforeEnabled ? "#ffffff" : "#f4f3f4"}
                  ios_backgroundColor="#e0e0e0"
                />
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  opacity: dayBeforeEnabled ? 1 : 0.5,
                }}
                disabled={!dayBeforeEnabled}>
                <Text
                  style={{
                    fontSize: 17,
                    color: dayBeforeEnabled ? "#000000" : "#8e8e93",
                    fontWeight: "400",
                  }}>
                  Time
                </Text>
                <DateTimePicker
                  value={new Date(dayBeforeTime)}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onChangeDayBeforeTime}
                  disabled={!dayBeforeEnabled}
                  style={{ height: 40 }}
                />
              </TouchableOpacity>
            </View>

            {/* Day of collection */}
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 10,
                marginBottom: 16,
                overflow: "hidden",
                borderColor: "#E5E7EB",
                borderWidth: 1,
              }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#c6c6c8",
                }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "500",
                      color: "#000000",
                      marginBottom: 2,
                    }}>
                    Day of collection
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#8e8e93",
                      marginTop: 2,
                    }}>
                    Get reminded on the morning of collection day
                  </Text>
                </View>
                <Switch
                  value={dayOfEnabled}
                  onValueChange={toggleDayOf}
                  trackColor={{ false: "#e0e0e0", true: "#34c759" }}
                  thumbColor={dayOfEnabled ? "#ffffff" : "#f4f3f4"}
                  ios_backgroundColor="#e0e0e0"
                />
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  opacity: dayOfEnabled ? 1 : 0.5,
                }}
                disabled={!dayOfEnabled}>
                <Text
                  style={{
                    fontSize: 17,
                    color: dayOfEnabled ? "#000000" : "#8e8e93",
                    fontWeight: "400",
                  }}>
                  Time
                </Text>
                <DateTimePicker
                  value={new Date(dayOfTime)}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onChangeDayOfTime}
                  disabled={!dayOfEnabled}
                  style={{ height: 40 }}
                />
              </TouchableOpacity>
            </View>

            {/* Bin types */}
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 10,
                marginBottom: 16,
                overflow: "hidden",
                borderColor: "#E5E7EB",
                borderWidth: 1,
              }}>
              <View
                style={{
                  padding: 16,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#c6c6c8",
                }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "500",
                    color: "#000000",
                    marginBottom: 2,
                  }}>
                  Bin types
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#8e8e93",
                    marginTop: 2,
                  }}>
                  Select which bin types you want to receive notifications for
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#c6c6c8",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
                onPress={() => toggleRoundType("domestic")}>
                <Text
                  style={{
                    fontSize: 17,
                    color: "#000000",
                    fontWeight: "400",
                  }}>
                  Black (general waste)
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: roundTypes.domestic ? "#007AFF" : "transparent",
                    fontWeight: "600",
                  }}>
                  ✓
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#c6c6c8",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
                onPress={() => toggleRoundType("organic")}>
                <Text
                  style={{
                    fontSize: 17,
                    color: "#000000",
                    fontWeight: "400",
                  }}>
                  Green (food waste)
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: roundTypes.organic ? "#007AFF" : "transparent",
                    fontWeight: "600",
                  }}>
                  ✓
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
                onPress={() => toggleRoundType("recycle")}>
                <Text
                  style={{
                    fontSize: 17,
                    color: "#000000",
                    fontWeight: "400",
                  }}>
                  Blue (recycling)
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: roundTypes.recycle ? "#007AFF" : "transparent",
                    fontWeight: "600",
                  }}>
                  ✓
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
