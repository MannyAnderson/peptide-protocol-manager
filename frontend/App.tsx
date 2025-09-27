// App entry: sets up navigation and decides whether to show auth or main tabs.
import * as React from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./src/utils/supabase";
import { ensureNotificationsScheduled } from "./src/utils/notifications";
import { View, StyleSheet, Pressable, Text } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import InventoryScreen from "./screens/InventoryScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import TrackScreen from "./screens/TrackScreen";
import InsightsScreen from "./screens/InsightsScreen";
import ProfileSheet from "./screens/ProfileSheet";
import DailyTrackingSheet from "./screens/DailyTrackingSheet";
import FAB from "./components/FAB";
import { colors, spacing } from "./lib/theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Small wrapper to inject header avatar and FAB behaviors
function HomeTabScreen({ navigation }: any) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("ProfileSheet")} style={styles.avatar} accessibilityRole="button" accessibilityLabel="Profile">
          <Text style={styles.avatarText}>AJ</Text>
        </Pressable>
      ),
      title: "Home",
    });
  }, [navigation]);
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
      <FAB label="Log Daily" onPress={() => navigation.navigate("DailyTrackingSheet")} />
    </View>
  );
}

function TrackTabScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      <TrackScreen />
      <FAB label="Log Daily" onPress={() => navigation.navigate("DailyTrackingSheet")} />
    </View>
  );
}

// Bottom tab navigator with the simplified IA (exactly 4 tabs)
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Home" component={HomeTabScreen} />
      <Tab.Screen name="Track" component={TrackTabScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
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
      {/* Root stack contains auth flow, tabs, and modal sheets */}
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ProfileSheet" component={ProfileSheet} options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="DailyTrackingSheet" component={DailyTrackingSheet} options={{ presentation: 'fullScreenModal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
