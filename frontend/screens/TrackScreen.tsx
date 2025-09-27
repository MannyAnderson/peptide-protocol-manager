import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Segmented from "../components/Segmented";

// Segment components
import TrackDaily from "./track/TrackDaily";
import TrackVitals from "./track/TrackVitals";
import TrackSchedule from "./track/TrackSchedule";
import TrackLabs from "./track/TrackLabs";

export default function TrackScreen() {
  const [seg, setSeg] = useState<number>(0);
  const options = ["Daily", "Vitals", "Schedule", "Labs"];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Track</Text>
      <Segmented options={options} value={seg} onChange={setSeg} />

      {seg === 0 && <TrackDaily />}
      {seg === 1 && <TrackVitals />}
      {seg === 2 && <TrackSchedule />}
      {seg === 3 && <TrackLabs />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
});
