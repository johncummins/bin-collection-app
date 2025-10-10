import { getBinColorName } from "./HelperFunctions"; // Importing the function
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

let FURTHEST_DATE = null;

export const DEFAULT_SETTINGS = {
  dayBefore: {
    enabled: true,
    time: new Date().setHours(20, 0, 0, 0),
  },
  dayOf: {
    enabled: false,
    time: new Date().setHours(7, 0, 0, 0),
  },
  roundTypes: { domestic: true, recycle: true, organic: true },
};

export async function setupNotifications() {
  try {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    // Request notification permissions
    if (Device.isDevice) {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Notification permissions were denied");
      }

      return { success: true, status };
    } else {
      throw new Error("Notifications are not supported on this device");
    }
  } catch (error) {
    console.error("Notification setup error:", error);
    throw error;
  }
}

export async function addNotifications(settings, binCollections = []) {
  if (binCollections.length === 0) return;

  settings = settings || DEFAULT_SETTINGS;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Reset furthest date
    FURTHEST_DATE = null;

    // End here if no collection dates
    if (binCollections.length === 0) return;

    const { dayBefore, dayOf, roundTypes: selectedRoundTypes = {} } = settings;

    // End here if both notifications are turned off
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

    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();

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

  // Convert collection types to color names and join
  const typeList = collectionTypes
    .map((type) => getBinColorName(type))
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
