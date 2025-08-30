// app/components/PrimaryCTA.tsx
import { Colors } from "@/constants/Colors";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

interface PrimaryCTAProps {
  title: string;
  onPress: () => void;
}

export default function PrimaryCTA({ title, onPress }: PrimaryCTAProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: width * 0.7, // ~70% de la largeur écran
    paddingVertical: 16, // hauteur du bouton
    backgroundColor: Colors.secondary, // couleur principale
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000", // ombre pour iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // ombre Android
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
