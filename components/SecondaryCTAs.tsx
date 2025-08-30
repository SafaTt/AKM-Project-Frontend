// app/components/SecondaryCTAs.tsx
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface SecondaryCTAsProps {
  onPressKategorien?: () => void;
  onPressStatistik?: () => void;
  onPressEinstellungen?: () => void;
}

export default function SecondaryCTAs({
  onPressKategorien,
  onPressStatistik,
  onPressEinstellungen,
}: SecondaryCTAsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPressKategorien}>
        <Text style={styles.text}>Kategorien</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onPressStatistik}>
        <Text style={styles.text}>Statistik</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onPressEinstellungen}>
        <Text style={styles.text}>Einstellungen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: width * 0.9,
  },
  button: {
    backgroundColor: Colors.secondary,
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
