import FalschModal from "@/components/FalschModal";
import RichtigModal from "@/components/RichtigModal";
import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Papa from "papaparse";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type Question = {
  Nummer: string;
  Frage: string;
  "Antwort A": string;
  "Antwort B": string;
  "Antwort C": string;
  "Richtige Antwort": string;
  "Bild URL"?: string;
};

const Quizz: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicName = (params.topicName as string) || "unknown_topic";
  const topicUrl = (params.topicUrl as string) || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showRichtig, setShowRichtig] = useState(false);
  const [showFalsch, setShowFalsch] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Animated value pour la barre
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(topicUrl);
        const text = await res.text();

        Papa.parse<Question>(text, {
          header: true,
          skipEmptyLines: true,
          complete: (parsed) => {
            const valid = (parsed.data || []).filter(
              (row) => row.Frage && row.Frage.trim() !== ""
            );
            setQuestions(valid);
          },
        });
      } catch (error) {
        console.error("Fehler beim Laden des Quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    if (topicUrl && topicName) fetchQuestions();
    else setLoading(false);
  }, [topicUrl, topicName]);

  // Anime la barre quand answeredCount change
  useEffect(() => {
    const target = questions.length ? answeredCount / questions.length : 0;
    Animated.timing(animatedProgress, {
      toValue: target,
      duration: 500, // durée de l'animation (ajuste si tu veux plus lent/rapide)
      useNativeDriver: false,
    }).start();
  }, [answeredCount, questions.length, animatedProgress]);

  // load previoux answer
  const loadPreviousAnswer = async (index: number) => {
    const key = `quiz_${topicName}`;
    const stored = await AsyncStorage.getItem(key);
    const answers = stored ? JSON.parse(stored) : [];

    const prevQuestion = questions[index];
    if (!prevQuestion) return;

    const prevAnswer = answers.find(
      (a: any) => a.question === prevQuestion.Frage
    );

    if (prevAnswer) {
      const answer = prevAnswer.userAnswer || prevAnswer.selected || null;
      setSelectedOption(answer);
    } else {
      setSelectedOption(null);
    }
  };

  const handlePrev = async () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      await loadPreviousAnswer(newIndex); // ✅ recharge réponse SEULEMENT sur Zurück
    }
  };

  const handleAnswer = async (userAnswer: string, rightAnswer: string) => {
    setCorrectAnswer(rightAnswer);

    if (userAnswer === rightAnswer) {
      setIsAnswerCorrect(true);
      setShowRichtig(true);
    } else {
      setIsAnswerCorrect(false);
      setShowFalsch(true);
    }

    // Sauvegarde réponse + passage automatique à la question suivante après 2 sec
    await saveAnswer(userAnswer, rightAnswer);

    setTimeout(() => {
      setShowRichtig(false);
      setShowFalsch(false);
      setIsAnswerCorrect(null);
      handleNext();
    }, 1000);
  };

  const saveAnswer = async (userAnswer: string, rightAnswer: string) => {
    const key = `quiz_${topicName}`;
    const stored = await AsyncStorage.getItem(key);
    let answers = stored ? JSON.parse(stored) : [];

    const currentQuestion = questions[currentIndex];

    const answerData = {
      themeTitle: topicName,
      themeUrl: topicUrl, // récupéré depuis le parent
      question: currentQuestion.Frage,
      userAnswer,
      isCorrect: userAnswer === rightAnswer,
    };

    answers.push(answerData);

    await AsyncStorage.setItem(key, JSON.stringify(answers));

    // ✅ Incrémenter la barre
    setAnsweredCount((prev) => prev + 1);
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("../aps/(tabs)/Lernen");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text>Lädt Quiz...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <Text>Keine Fragen gefunden.</Text>
      </View>
    );
  }

  const current = questions[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View style={general_styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        {/* Barre de progression custom animée */}
        <View style={styles.progressWrapper}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                // animate la largeur en pourcentage
                width: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.question}>{current.Frage}</Text>

      {current["Bild URL"] ? (
        <Image source={{ uri: current["Bild URL"] }} style={styles.image} />
      ) : null}

      {["A", "B", "C"].map((opt) => {
        const isSelected = selectedOption === opt;
        let borderColor = "#ccc";

        if (isSelected) {
          if (isAnswerCorrect === true && opt === correctAnswer) {
            borderColor = Colors.secondary;
          } else if (isAnswerCorrect === false && opt === selectedOption) {
            borderColor = Colors.falsch;
          }
        }

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.option, { borderColor }]}
            onPress={() => {
              setSelectedOption(opt);
              handleAnswer(opt, current["Richtige Antwort"]);
            }}
          >
            <Text style={styles.optionText}>
              {opt}: {current[`Antwort ${opt}` as keyof Question]}
            </Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          {
            backgroundColor:
              selectedOption && isAnswerCorrect === false
                ? Colors.falsch
                : selectedOption && isAnswerCorrect === true
                ? Colors.secondary
                : "#ccc",
          },
        ]}
        onPress={handleNext}
        disabled={!selectedOption}
      >
        <Text style={styles.nextText}>Weiter</Text>
      </TouchableOpacity>

      {currentIndex > 0 && (
        <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
          <Text style={styles.prevText}>Zurück</Text>
        </TouchableOpacity>
      )}

      <RichtigModal
        visible={showRichtig}
        correctAnswer={correctAnswer}
        onClose={() => setShowRichtig(false)}
      />

      <FalschModal
        visible={showFalsch}
        correctAnswer={correctAnswer}
        onClose={() => setShowFalsch(false)}
      />
    </View>
  );
};

export default Quizz;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },

  question: {
    fontSize: 20,
    color: "black",
    marginBottom: height * 0.03,
    fontWeight: "500",
    lineHeight: 30,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    marginBottom: 16,
  },
  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: width * 0.1,
    marginBottom: 10,
  },
  optionText: { fontSize: 16, color: "black" },
  nextBtn: {
    marginTop: "auto",
    padding: 16,
    borderRadius: width * 0.1,
    alignItems: "center",
    marginBottom: height * 0.05,
  },
  nextText: { fontSize: 16, color: "white", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // styles pour la progress bar custom
  progressWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginLeft: 12,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 6,
    width: "0%", // animé via Animated.View
  },
  prevBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: width * 0.1,
    alignItems: "center",
    marginBottom: height * 0.05,
    marginTop: -(height * 0.01),
  },
  prevText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
