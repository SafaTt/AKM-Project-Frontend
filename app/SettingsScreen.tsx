// app/SettingsScreen.tsx
import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1qTNa61g8pqEL71QfPYeJQRLu_u2SxoEFDWEaEiwajag/export?format=csv&gid=0";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<
    { section: string; content: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await fetch(CSV_URL);
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result: any) => {
            if (result.data && result.data.length > 0) {
              const parsedSections = result.data.map((row: any) => ({
                section: row.Section || "",
                content: row.Content || "",
              }));
              setSections(parsedSections);
            }
            setLoading(false);
          },
        });
      } catch (err) {
        console.error("Erreur chargement guide:", err);
        setLoading(false);
      }
    };
    fetchGuide();
  }, []);

  const resetApp = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LottieView
          source={require("@/assets/lottie/loading.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={{ marginTop: 10, fontWeight: "600" }}>
          Daten werden geladen...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[general_styles.header, { marginTop: "8%" }]}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/Home")}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.guideContainer}>
          {sections.map((item, index) => (
            <View key={index} style={styles.section}>
              {item.section ? (
                <Text style={styles.sectionTitle}>{item.section}</Text>
              ) : null}
              <Text style={styles.sectionContent}>{item.content}</Text>
              <View style={styles.separator} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
          <MaterialIcons
            name="cleaning-services"
            size={24}
            color={Colors.secondary}
          />
          <Text style={styles.resetText}>App zurücksetzen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { padding: 16, paddingBottom: 16 },
  guideContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  sectionContent: { fontSize: 14, color: "#333", lineHeight: 20 },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    marginBottom: "10%",
  },
  resetButton: {
    borderColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  resetText: {
    color: Colors.secondary,
    fontWeight: "700",
    fontSize: 16,
    marginLeft: "1%",
  },
});
