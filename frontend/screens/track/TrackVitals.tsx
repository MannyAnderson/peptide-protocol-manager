import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function TrackVitals() {
  return (
    <View>
      <Text style={styles.cardTitle}>Resting HR</Text>
      <View style={styles.card}><Text>72 bpm (mock)</Text></View>

      <Text style={styles.cardTitle}>Blood Pressure</Text>
      <View style={styles.card}><Text>118/76 (mock)</Text></View>

      <Text style={styles.cardTitle}>Weight</Text>
      <View style={styles.card}><Text>178.6 lbs (mock)</Text></View>

      <TouchableOpacity style={styles.btn} onPress={() => {}}>
        <Text style={styles.btnText}>Connect Apple Health (mock)</Text>
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
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  btn: { marginTop: 12, backgroundColor: "#111827", padding: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
