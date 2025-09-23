// Schedules daily notifications using Expo Notifications.
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCHEDULED_KEY = "notifications_scheduled_v1";

export async function ensureNotificationsScheduled() {
  try {
    // 1) Only run once per install (persist a flag)
    const scheduled = await AsyncStorage.getItem(SCHEDULED_KEY);
    if (scheduled === "1") return;

    // 2) Ask for notification permission if needed
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      finalStatus = req.status;
    }
    if (finalStatus !== "granted") return;

    // 3) Configure Android notification channel (no-op on iOS)
    await Notifications.setNotificationChannelAsync?.("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    const message = "Time to log today’s peptides and vitals!";

    // Schedule 9 AM
    // 4) Schedule 9 AM reminder
    await Notifications.scheduleNotificationAsync({
      content: { title: "Peptide App", body: message },
      trigger: { hour: 9, minute: 0, repeats: true },
    });
    // 5) Schedule 9 PM reminder
    await Notifications.scheduleNotificationAsync({
      content: { title: "Peptide App", body: message },
      trigger: { hour: 21, minute: 0, repeats: true },
    });

    // 6) Persist the flag so we don't re-schedule next launch
    await AsyncStorage.setItem(SCHEDULED_KEY, "1");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to schedule notifications", err);
  }
}


