// Simple CRUD-style list for peptides using Supabase.
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from "react-native";
import { supabase } from "../src/utils/supabase";

type Peptide = {
  id: string;
  name: string;
  units_remaining: number; // mg remaining
  expires_on: string; // ISO date
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function InventoryScreen() {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [unitsRemaining, setUnitsRemaining] = useState<string>("");
  const [expiresOn, setExpiresOn] = useState<string>("");

  async function loadPeptides() {
    try {
      // 1) Start loading and query the table
      setLoading(true);
      const { data, error } = await supabase
        .from("peptides")
        .select("id,name,units_remaining,expires_on")
        .order("expires_on", { ascending: true });
      if (error) throw error;
      // 2) Save the results into state
      setPeptides(data ?? []);
    } catch (err) {
      // eslint-disable-next-line no-console
      // 3) Print a warning in dev; production apps could show a toast
      console.warn("Failed to load peptides", err);
    } finally {
      // 4) Stop loading indicator
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPeptides();
  }, []);

  function parseNum(text: string) {
    const n = Number(text.replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function resetForm() {
    setName("");
    setUnitsRemaining("");
    setExpiresOn("");
  }

  async function submitNew() {
    try {
      // 1) Prepare the payload with sanitized/parsed values
      const units = parseNum(unitsRemaining);
      const iso = expiresOn ? new Date(expiresOn).toISOString() : new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString();
      const row = { name: name.trim() || "Unnamed Peptide", units_remaining: units, expires_on: iso };
      // 2) Insert the row into Supabase
      const { error } = await supabase.from("peptides").insert([row]);
      if (error) throw error;
      // 3) Refresh list and reset the form
      await loadPeptides();
      resetForm();
      setShowModal(false);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      // 4) Log the error
      console.error("Failed to add peptide:", err?.message ?? err);
    }
  }

  function renderItem({ item }: { item: Peptide }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMeta}>Exp: {formatDate(item.expires_on)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Units remaining</Text>
          <Text style={styles.cardValue}>{item.units_remaining} mg</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ Add Peptide</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Peptide</Text>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., BPC-157"
                  placeholderTextColor="#6b7280"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Units remaining (mg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  value={unitsRemaining}
                  onChangeText={setUnitsRemaining}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Expires on (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025-12-31"
                  placeholderTextColor="#6b7280"
                  value={expiresOn}
                  onChangeText={setExpiresOn}
                />
              </View>
            </View>
            <View style={styles.formActionsRow}>
              <TouchableOpacity style={styles.saveButton} onPress={submitNew} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { resetForm(); setShowModal(false); }} activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={peptides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
  },
  cardMeta: {
    color: "#9ca3af",
    fontSize: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  cardValue: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  formTitle: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  formCol: {
    flex: 1,
  },
  inputLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#0b1220",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#f9fafb",
    fontSize: 14,
  },
  formActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderColor: "#1d4ed8",
    borderWidth: 1,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderColor: "#374151",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
  },
});


