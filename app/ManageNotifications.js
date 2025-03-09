import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import * as Device from "expo-device";

async function scheduleNotification() {
  try {
    // Clear any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const dates = [
      new Date(Date.now() + 10 * 1000),
      new Date(Date.now() + 20 * 1000),
    ];

    for (const date of dates) {
      console.log(date);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bin Collection Reminder",
          body: `It's pickup day on xxx. Your xxx bin will be picked up. (CB13EE) ${date}`,
        },
        trigger: date,
      });
    }
  } catch (error) {
    console.error("Scheduling error:", error);
  }
}

export default function ManageNotifications() {
  useEffect(() => {
    // Configure notification handler when component mounts
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Request permissions on component mount
    async function setupNotifications() {
      if (!Device.isDevice) return false;

      const { status } = await Notifications.requestPermissionsAsync();

      return status === "granted";
    }

    setupNotifications();
  }, []);

  return (
    <View>
      <Text>Manage Notifications</Text>
      <Button size="xl" onPress={() => scheduleNotification()}>
        <ButtonText className="text-typography-0">Add Schedules</ButtonText>
      </Button>
    </View>
  );
}
