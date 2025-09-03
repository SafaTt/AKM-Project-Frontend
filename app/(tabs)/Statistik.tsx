import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Statistik() {
  const [selectedTab, setSelectedTab] = useState<"quizz" | "exam">("quizz");

  return (
    <View style={general_styles.whiteContainer}>
      {/* Switch entre Quizz / Examens */}
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            selectedTab === "quizz" && { backgroundColor: Colors.primary },
          ]}
          onPress={() => setSelectedTab("quizz")}
        >
          <Text
            style={[
              styles.switchText,
              selectedTab === "quizz" && { color: "white" },
            ]}
          >
            Quizz
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchButton,
            selectedTab === "exam" && { backgroundColor: Colors.primary },
          ]}
          onPress={() => setSelectedTab("exam")}
        >
          <Text
            style={[
              styles.switchText,
              selectedTab === "exam" && { color: "white" },
            ]}
          >
            Examen
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu des stats */}
      <View style={{ flex: 1, marginTop: height * 0.02 }}>
        {selectedTab === "quizz" ? (
          <Text style={{ fontSize: width * 0.045 }}>
            📊 Statistiken für Quizz
          </Text>
        ) : (
          <Text style={{ fontSize: width * 0.045 }}>
            📊 Statistiken für Examen
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: height * 0.015, // 1.5% de la hauteur
  },
  switchButton: {
    paddingVertical: height * 0.01, // 1% de la hauteur
    paddingHorizontal: width * 0.05, // 5% de la largeur
    borderRadius: width * 0.05, // arrondi responsive
    backgroundColor: "#ccc",
    marginHorizontal: width * 0.02,
  },
  switchText: {
    fontWeight: "bold",
    fontSize: width * 0.04, // texte adaptatif
    color: "black",
  },
});
