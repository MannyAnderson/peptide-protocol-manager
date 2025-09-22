import React, { useMemo } from "react";
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert } from "react-native";
import { addDoseEvents } from "../src/utils/calendar";

type ScheduleItem = {
  id: string;
  peptide: string;
  dose_mg: number;
  time: string; // e.g. 07:30 AM
};

type ScheduleSection = {
  title: string; // day label
  data: ScheduleItem[];
};

export default function ScheduleScreen() {
  const sections: ScheduleSection[] = useMemo(
    () => [
      {
        title: "Today",
        data: [
          { id: "t1", peptide: "BPC-157", dose_mg: 0.25, time: "07:30 AM" },
          { id: "t2", peptide: "CJC-1295/Ipamorelin", dose_mg: 0.10, time: "09:00 PM" },
        ],
      },
      {
        title: "Tomorrow",
        data: [
          { id: "tm1", peptide: "TB-500", dose_mg: 2.0, time: "08:00 AM" },
        ],
      },
      {
        title: "Wednesday",
        data: [
          { id: "w1", peptide: "BPC-157", dose_mg: 0.25, time: "07:30 AM" },
          { id: "w2", peptide: "Semax", dose_mg: 0.3, time: "02:00 PM" },
        ],
      },
    ],
    []
  );

  function renderItem({ item }: { item: ScheduleItem }) {
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemPeptide}>{item.peptide}</Text>
          <Text style={styles.itemMeta}>{item.dose_mg} mg</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Schedule & Dosage</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.addButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>Add Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#2563eb", borderColor: "#1d4ed8" }]}
            onPress={async () => {
              const now = new Date();
              const toDate = (time: string) => {
                const [hm, ampm] = time.split(" ");
                const [h, m] = hm.split(":").map(Number);
                let hour = h % 12;
                if ((ampm || "AM").toUpperCase() === "PM") hour += 12;
                const d = new Date(now);
                d.setHours(hour, m || 0, 0, 0);
                return d;
              };
              const events = sections[0].data.map((it) => ({
                title: `${it.peptide} ${it.dose_mg} mg`,
                start: toDate(it.time),
                end: new Date(toDate(it.time).getTime() + 30 * 60 * 1000),
                notes: "Peptide dose",
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
});


