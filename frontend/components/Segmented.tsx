import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  options: string[];
  value: number;              // selected index
  onChange: (index: number) => void;
};

export default function Segmented({ options, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((label, i) => {
        const active = i === value;
        return (
          <TouchableOpacity
            key={label}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => onChange(i)}
          >
            <Text style={[styles.txt, active && styles.txtActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  btnActive: {
    backgroundColor: "#111827",
  },
  txt: { color: "#111827", fontWeight: "600" },
  txtActive: { color: "#fff" },
});
