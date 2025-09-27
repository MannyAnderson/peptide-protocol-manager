import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const MOCK = [
  { id: "1", panel: "Function Health - Metabolic", date: "2025-02-01" },
];

export default function TrackLabs() {
  return (
    <View>
      {MOCK.map((row) => (
        <View key={row.id} style={styles.card}>
          <Text style={styles.bold}>{row.panel}</Text>
          <Text>{row.date}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={() => {}}>
        <Text style={styles.btnText}>Add lab (mock)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, padding: 12, marginBottom: 10
  },
  bold: { fontWeight: "700", marginBottom: 4 },
  btn: { marginTop: 12, backgroundColor: "#111827", padding: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
