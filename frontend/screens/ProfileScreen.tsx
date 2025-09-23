// Basic profile and settings; includes CSV export shortcut.
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { supabase } from "../src/utils/supabase";
import { API_BASE } from "../src/api";

export default function ProfileScreen() {
  const user = { name: "Alex Johnson", email: "alex@example.com" };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AJ</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {/* Settings List */}
      <View style={styles.list}>
        <TouchableOpacity style={styles.listItem} onPress={() => {}}>
          <Text style={styles.listText}>Connected Apps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => {}}>
          <Text style={styles.listText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.listItem}
          onPress={async () => {
            try {
              // 1) Retrieve the current session token
              const { data } = await supabase.auth.getSession();
              const token = data.session?.access_token;
              if (!token) {
                Alert.alert("Sign in required", "Please sign in to export data.");
                return;
              }
              // 2) Build a one-month window and construct the download URL
              const start = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
              const end = new Date().toISOString();
              const url = `${API_BASE}/api/v1/export/csv?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
              // 3) On mobile, pass token in the query string (headers may be dropped)
              const link = `${url}&token=${encodeURIComponent(token)}`;
              // eslint-disable-next-line no-undef
              // 4) Open the link in the system browser to trigger file download
              Linking.openURL?.(link);
            } catch (err: any) {
              Alert.alert("Export failed", err?.message ?? "Unknown error");
            }
          }}
        >
          <Text style={styles.listText}>Export Data (CSV)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOut} onPress={() => {}} activeOpacity={0.85}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  headerCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#374151",
    borderWidth: 1,
  },
  avatarText: {
    color: "#e5e7eb",
    fontWeight: "800",
    fontSize: 18,
  },
  name: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  listItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomColor: "#1f2937",
    borderBottomWidth: 1,
  },
  listText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  signOut: {
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  signOutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});


