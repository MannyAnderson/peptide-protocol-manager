import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Segmented from "../components/Segmented";

type Peptide = { id: string; name: string; remaining: string; expiry: string };
type Stack = { id: string; name: string; count: number };

const MOCK_PEPTIDES: Peptide[] = [
  { id: "1", name: "BPC-157", remaining: "3 mL", expiry: "2025-06-01" },
  { id: "2", name: "TB-500", remaining: "1 mL", expiry: "2025-04-15" },
];
const MOCK_STACKS: Stack[] = [
  { id: "1", name: "Muscle Recovery", count: 2 },
];

export default function InventoryScreen() {
  const [tab, setTab] = useState<number>(0);

  return (
    <View style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.header}>Inventory</Text>
        <Segmented options={["Peptides", "Stacks"]} value={tab} onChange={setTab} />
      </View>

      {tab === 0 ? (
        <FlatList
          data={MOCK_PEPTIDES}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.row}>Remaining: {item.remaining}</Text>
              <Text style={styles.row}>Expiry: {item.expiry}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={MOCK_STACKS}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.row}>Peptides: {item.count}</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.link}>Apply to Daily</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => {}}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#FAFAFA", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: "#111827" },
  row: { fontSize: 14, color: "#374151", marginBottom: 2 },
  link: { color: "#2563EB", fontWeight: "700", marginTop: 6 },
  fab: {
    position: "absolute", right: 16, bottom: 24, width: 56, height: 56,
    backgroundColor: "#111827", borderRadius: 28, alignItems: "center", justifyContent: "center"
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 28 },
});
