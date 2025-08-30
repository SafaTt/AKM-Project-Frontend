import { Colors } from "@/constants/Colors";
import LottieView from "lottie-react-native";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface RichtigModalProps {
  visible: boolean;
  correctAnswer: string;
  onClose: () => void;
}

const RichtigModal: React.FC<RichtigModalProps> = ({
  visible,
  correctAnswer,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Animation Lottie */}
          <LottieView
            source={require("@/assets/lottie/incorrect.json")} // mets ton fichier lottie ici
            autoPlay
            loop={false}
            style={{ width: 150, height: 150, marginBottom: 20 }}
          />

          <Text style={styles.title}>Falsch Antwort!</Text>
          <Text style={styles.answer}>
            Die richtige Antwort ist: {correctAnswer}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default RichtigModal;

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
  answer: { fontSize: 16, textAlign: "center", marginBottom: 20 },
});
