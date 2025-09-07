// app/ImprintScreen.tsx
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height, width } = Dimensions.get("window");
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1eIBSB2hs1mTiCSlzV5W6ai71TnJ-n3WTXY69SOdKLLo/export?format=csv&gid=0";

export default function ImprintScreen() {
  const [imprintData, setImprintData] = useState<{ [key: string]: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    const fetchImprint = async () => {
      try {
        const response = await fetch(CSV_URL);
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (result.data && result.data.length > 0) {
              setImprintData(result.data as { [key: string]: string }[]);
            }
            setLoading(false); // ✅ loader terminé
          },
        });
      } catch (err) {
        console.error("Erreur chargement Imprint:", err);
      }
    };

    fetchImprint();
  }, []);

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log("Tout le AsyncStorage a été vidé !");
      setConfirmDelete(false);
      router.back();
    } catch (err) {
      console.error("Erreur lors de la suppression des examens :", err);
    }
  };
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
          loop={true}
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
        <Image
          source={require("@/assets/images/generals/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Contenu scrollable */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {imprintData.map((row, index) => (
          <View key={index} style={styles.viewData}>
            {Object.entries(row).map(([key, value]) => {
              if (value === null || value === undefined) return null;
              return (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{key.toUpperCase()}</Text>
                  <Text style={styles.value}>{String(value)}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Bouton OK en bas */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.okButton} onPress={() => router.back()}>
          <Text style={styles.okText}>Verstanden</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.footer, { borderTopWidth: 0 }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setConfirmDelete(true)}
        >
          <Text style={[styles.okText, { color: Colors.secondary }]}>
            Setzen Sie die App zurück
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmation */}
      <Modal visible={confirmDelete} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sind Sie sicher?</Text>
            <Text style={styles.modalText}>
              Diese Aktion wird alle gespeicherten Quiz- und Prüfungshistorien
              löschen!
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.falsch }]}
                onPress={clearStorage}
              >
                <Text style={styles.modalButtonText}>Löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setConfirmDelete(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#333" }]}>
                  Abbrechen
                </Text>
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  scroll: {
    padding: 5,
  },
  viewData: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
  },
  row: {
    marginBottom: height * 0.015,
    padding: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderRadius: width * 0.03,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#222",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  okButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  okText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  logo: {
    width: 45,
    height: 45,
  },
  deleteButton: {
    borderColor: Colors.secondary,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
