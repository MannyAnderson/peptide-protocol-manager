// Read-only vitals summary using mock data for now.
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { requestPermissions, readLast7Days, type HealthDay } from "../lib/health";

type MiniChartProps = {
  data: number[];
  height?: number;
  width?: number;
  barWidth?: number;
  gap?: number;
};

function MiniChart({ data, height = 56, width = 260, barWidth = 4, gap = 3 }: MiniChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  return (
    <View style={[styles.chartContainer, { height, width }]}>
      <View style={styles.chartBars}>
        {data.map((v, i) => {
          const h = Math.max(3, Math.round(((v - min) / range) * (height - 8)));
          return (
            <View
              key={i}
              style={{
                width: barWidth,
                height: h,
                backgroundColor: "#3b82f6",
                marginRight: i === data.length - 1 ? 0 : gap,
                borderRadius: 2,
                alignSelf: "flex-end",
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function VitalsScreen() {
  const [days, setDays] = useState<HealthDay[] | null>(null);
  const weight7d = (days || []).map((d) => (d.weightAvg ?? 0));
  const restingHR = days?.[days.length - 1]?.heartRateAvg ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Vitals & Metrics</Text>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={async () => {
            const ok = await requestPermissions();
            if (!ok) {
              Alert.alert("Permission", "Health permissions not granted or unavailable.");
              return;
            }
            const res = await readLast7Days();
            setDays(res);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.syncButtonText}>Connect Apple Health</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Resting HR</Text>
          <Text style={styles.cardValue}>{restingHR} bpm</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Steps (today)</Text>
          <Text style={styles.cardValue}>{days?.[days.length - 1]?.steps ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Weight</Text>
          <Text style={styles.cardValue}>{weight7d.length ? weight7d[weight7d.length - 1].toFixed(1) : 0} lb</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weight (7d)</Text>
        <MiniChart data={weight7d.length ? weight7d : [0]} />
        {weight7d.length >= 2 ? (
          <Text style={styles.chartFooter}>{`${weight7d[0].toFixed(1)} → ${weight7d[weight7d.length - 1].toFixed(1)} lb`}</Text>
        ) : (
          <Text style={styles.chartFooter}>No data</Text>
        )}
      </View>
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
  syncButton: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  syncButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  card: {
    width: "48%",
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 6,
  },
  cardValue: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  chartTitle: {
    color: "#c7d2fe",
    fontSize: 12,
    marginBottom: 8,
  },
  chartContainer: {
    backgroundColor: "#0b1220",
    borderRadius: 8,
    padding: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  chartFooter: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 8,
  },
});


