import { StoredExam } from "@/app/Quiz/ExamQuizz";
import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ResultModalProps {
  visible: boolean;
  exam: StoredExam;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  exam,
  onClose,
}) => {
  const [showSavedModal, setShowSavedModal] = useState(false);

  if (!exam) return null;

  // Calcul des erreurs par thème
  const mistakesPerTopic: Record<string, number> = {};
  exam.questions.forEach((q) => {
    if (q.userAnswer && q.userAnswer !== q["Richtige Antwort"]) {
      mistakesPerTopic[q.Thema] = (mistakesPerTopic[q.Thema] || 0) + 1;
    }
  });

  const totalQuestions = exam.questions.length;
  const correctAnswers = exam.questions.filter(
    (q) => q.userAnswer === q["Richtige Antwort"]
  ).length;

  const successRate = (correctAnswers / totalQuestions) * 100; // en %
  const minSuccessRate = 70; // seuil de réussite 70%

  // Vérification erreurs par thème
  const failByTopic = Object.values(mistakesPerTopic).some((m) => m > 6);

  // Résultat final
  const passed = successRate >= minSuccessRate && !failByTopic;

  // Créer un set de pratique pour les mauvaises réponses
  // ✅ Sauvegarde les questions fausses dans AsyncStorage
  const handlePracticeWrongQuestions = async () => {
    const wrongQuestions = exam.questions.filter(
      (q) => q.userAnswer && q.userAnswer !== q["Richtige Antwort"]
    );

    // Utilisation de l'index de l'examen généré dans saveExam
    const key = `practiceWrongQuestions_${exam.currentIndex}`;

    await AsyncStorage.setItem(key, JSON.stringify(wrongQuestions));

    // Au lieu d'un alert → on déclenche un modal de confirmation
    setShowSavedModal(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LottieView
            source={
              passed
                ? require("@/assets/lottie/premium.json")
                : require("@/assets/lottie/fail.json")
            }
            autoPlay
            loop={true}
            style={
              passed ? { width: 150, height: 150 } : { width: 130, height: 130 }
            }
          />

          <Text
            style={[
              styles.title,
              { color: passed ? Colors.secondary : Colors.falsch },
            ]}
          >
            {passed ? "BESTANDEN" : "NICHT BESTANDEN"}
          </Text>

          <Text style={styles.subtitle}>Fehlerübersicht pro Thema</Text>
          {Object.entries(mistakesPerTopic).map(([topic, count]) => (
            <Text key={topic} style={styles.topic}>
              {topic}: {count} Fehler
            </Text>
          ))}

          <Text style={styles.subtitle}>Alle Fragen</Text>
          <ScrollView style={{ maxHeight: 250, width: "100%" }}>
            {exam.questions.map((q, index) => (
              <View key={index} style={styles.questionRow}>
                <Text style={styles.questionText}>
                  {index + 1}. {q.Frage}
                </Text>
                <Text style={styles.answerText}>
                  Deine Antwort:{" "}
                  <Text
                    style={{
                      color:
                        q.userAnswer === q["Richtige Antwort"]
                          ? "green"
                          : "red",
                    }}
                  >
                    {q.userAnswer || "-"}
                  </Text>
                </Text>
                <Text style={styles.answerText}>
                  Richtige Antwort: {q["Richtige Antwort"]}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              general_styles.closeBtn,
              { marginTop: 10, backgroundColor: "#f39c12" },
            ]}
            onPress={handlePracticeWrongQuestions}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Falsche Fragen lernen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              general_styles.closeBtn,
              passed ? { backgroundColor: Colors.secondary } : null,
            ]}
            onPress={onClose}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSavedModal && (
        <Modal transparent animationType="fade" visible={showSavedModal}>
          <View style={styles.overlay}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                {
                  exam.questions.filter(
                    (q) =>
                      q.userAnswer && q.userAnswer !== q["Richtige Antwort"]
                  ).length
                }{" "}
                Fragen für Übung gespeichert!
              </Text>

              <TouchableOpacity
                style={[
                  general_styles.closeBtn,
                  { backgroundColor: Colors.secondary },
                ]}
                onPress={() => setShowSavedModal(false)}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

export default ResultModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  topic: { fontSize: 14, marginBottom: 3, alignSelf: "flex-start" },
  questionRow: {
    backgroundColor: "white",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    // Ombre iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Ombre Android
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  answerText: {
    fontSize: 14,
    marginBottom: 4,
  },

  confirmBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  confirmText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: Colors.primary,
  },
});
