import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }: any) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [
    { id: "1", label: "Today 7:00 AM — BPC-157 250mcg" },
    { id: "2", label: "Today 7:00 PM — TB-500 2mg" },
  ];
  const recentInsight = { title: "Energy trending up", body: "Your energy scores improved vs last week." };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileSheet" as never)}>
          <View style={styles.avatar}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Peptide</Text>
        <TouchableOpacity onPress={() => { /* notifications */ }}>
          <Text style={styles.link}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Today card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.cardBody}>{today}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("DailyTrackingSheet" as never)}
        >
          <Text style={styles.btnText}>Log Daily</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming */}
      <Text style={styles.sectionTitle}>Upcoming (3)</Text>
      {upcoming.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing scheduled</Text>
          <Text style={styles.emptyBody}>Create a schedule to see upcoming doses.</Text>
        </View>
      ) : (
        upcoming.slice(0,3).map((it) => (
          <View key={it.id} style={styles.card}>
            <Text style={styles.cardBody}>{it.label}</Text>
          </View>
        ))
      )}

      {/* Insight */}
      <Text style={styles.sectionTitle}>Recent Insight</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{recentInsight.title}</Text>
        <Text style={styles.cardBody}>{recentInsight.body}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Insights" as never)}>
          <Text style={styles.link}>See all</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8,
  },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#111827" },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  link: { color: "#2563EB", fontWeight: "700", fontSize: 16 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 8 },
  card: { backgroundColor: "#FAFAFA", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: "#111827" },
  cardBody: { fontSize: 14, color: "#374151" },
  empty: { alignItems: "center", paddingVertical: 24, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  emptyBody: { fontSize: 14, color: "#6B7280" },

  btn: { marginTop: 10, backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
