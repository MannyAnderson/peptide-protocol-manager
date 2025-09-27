import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from "react-native";
import { supabase } from "../src/utils/supabase";
import { apiGet, apiPost } from "../utils/api";

type Supplement = {
  id: string;
  name: string;
  dose?: string | null;
  notes?: string | null;
};

export default function SupplementsScreen() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");

  async function loadSupplements() {
    try {
      setLoading(true);
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      const data = await apiGet("/api/v1/supplements", token);
      setSupplements(data ?? []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load supplements", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSupplements();
  }, []);

  function resetForm() {
    setName("");
    setDose("");
    setNotes("");
  }

  async function submitNew() {
    try {
      const payload = {
        name: name.trim() || "New Supplement",
        dose: dose.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      await apiPost("/api/v1/supplements", payload, token);
      await loadSupplements();
      resetForm();
      setShowModal(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to add supplement", err);
    }
  }

  function renderItem({ item }: { item: Supplement }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
        {!!item.dose && (
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Dose</Text>
            <Text style={styles.cardValue}>{item.dose}</Text>
          </View>
        )}
        {!!item.notes && (
          <View style={[styles.cardRow, { marginTop: 6 }]}>
            <Text style={styles.cardLabel}>Notes</Text>
            <Text style={styles.cardValue}>{item.notes}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Supplements</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Supplement</Text>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Fish Oil"
                  placeholderTextColor="#6b7280"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Dose</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1g"
                  placeholderTextColor="#6b7280"
                  value={dose}
                  onChangeText={setDose}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional notes"
                  placeholderTextColor="#6b7280"
                  value={notes}
                  onChangeText={setNotes}
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
        data={supplements}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadSupplements}
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


