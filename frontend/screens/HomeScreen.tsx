// Home screen showing a quick overview and shortcuts.
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

type MiniChartProps = {
  data: number[];
  height?: number;
  width?: number;
  barWidth?: number;
  gap?: number;
};

function MiniChart({ data, height = 48, width = 160, barWidth = 4, gap = 3 }: MiniChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const bars = data.map((v, idx) => {
    const normalized = (v - min) / range; // 0..1
    const barHeight = Math.max(2, Math.round(normalized * (height - 6))); // keep tiny min height
    return (
      <View
        key={idx}
        style={{
          width: barWidth,
          height: barHeight,
          backgroundColor: "#3b82f6",
          marginRight: idx === data.length - 1 ? 0 : gap,
          borderRadius: 2,
          alignSelf: "flex-end",
        }}
      />
    );
  });
  return (
    <View style={[styles.chartContainer, { height, width }]}>
      <View style={styles.chartBars}>{bars}</View>
    </View>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type QuickActionButtonProps = {
  label: string;
  onPress?: () => void;
};

function QuickActionButton({ label, onPress }: QuickActionButtonProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  // Mock data
  const activeProfile = "Alex Johnson";
  const todaysDoses = 2;
  const energy = 7; // 1-10
  const inventoryAlerts = 1;
  const weight7d = [182.4, 182.0, 181.6, 181.9, 181.3, 181.1, 180.9];
  const bp7d = [122, 125, 121, 119, 123, 118, 120]; // systolic mock

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Home</Text>
          <Text style={styles.headerSubtitle}>Active profile</Text>
        </View>
        <View style={styles.profilePill}>
          <Text style={styles.profilePillText}>{activeProfile}</Text>
        </View>
      </View>

      {/* Summary cards */}
      <View style={styles.cardsRow}>
        <SummaryCard title="Today's Doses" value={`${todaysDoses}`} subtitle="completed" />
        <SummaryCard title="Energy" value={`${energy}/10`} subtitle="self-rated" />
        <SummaryCard title="Inventory" value={`${inventoryAlerts}`} subtitle="alerts" />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <QuickActionButton label="Log Daily" />
        <QuickActionButton label="View Insights" />
        <QuickActionButton label="Add Peptide" />
      </View>

      {/* Mini charts */}
      <View style={styles.chartsRow}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight (7d)</Text>
          <MiniChart data={weight7d} />
          <Text style={styles.chartFooter}>{`${weight7d[0].toFixed(1)} → ${weight7d[weight7d.length - 1].toFixed(1)} lb`}</Text>
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>BP Systolic (7d)</Text>
          <MiniChart data={bp7d} />
          <Text style={styles.chartFooter}>{`${bp7d[0]} → ${bp7d[bp7d.length - 1]} mmHg`}</Text>
        </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#a5b4fc",
    fontSize: 12,
    marginTop: 2,
  },
  profilePill: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  profilePillText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "600",
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 6,
  },
  cardValue: {
    color: "#f9fafb",
    fontSize: 22,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "#374151",
    borderWidth: 1,
  },
  quickActionText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  chartsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  chartCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
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


