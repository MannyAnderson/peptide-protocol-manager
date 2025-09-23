import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { supabase } from "../src/utils/supabase";

type ScaleSelectorProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
};

function ScaleSelector({ label, value, onChange }: ScaleSelectorProps) {
  return (
    <View style={styles.scaleBlock}>
      <View style={styles.scaleHeader}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text style={styles.scaleValue}>{value}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        minimumTrackTintColor="#3b82f6"
        maximumTrackTintColor="#374151"
        thumbTintColor="#60a5fa"
        onValueChange={(v: number) => onChange(Math.round(v))}
      />
      <View style={styles.scaleEndsRow}>
        <Text style={styles.scaleEndText}>1</Text>
        <Text style={styles.scaleEndText}>10</Text>
      </View>
    </View>
  );
}

type PickerRowProps = {
  label: string;
  index: number;
  setIndex: (i: number) => void;
  options: string[];
};

function PickerRow({ label, index, setIndex, options }: PickerRowProps) {
  return (
    <View style={styles.pickerRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={index}
          onValueChange={(v) => setIndex(Number(v))}
          dropdownIconColor="#e5e7eb"
          mode="dropdown"
        >
          {options.map((opt, i) => (
            <Picker.Item key={`${opt}-${i}`} label={opt} value={i} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export default function DailyTrackingScreen() {
  // Peptides from Supabase
  const [peptides, setPeptides] = useState<Array<{ id: string; name: string }>>([]);
  const peptideOptions = useMemo(() => ["None", ...peptides.map((p) => p.name)], [peptides]);

  useEffect(() => {
    // 1) Load peptide options for the dropdowns
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("peptides")
        .select("id,name")
        .order("name", { ascending: true });
      if (error) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load peptides:", error.message);
        return;
      }
      if (isMounted && data) setPeptides(data);
    })();
    // 2) Cleanup flag so we don't set state after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  const [pepIdx1, setPepIdx1] = useState(0);
  const [pepIdx2, setPepIdx2] = useState(1);
  const [pepIdx3, setPepIdx3] = useState(2);

  const [weight, setWeight] = useState(0);
  const [waist, setWaist] = useState(0);
  const [bpAM, setBpAM] = useState("");
  const [bpPM, setBpPM] = useState("");
  const [bodyFat, setBodyFat] = useState(18);
  const [muscleMass, setMuscleMass] = useState(42);
  const [restingHR, setRestingHR] = useState(62);

  const [energy, setEnergy] = useState(6);
  const [appetite, setAppetite] = useState(5);
  const [performance, setPerformance] = useState(6);

  const [notes, setNotes] = useState("");

  // Dropdown pickers are used instead of cycling buttons

  function parseNum(text: string, fallback: number): number {
    const n = Number(text.replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : fallback;
  }

  async function handleSubmit() {
    try {
      // 1) Resolve selected peptide IDs (index 0 is "None")
      const resolvePeptideId = (index: number) => (index <= 0 ? null : peptides[index - 1]?.id ?? null);
      const peptide1_id = resolvePeptideId(pepIdx1);
      const peptide2_id = resolvePeptideId(pepIdx2);
      const peptide3_id = resolvePeptideId(pepIdx3);

      // 2) Ensure user is signed in
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) {
        Alert.alert("Sign in required", "Please sign in to save your tracking.");
        return;
      }

      // 3) Construct the row to insert
      const row = {
        user_id: userId,
        peptide1_id,
        peptide2_id,
        peptide3_id,
        weight_lbs: weight,
        waist_in: waist,
        bp_am: bpAM,
        bp_pm: bpPM,
        body_fat_pct: bodyFat,
        muscle_mass_pct: muscleMass,
        resting_hr_bpm: restingHR,
        energy,
        appetite,
        performance,
        notes,
      };

      // 4) Insert the row into Supabase
      const { error } = await supabase.from("daily_tracking").insert([row]);
      if (error) throw error;

      // 5) Notify the user
      Alert.alert("Success", "Daily tracking saved.");
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Failed to save daily tracking:", err?.message ?? err);
      Alert.alert(
        "Save failed",
        "Could not save. Ensure Supabase table 'daily_tracking' exists with expected columns."
      );
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Daily Tracking</Text>

      {/* Peptide Pickers */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Peptides</Text>
        <PickerRow label="Peptide 1" index={pepIdx1} setIndex={setPepIdx1} options={peptideOptions} />
        <PickerRow label="Peptide 2" index={pepIdx2} setIndex={setPepIdx2} options={peptideOptions} />
        <PickerRow label="Peptide 3" index={pepIdx3} setIndex={setPepIdx3} options={peptideOptions} />
      </View>

      {/* Metrics Inputs */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vitals & Body Comp</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#6b7280"
              value={String(weight)}
              onChangeText={(t) => setWeight(parseNum(t, weight))}
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Waist (in)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#6b7280"
              value={String(waist)}
              onChangeText={(t) => setWaist(parseNum(t, waist))}
            />
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>BP AM</Text>
            <TextInput
              style={styles.input}
              keyboardType="default"
              placeholder="120/80"
              placeholderTextColor="#6b7280"
              value={bpAM}
              onChangeText={setBpAM}
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>BP PM</Text>
            <TextInput
              style={styles.input}
              keyboardType="default"
              placeholder="120/80"
              placeholderTextColor="#6b7280"
              value={bpPM}
              onChangeText={setBpPM}
            />
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Body Fat %</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#6b7280"
              value={String(bodyFat)}
              onChangeText={(t) => setBodyFat(parseNum(t, bodyFat))}
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Muscle Mass %</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#6b7280"
              value={String(muscleMass)}
              onChangeText={(t) => setMuscleMass(parseNum(t, muscleMass))}
            />
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Resting HR</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="60"
              placeholderTextColor="#6b7280"
              value={String(restingHR)}
              onChangeText={(t) => setRestingHR(parseNum(t, restingHR))}
            />
          </View>
          <View style={styles.inputCol} />
        </View>
      </View>

      {/* Scales */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Daily Scales</Text>
        <ScaleSelector label="Energy" value={energy} onChange={setEnergy} />
        <ScaleSelector label="Appetite Control" value={appetite} onChange={setAppetite} />
        <ScaleSelector label="Physical Performance" value={performance} onChange={setPerformance} />
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          multiline
          numberOfLines={4}
          placeholder="Anything notable today..."
          placeholderTextColor="#6b7280"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
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
    paddingBottom: 40,
  },
  screenTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  inputCol: {
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
  notesInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  pickerRow: {
    marginBottom: 10,
  },
  pickerBox: {
    backgroundColor: "#0b1220",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  scaleBlock: {
    marginBottom: 12,
  },
  scaleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  slider: {
    marginHorizontal: 6,
  },
  scaleEndsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  scaleEndText: {
    color: "#6b7280",
    fontSize: 11,
  },
  scaleValue: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderColor: "#1d4ed8",
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 28,
    marginHorizontal: 16,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});


