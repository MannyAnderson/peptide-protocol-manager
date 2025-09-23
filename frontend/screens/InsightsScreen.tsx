// Fetches "AI insights" from the backend for the signed-in user.
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../src/utils/supabase";
import { apiPost } from "../src/api";

type Insight = { title: string; detail?: string } | string;

export default function InsightsScreen() {
  const [tips, setTips] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      // 1) Start loading and clear previous error
      setLoading(true);
      setError(null);
      // 2) Read the current auth session and extract the JWT token
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      // 3) Call the backend endpoint with the token for authorization
      const res = await apiPost("/insights/generate", {}, token);
      let items: Insight[] = [];
      // 4) Normalize response shape into a simple array of tips
      if (Array.isArray(res)) {
        items = res;
      } else if (res?.tips && Array.isArray(res.tips)) {
        items = res.tips;
      } else if (res?.suggestions && Array.isArray(res.suggestions)) {
        items = res.suggestions;
      } else if (typeof res === "object") {
        items = Object.values(res);
      }
      // 5) Save to local state
      setTips(items);
    } catch (err: any) {
      // 6) Show a friendly error
      setError(err?.message ?? "Failed to load insights");
    } finally {
      // 7) Clear loading indicator
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInsights} />}
    >
      <View style={styles.topBar}>
        <Text style={styles.title}>AI Insights</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={fetchInsights} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={fetchInsights} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Generate Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#93c5fd" />
          <Text style={styles.loadingText}>Generating tips…</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {tips.length === 0 && !loading && !error && (
        <Text style={styles.emptyText}>No insights yet. Try refreshing.</Text>
      )}

      {tips.map((tip, idx) => {
        const isObj = typeof tip === "object" && tip !== null;
        const title = isObj ? (tip as any).title ?? "Insight" : String(tip);
        const detail = isObj ? (tip as any).detail : undefined;
        return (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            {detail ? <Text style={styles.cardDetail}>{detail}</Text> : null}
          </View>
        );
      })}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    color: "#93c5fd",
    marginLeft: 8,
  },
  errorCard: {
    backgroundColor: "#7f1d1d",
    borderColor: "#991b1b",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#fecaca",
  },
  emptyText: {
    color: "#9ca3af",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardDetail: {
    color: "#e5e7eb",
    fontSize: 13,
  },
});


