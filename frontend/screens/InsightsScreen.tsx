// frontend/screens/InsightsScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// ✅ Adjust these two paths if your files are in a different folder:
import { supabase } from "../src/utils/supabase"; // or "../src/utils/supabase"
import { apiPost } from "../utils/api";     // or "../src/api"

type Insight = {
  id: string;
  title: string;
  body: string;
  created_at?: string;
};

export default function InsightsScreen() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // If you have a backend endpoint for insights, call it here.
      // Otherwise we’ll keep mock data so the UI renders.
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // Example call if your backend route exists:
      // const res = await apiPost("/api/v1/insights/generate", {}, token);
      // setInsights(res?.insights ?? []);

      // Mock fallback (so the screen always renders)
      setInsights([
        {
          id: "1",
          title: "Energy trending up",
          body: "Your energy scores improved this week vs last.",
        },
        {
          id: "2",
          title: "BP stable",
          body: "No significant changes in BP over the past 7 days.",
        },
      ]);
    } catch (e: any) {
      console.warn("insights load failed:", e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, range]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Insights</Text>
        <TouchableOpacity onPress={() => { /* TODO: export action */ }}>
          <Text style={styles.link}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        {(["7d", "30d", "90d"] as const).map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.chip,
              range === r && styles.chipActive
            ]}
            onPress={() => setRange(r)}
          >
            <Text
              style={[
                styles.chipText,
                range === r && styles.chipTextActive
              ]}
            >
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trend “cards” (placeholder content) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weight (trend)</Text>
        <Text style={styles.cardBody}>178.8 → 178.2 → 178.0 (mock)</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>BP (trend)</Text>
        <Text style={styles.cardBody}>120/78 → 118/76 (mock)</Text>
      </View>

      {/* Insights list */}
      {loading ? (
        <ActivityIndicator size="small" />
      ) : insights.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No tips yet</Text>
          <Text style={styles.emptyBody}>
            Log your daily data to unlock AI insights.
          </Text>
        </View>
      ) : (
        insights.map((it) => (
          <View key={it.id} style={styles.card}>
            <Text style={styles.cardTitle}>{it.title}</Text>
            <Text style={styles.cardBody}>{it.body}</Text>
            <TouchableOpacity
              onPress={() => {/* TODO: show “Why this tip?” details */}}
            >
              <Text style={styles.link}>Why this tip?</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  link: { color: "#2563EB", fontWeight: "600" },

  chipsRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  chip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#111827" },
  chipText: { color: "#111827", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: "#111827" },
  cardBody: { fontSize: 14, color: "#374151" },

  empty: { alignItems: "center", paddingVertical: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  emptyBody: { fontSize: 14, color: "#6B7280" },
});
