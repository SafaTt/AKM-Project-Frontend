import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import LottieView from "lottie-react-native";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LimitMistakesModalProps {
  visible: boolean;
  onClose: () => void;
}

const LimitMistakesModal: React.FC<LimitMistakesModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Animation Lottie */}
          <LottieView
            source={require("@/assets/lottie/mistakes.json")}
            autoPlay
            loop={false}
            style={{ width: 150, height: 150, marginBottom: 20 }}
          />
          <Text style={styles.title}>Spiel beendet!</Text>
          <Text style={styles.message}>
            Die maximale Fehleranzahl wurde erreicht.
          </Text>

          <TouchableOpacity style={general_styles.closeBtn} onPress={onClose}>
            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LimitMistakesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.falsch,
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "400",
  },
});
