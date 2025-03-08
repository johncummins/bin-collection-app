import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import * as Device from "expo-device";

async function requestPermissions() {
  // @todo add back in device check (remove for emulator testing)
  //   if (Device.isDevice) {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
  //   }
  return false;
}

async function scheduleNotification() {
  console.log("bin reminder set ***");

  const nowPlusOneSecond = new Date(new Date().getTime() + 10 * 1000); // Trigger in 1 second
  console.log("Scheduling notification for: ", nowPlusOneSecond);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification Scheulded",
      body: "This is a scheduled notification!",
      sound: true,
    },
    trigger: { date: nowPlusOneSecond },
  });
}

export default function ManageNotifications() {
  requestPermissions();
  return (
    <View>
      <Text>Manage Notifications</Text>
      <Button size="xl" onPress={() => scheduleNotification()}>
        <ButtonText className="text-typography-0">Add Schedules</ButtonText>
      </Button>
    </View>
  );
}
