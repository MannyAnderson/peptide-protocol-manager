// Example schedule screen. Replaces mock data with API-driven upcoming schedule.
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { addDoseEvents } from "../src/utils/calendar";
import { supabase } from "../src/utils/supabase";
import { apiGet, apiPost } from "../utils/api";

type UpcomingItem = {
  schedule_id: string;
  name: string;
  item_type?: string | null;
  dose?: string | null;
  date: string; // ISO date
  time_of_day?: string | null; // HH:MM
};

type RenderItem = {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
};

type ScheduleSection = {
  title: string; // date label
  data: RenderItem[];
};

export default function ScheduleScreen() {
  const [sections, setSections] = useState<ScheduleSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Create schedule form
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily"); // daily|weekly
  const [weekday, setWeekday] = useState<string>(""); // 0-6 as string
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD
  const [timeOfDay, setTimeOfDay] = useState<string>(""); // HH:MM
  const [dose, setDose] = useState<string>("");

  function formatDateLabel(iso: string) {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  }

  async function loadUpcoming() {
    try {
      setLoading(true);
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      const items: UpcomingItem[] = await apiGet("/api/v1/schedule/upcoming?days=7", token);
      // Group by date
      const groups: Record<string, RenderItem[]> = {};
      for (const it of items) {
        const key = it.date;
        const arr = groups[key] || (groups[key] = []);
        arr.push({
          id: it.schedule_id,
          title: it.name,
          subtitle: it.dose || undefined,
          time: it.time_of_day || undefined,
        });
      }
      const secs: ScheduleSection[] = Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([iso, data]) => ({ title: formatDateLabel(iso), data }));
      setSections(secs);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load upcoming schedule", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUpcoming();
  }, []);

  function renderItem({ item }: { item: RenderItem }) {
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemPeptide}>{item.title}</Text>
          {!!item.subtitle && <Text style={styles.itemMeta}>{item.subtitle}</Text>}
        </View>
        <View style={styles.itemRight}>{!!item.time && <Text style={styles.itemTime}>{item.time}</Text>}</View>
      </View>
    );
  }

  function renderSectionHeader({ section }: { section: ScheduleSection }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    );
  }

  async function createSchedule() {
    try {
      const payload: any = {
        name: name.trim() || "New Schedule",
        frequency: frequency.trim() || "daily",
        start_date: startDate || new Date().toISOString().slice(0, 10),
        time_of_day: timeOfDay || undefined,
        dose: dose || undefined,
        item_type: "custom",
      };
      if (payload.frequency === "weekly" && weekday !== "") {
        payload.weekday = Number(weekday);
      }
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      await apiPost("/api/v1/schedule", payload, token);
      setShowModal(false);
      setName("");
      setFrequency("daily");
      setWeekday("");
      setStartDate("");
      setTimeOfDay("");
      setDose("");
      await loadUpcoming();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to create schedule", err);
      Alert.alert("Create failed", "Could not create schedule. Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Schedule & Dosage</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>Add Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#2563eb", borderColor: "#1d4ed8" }]}
            onPress={async () => {
              // Add today's items to calendar if present
              const todayLabel = new Date().toLocaleDateString();
              const today = sections.find((s) => s.title === todayLabel);
              if (!today) return;
              const now = new Date();
              const toDate = (time?: string) => {
                if (!time) return now;
                const [h, m] = time.split(":").map((n) => Number(n));
                const d = new Date(now);
                d.setHours(h || 0, m || 0, 0, 0);
                return d;
              };
              const events = today.data.map((it) => ({
                title: it.subtitle ? `${it.title} ${it.subtitle}` : it.title,
                start: toDate(it.time),
                end: new Date(toDate(it.time).getTime() + 30 * 60 * 1000),
                notes: "Dose",
              }));
              const created = await addDoseEvents(events);
              if (created > 0) Alert.alert("Added to Calendar", `${created} event(s) created.`);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.addButtonText, { color: "#fff" }]}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadUpcoming}
      />

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Schedule</Text>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Morning dose"
                  placeholderTextColor="#6b7280"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Frequency (daily|weekly)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="daily"
                  placeholderTextColor="#6b7280"
                  value={frequency}
                  onChangeText={setFrequency}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Weekday (0-6, if weekly)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  value={weekday}
                  onChangeText={setWeekday}
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Start date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder={new Date().toISOString().slice(0, 10)}
                  placeholderTextColor="#6b7280"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Time of day (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="07:30"
                  placeholderTextColor="#6b7280"
                  value={timeOfDay}
                  onChangeText={setTimeOfDay}
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Dose (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 0.25 mg"
                  placeholderTextColor="#6b7280"
                  value={dose}
                  onChangeText={setDose}
                />
              </View>
              <View style={styles.formCol} />
            </View>
            <View style={styles.formActionsRow}>
              <TouchableOpacity style={styles.saveButton} onPress={createSchedule} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowModal(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 6,
  },
  sectionTitle: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "700",
  },
  itemRow: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "column",
    flex: 1,
  },
  itemRight: {},
  itemPeptide: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
  },
  itemMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  itemTime: {
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


