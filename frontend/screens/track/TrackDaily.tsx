import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function TrackDaily() {
  // basic local state placeholders
  const [peptide1, setPeptide1] = useState<string>("");
  const [peptide2, setPeptide2] = useState<string>("");
  const [peptide3, setPeptide3] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [bpAm, setBpAm] = useState<string>("");
  const [bpPm, setBpPm] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [muscle, setMuscle] = useState<string>("");
  const [restingHr, setRestingHr] = useState<string>("");
  const [energy, setEnergy] = useState<string>("");
  const [appetite, setAppetite] = useState<string>("");
  const [performance, setPerformance] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const onSubmit = () => {
    console.log("SUBMIT (mock):", {
      peptide1, peptide2, peptide3, weight, waist, bpAm, bpPm,
      bodyFat, muscle, restingHr, energy, appetite, performance, notes
    });
    alert("Saved (mock)");
  };

  return (
    <View>
      <Text style={styles.section}>Peptides</Text>
      <TextInput placeholder="Peptide 1" value={peptide1} onChangeText={setPeptide1} style={styles.input}/>
      <TextInput placeholder="Peptide 2" value={peptide2} onChangeText={setPeptide2} style={styles.input}/>
      <TextInput placeholder="Peptide 3" value={peptide3} onChangeText={setPeptide3} style={styles.input}/>

      <Text style={styles.section}>Vitals</Text>
      <TextInput placeholder="Weight (lbs)" keyboardType="numeric" value={weight} onChangeText={setWeight} style={styles.input}/>
      <TextInput placeholder="Waist (in)" keyboardType="numeric" value={waist} onChangeText={setWaist} style={styles.input}/>
      <TextInput placeholder="BP AM (e.g., 120/80)" value={bpAm} onChangeText={setBpAm} style={styles.input}/>
      <TextInput placeholder="BP PM (e.g., 118/78)" value={bpPm} onChangeText={setBpPm} style={styles.input}/>
      <TextInput placeholder="Body Fat %" keyboardType="numeric" value={bodyFat} onChangeText={setBodyFat} style={styles.input}/>
      <TextInput placeholder="Muscle Mass %" keyboardType="numeric" value={muscle} onChangeText={setMuscle} style={styles.input}/>
      <TextInput placeholder="Resting HR (bpm)" keyboardType="numeric" value={restingHr} onChangeText={setRestingHr} style={styles.input}/>

      <Text style={styles.section}>1–10 Ratings</Text>
      <TextInput placeholder="Energy (1–10)" keyboardType="numeric" value={energy} onChangeText={setEnergy} style={styles.input}/>
      <TextInput placeholder="Appetite Control (1–10)" keyboardType="numeric" value={appetite} onChangeText={setAppetite} style={styles.input}/>
      <TextInput placeholder="Physical Performance (1–10)" keyboardType="numeric" value={performance} onChangeText={setPerformance} style={styles.input}/>

      <Text style={styles.section}>Notes</Text>
      <TextInput
        placeholder="Observations..."
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, { height: 90 }]}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={onSubmit}>
        <Text style={styles.btnText}>Submit (Mock)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 16, fontWeight: "700", marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 10, marginBottom: 8,
    backgroundColor: "#fff"
  },
  btn: {
    marginTop: 12, backgroundColor: "#111827", paddingVertical: 12,
    borderRadius: 10, alignItems: "center"
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
