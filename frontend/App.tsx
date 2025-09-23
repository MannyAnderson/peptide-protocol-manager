// App entry: sets up navigation and decides whether to show auth or main tabs.
import * as React from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./src/utils/supabase";
import { ensureNotificationsScheduled } from "./src/utils/notifications";

import HomeScreen from "./screens/HomeScreen";
import ScheduleScreen from "./screens/ScheduleScreen";
import InventoryScreen from "./screens/InventoryScreen";
import VitalsScreen from "./screens/VitalsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DailyTrackingScreen from "./screens/DailyTrackingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import InsightsScreen from "./screens/InsightsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom tab navigator with the main screens
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      {/* 1) Each Tab.Screen registers a tab and its component */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Daily" component={DailyTrackingScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Vitals" component={VitalsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState<"Login" | "MainTabs">("Login");

  React.useEffect(() => {
    // Check if the user is already signed in
    supabase.auth.getSession().then(({ data }) => {
      // If a session exists, navigate straight to the main tabs
      if (data.session) setInitialRoute("MainTabs");
    });
    // Ask for notification permission and schedule daily reminders
    ensureNotificationsScheduled();
  }, []);

  return (
    <NavigationContainer>
      {/* 2) Stack contains Login/Signup and the tab navigator */}
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
