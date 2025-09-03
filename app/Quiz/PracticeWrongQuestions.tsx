import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type Question = {
  Frage: string;
  "Antwort A": string;
  "Antwort B": string;
  "Antwort C": string;
  "Richtige Antwort": string;
  Thema: string; // pour savoir de quel CSV ça vient
};
export default function PracticeWrongQuestions() {
  const router = useRouter();
  const navigation: any = useNavigation();

  const params = useLocalSearchParams<{ examIndex: string }>();
  const { examIndex } = params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isExerciceFinish, setIsExerciceFinish] = useState(false);
  useEffect(() => {
    const loadQuestions = async () => {
      if (!examIndex) return;
      const key = `practiceWrongQuestions_${examIndex}`;
      const raw = await AsyncStorage.getItem(key);
      if (raw) setQuestions(JSON.parse(raw));
    };
    loadQuestions();
  }, []);

  if (!questions.length) return <Text>Keine Übungsfragen verfügbar.</Text>;

  const current = questions[currentIndex];

  const handleNext = () => {
    if (!selectedOption) return;

    const correct = selectedOption === current["Richtige Antwort"];
    setIsAnswerCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      setSelectedOption(null);
      setShowResult(false);
      setIsAnswerCorrect(null);

      if (currentIndex < questions.length - 1)
        setCurrentIndex(currentIndex + 1);
      else setIsExerciceFinish(true);
    }, 1000);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* Header */}
      <View style={general_styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={{ fontWeight: "bold", fontSize: 18 }}>
        Frage {currentIndex + 1} / {questions.length}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "bold" }}>Thema: {current.Thema}</Text>
        <Text style={{ marginVertical: 10 }}>{current.Frage}</Text>

        {["A", "B", "C"].map((opt) => {
          let borderColor = "#ccc";
          if (selectedOption === opt && !showResult) borderColor = "black";
          if (showResult && selectedOption === opt)
            borderColor = isAnswerCorrect ? Colors.secondary : Colors.falsch;
          if (
            showResult &&
            !isAnswerCorrect &&
            current["Richtige Antwort"] === opt
          )
            borderColor = Colors.secondary;

          return (
            <TouchableOpacity
              key={opt}
              style={[styles.option, { borderColor }]}
              onPress={() => setSelectedOption(opt)}
              disabled={showResult}
            >
              <Text>
                {opt}: {current[`Antwort ${opt}` as keyof Question]}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
            <Text style={{ color: currentIndex === 0 ? "#ccc" : "black" }}>
              ← Zurück
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} disabled={!selectedOption}>
            <Text>Weiter →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de fin */}
      <Modal transparent visible={isExerciceFinish} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Übung abgeschlossen!</Text>
            <TouchableOpacity
              style={[
                general_styles.closeBtn,
                { backgroundColor: Colors.secondary },
              ]}
              onPress={() => router.replace("/(tabs)/Uebungspruefung")}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },
  option: {
    borderWidth: 2,
    padding: 12,
    marginVertical: 5,
    borderRadius: width * 0.1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: width * 0.8,
  },
  confirmText: { fontSize: 16, marginBottom: 16, textAlign: "center" },
});
