import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { supabase } from "../src/utils/supabase";
import { apiGet, apiPost, apiPatch } from "../utils/api";

type Cycle = {
  id: string;
  name: string;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
};

export default function CyclesScreen() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("planned");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function loadCycles() {
    try {
      setLoading(true);
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      const data = await apiGet("/api/v1/cycles", token);
      setCycles(data ?? []);
    } catch (err) {
      console.warn("Failed to load cycles", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCycles();
  }, []);

  function resetForm() {
    setName("");
    setStatus("planned");
    setStartDate("");
    setEndDate("");
    setNotes("");
  }

  async function submitNew() {
    try {
      const payload: any = {
        name: name.trim() || "New Cycle",
        status: status.trim() || "planned",
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        notes: notes || undefined,
      };
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      await apiPost("/api/v1/cycles", payload, token);
      await loadCycles();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to create cycle", err);
      Alert.alert("Create failed", "Could not create cycle. Please try again.");
    }
  }

  async function updateStatus(id: string, next: string) {
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      await apiPatch(`/api/v1/cycles/${id}`, { status: next }, token);
      await loadCycles();
    } catch (err) {
      console.error("Failed to update cycle", err);
    }
  }

  function renderItem({ item }: { item: Cycle }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMeta}>{item.status}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Start</Text>
          <Text style={styles.cardValue}>{item.start_date ? new Date(item.start_date).toLocaleDateString() : "-"}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>End</Text>
          <Text style={styles.cardValue}>{item.end_date ? new Date(item.end_date).toLocaleDateString() : "-"}</Text>
        </View>
        {!!item.notes && (
          <View style={[styles.cardRow, { marginTop: 6 }]}>
            <Text style={styles.cardLabel}>Notes</Text>
            <Text style={styles.cardValue}>{item.notes}</Text>
          </View>
        )}
        <View style={[styles.cardRow, { marginTop: 10 }] }>
          <TouchableOpacity style={styles.smallButton} onPress={() => updateStatus(item.id, "active")}>
            <Text style={styles.smallButtonText}>Mark Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={() => updateStatus(item.id, "completed")}>
            <Text style={styles.smallButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Cycles</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ Add Cycle</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Cycle</Text>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput style={styles.input} placeholder="e.g., Fat loss phase" placeholderTextColor="#6b7280" value={name} onChangeText={setName} />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Status</Text>
                <TextInput style={styles.input} placeholder="planned" placeholderTextColor="#6b7280" value={status} onChangeText={setStatus} />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Start (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} placeholder={new Date().toISOString().slice(0,10)} placeholderTextColor="#6b7280" value={startDate} onChangeText={setStartDate} />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>End (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} placeholder="" placeholderTextColor="#6b7280" value={endDate} onChangeText={setEndDate} />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput style={styles.input} placeholder="Optional" placeholderTextColor="#6b7280" value={notes} onChangeText={setNotes} />
              </View>
            </View>
            <View style={styles.formActionsRow}>
              <TouchableOpacity style={styles.saveButton} onPress={submitNew} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)} activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={cycles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadCycles}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  topBar: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#ffffff", fontSize: 22, fontWeight: "700" },
  addButton: { backgroundColor: "#1f2937", borderColor: "#374151", borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: "#e5e7eb", fontSize: 14, fontWeight: "700" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: "#111827", borderColor: "#1f2937", borderWidth: 1, borderRadius: 12, padding: 12 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { color: "#f9fafb", fontSize: 16, fontWeight: "700" },
  cardMeta: { color: "#9ca3af", fontSize: 12 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLabel: { color: "#9ca3af", fontSize: 12 },
  cardValue: { color: "#f9fafb", fontSize: 14, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 16 },
  formCard: { backgroundColor: "#111827", borderColor: "#1f2937", borderWidth: 1, borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 12 },
  formTitle: { color: "#c7d2fe", fontSize: 14, fontWeight: "700", marginBottom: 10 },
  formRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  formCol: { flex: 1 },
  inputLabel: { color: "#9ca3af", fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: "#0b1220", borderColor: "#374151", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: "#f9fafb", fontSize: 14 },
  formActionsRow: { flexDirection: "row", gap: 10 },
  saveButton: { backgroundColor: "#2563eb", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderColor: "#1d4ed8", borderWidth: 1 },
  saveButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  cancelButton: { backgroundColor: "#1f2937", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderColor: "#374151", borderWidth: 1 },
  cancelButtonText: { color: "#e5e7eb", fontSize: 14, fontWeight: "700" },
  smallButton: { backgroundColor: "#1f2937", borderColor: "#374151", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  smallButtonText: { color: "#e5e7eb", fontSize: 12, fontWeight: "700" },
});


