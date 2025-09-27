import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const MOCK = [
  { id: "1", date: "Today 7:00 AM", item: "BPC-157 250mcg" },
  { id: "2", date: "Tomorrow 7:00 AM", item: "TB-500 2mg" },
];

export default function TrackSchedule() {
  return (
    <View>
      {MOCK.map((row) => (
        <View key={row.id} style={styles.card}>
          <Text style={styles.bold}>{row.date}</Text>
          <Text>{row.item}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={() => { /* open sheet (mock) */ }}>
        <Text style={styles.btnText}>Add schedule (mock)</Text>
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
