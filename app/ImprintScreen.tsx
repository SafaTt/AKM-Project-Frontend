// app/ImprintScreen.tsx
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height, width } = Dimensions.get("window");
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1eIBSB2hs1mTiCSlzV5W6ai71TnJ-n3WTXY69SOdKLLo/export?format=csv&gid=0";

export default function ImprintScreen() {
  const [imprintText, setImprintText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchImprint = async () => {
      try {
        const response = await fetch(CSV_URL);
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result: any) => {
            if (result.data && result.data.length > 0) {
              // Concatène toutes les valeurs en une seule chaîne
              const combinedText = result.data
                .map((row: any) =>
                  Object.values(row)
                    .filter((v) => v)
                    .join("\n")
                )
                .join("\n\n");
              setImprintText(combinedText);
            }
            setLoading(false);
          },
        });
      } catch (err) {
        console.error("Erreur chargement Imprint:", err);
        setLoading(false);
      }
    };
    fetchImprint();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          },
        ]}
      >
        <LottieView
          source={require("@/assets/lottie/loading.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200, marginRight: width * 0.1 }}
        />
        <Text
          style={{
            marginTop: 10,
            fontWeight: "600",
            fontSize: 15,
            textAlign: "center",
          }}
        >
          Informationen zum Laden...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Impressum</Text>
      </View>

      {/* Champ éditable */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.textContainer}>
          <TextInput
            editable={false}
            style={styles.textInput}
            multiline
            value={imprintText}
            onChangeText={setImprintText}
          />
        </View>
      </ScrollView>

      {/* Bouton OK */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.okButton} onPress={() => router.back()}>
          <Text style={styles.okText}>Verstanden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: height * 0.02,
    height: height * 0.1,
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  scroll: { padding: 16 },
  textContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  textInput: {
    minHeight: 300,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    height: height * 0.2,
  },
  okButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  okText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
