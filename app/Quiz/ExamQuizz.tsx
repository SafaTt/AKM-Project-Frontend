import LimitMistakesModal from "@/components/LimitMistakesModal";
import ResultModal from "@/components/ResultModal";
import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Papa from "papaparse";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const csvFiles = [
  {
    title: "Fischkunde",
    url: "https://docs.google.com/spreadsheets/d/1bLiUoPc9gIcj-TPUsabXMrT1Chz1MRi9QukXTvqNhxw/export?format=csv&gid=911575723",
  },
  {
    title: "Gewässerkunde",
    url: "https://docs.google.com/spreadsheets/d/1uqbhOz53DaG3kGAFLM6yHCSIG7UKFw9D_L6Kl9E_-8g/export?format=csv&gid=167489100",
  },
  {
    title: "Schutz und Pflege der Fischgewässer",
    url: "https://docs.google.com/spreadsheets/d/1VSemyEnXJPp_COiaaDdArS2CLEyR-B2IRpN-XbOmQvk/export?format=csv&gid=1839442498",
  },
  {
    title: "Fanggeräte, Praxis, Behandlung gefangener Fische",
    url: "https://docs.google.com/spreadsheets/d/1kFpehL97CkibyAQhMlHE9T85PV0TCdpkJV2tkCR3i_s/export?format=csv&gid=501568072",
  },
  {
    title: "Rechtsvorschriften",
    url: "https://docs.google.com/spreadsheets/d/1BSnjNZsmvqBJL3iznBr_DkqTnx7U6orJwcLNA7ce7xg/export?format=csv&gid=1121871738",
  },
];

type Question = {
  Frage: string;
  "Antwort A": string;
  "Antwort B": string;
  "Antwort C": string;
  "Richtige Antwort": string;
  Thema: string; // pour savoir de quel CSV ça vient
};

export type StoredExam = {
  currentIndex: number;
  questions: (Question & {
    userAnswer: string | null;
    isCorrect: boolean | null;
  })[];
  startedAt: number; // timestamp du début
  secondsLeft: number; // compte à rebours restant (utile si exam en cours)
  elapsedTime?: number;
  statusExam: "encours" | "fini";
  passed: boolean | null;
  wrongQuestions?: Question[];
};

// helper pour choisir N questions aléatoires
const getRandomSubset = (arr: Question[], n: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

export default function ExamQuizz() {
  const router = useRouter();

  const totalMinutes = 0.2;
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [mistakesOverall, setMistakesOverall] = useState(0);
  // const [timeoutVisible, setTimeoutVisible] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [limitMistakesVisible, setLimitMistakesVisible] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentExam, setCurrentExam] = useState<StoredExam | null>(null);

  // Timer
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  // Stop timer et finir l’exam dès que secondsLeft atteint 0
  useEffect(() => {
    if (secondsLeft <= 0 && questions.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      handleFinishExam(); // async hors du setter
    }
  }, [secondsLeft, questions]);

  // Fin si 15 fautes
  useEffect(() => {
    if (mistakesOverall === 15) {
      handleFinishExam();
      setLimitMistakesVisible(true);
    }
  }, [mistakesOverall]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const allQuestions: Question[] = [];
        for (let file of csvFiles) {
          const res = await fetch(file.url);
          const text = await res.text();
          const parsed = Papa.parse<Question>(text, {
            header: true,
            skipEmptyLines: true,
          });
          const selected = getRandomSubset(
            parsed.data.map((q) => ({ ...q, Thema: file.title })),
            12
          );
          allQuestions.push(...selected);
        }
        setQuestions(allQuestions);
        setAnswers(new Array(60).fill(null));
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement CSV:", err);
      }
    };
    loadQuestions();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const togglePause = () => setIsPaused((prev) => !prev);

  const handleNext = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === current["Richtige Antwort"];
    setIsAnswerCorrect(isCorrect);
    setShowResult(true);

    // Copie des réponses mises à jour
    const updated = [...answers];
    updated[currentIndex] = selectedOption;
    setAnswers(updated);

    // 🔹 Calcul des erreurs globales et par thème
    let mistakesOverallLocal = mistakesOverall;
    const mistakesPerTopic: Record<string, number> = {};

    questions.forEach((q, i) => {
      const ans = updated[i];
      if (ans && ans !== q["Richtige Antwort"]) {
        mistakesOverallLocal++;
        mistakesPerTopic[q.Thema] = (mistakesPerTopic[q.Thema] || 0) + 1;
      }
    });

    setMistakesOverall(mistakesOverallLocal);

    // 🔴 Vérification limite par thème
    const hasTopicLimit = Object.values(mistakesPerTopic).some((m) => m >= 6);
    if (!isCorrect && hasTopicLimit) {
      setLimitMistakesVisible(true);
      setTimeout(() => {
        setLimitMistakesVisible(false);
        handleFinishExam();
      }, 2500);
      return;
    }

    // 🔴 Vérification limite globale (déjà existante)
    if (!isCorrect && mistakesOverallLocal >= 15) {
      setLimitMistakesVisible(true);
      setTimeout(() => {
        setLimitMistakesVisible(false);
        handleFinishExam();
      }, 2500);
      return;
    }

    // Sauvegarde seulement si ce n’est PAS la dernière question
    if (currentIndex < questions.length - 1) {
      saveExam(updated, "encours");
    }

    // après 1s → prochaine question OU fin
    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setIsAnswerCorrect(null);
        setShowResult(false);
      } else {
        await handleFinishExam(); // ✅ fin normale
      }
    }, 1000);
  };

  const saveExam = async (
    answers: (string | null)[],
    statusExam: "encours" | "fini" = "encours"
  ): Promise<StoredExam | null> => {
    if (!questions.length) return null;

    const answeredQuestions = questions.map((q, i) => ({
      ...q,
      userAnswer: answers[i] ?? null,
      isCorrect: answers[i] === q["Richtige Antwort"],
    }));

    let passed: boolean | null = null;
    if (statusExam === "fini") {
      const correctCount = answeredQuestions.filter((q) => q.isCorrect).length;
      passed = (correctCount / answeredQuestions.length) * 100 >= 70;
    }

    const startedAt =
      currentExam?.startedAt ??
      Date.now() - (totalMinutes * 60 - secondsLeft) * 1000;

    const elapsedTime =
      statusExam === "fini"
        ? Math.floor((Date.now() - startedAt) / 1000)
        : undefined;

    const wrongQuestions = answeredQuestions.filter(
      (q) => q.isCorrect === false
    );

    const exam: StoredExam = {
      currentIndex: 0,
      secondsLeft,
      startedAt,
      elapsedTime,
      questions: answeredQuestions,
      statusExam, // 👈 "fini" ou "encours"
      passed,
      wrongQuestions,
    };

    try {
      if (statusExam === "fini") {
        const existing = await AsyncStorage.getItem("allExams");
        const allExams: StoredExam[] = existing ? JSON.parse(existing) : [];

        const maxIndex = allExams.length
          ? Math.max(...allExams.map((e) => e.currentIndex))
          : 0;
        exam.currentIndex = maxIndex + 1;

        allExams.push(exam);
        await AsyncStorage.setItem("allExams", JSON.stringify(allExams));
        await AsyncStorage.removeItem("currentExam");
      }
    } catch (err) {
      console.error("Erreur sauvegarde exam:", err);
    }

    return exam;
  };

  const handleFinishExam = async () => {
    // Stop timer
    if (intervalRef.current) clearInterval(intervalRef.current);

    // calcul des erreurs globales et par thème
    let mistakesOverallLocal = 0;
    const mistakesPerTopic: Record<string, number> = {};

    questions.forEach((q, i) => {
      const ans = answers[i];
      if (ans && ans !== q["Richtige Antwort"]) {
        mistakesOverallLocal++;
        mistakesPerTopic[q.Thema] = (mistakesPerTopic[q.Thema] || 0) + 1;
      }
    });

    setMistakesOverall(mistakesOverallLocal);

    // Sauvegarder l’examen avec status "fini"
    const examToShow = await saveExam(answers, "fini");

    // S’assurer que le state est mis à jour AVANT d’afficher le modal
    if (examToShow) {
      setCurrentExam(examToShow);
      setShowResultModal(true); // <-- modal ouvert ici
    }
  };

  const current = questions[currentIndex];

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ActivityIndicator size="large" color="green" />
        <Text>Fragen werden geladen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* Header */}
      <View style={general_styles.header}>
        <TouchableOpacity onPress={() => handleFinishExam()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Timer + Progress */}
      <View style={[general_styles.rowView, { marginTop: 0 }]}>
        <Text style={general_styles.nbFrageText}>
          Frage <Text style={{ fontSize: 16 }}>{currentIndex + 1}/60</Text>
        </Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <TouchableOpacity onPress={togglePause} style={{ marginLeft: 8 }}>
            <Ionicons
              name={isPaused ? "play-circle-outline" : "pause-circle-outline"}
              size={28}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mistakes */}
      <Text style={styles.falshText}>Fehler: {mistakesOverall} / 15</Text>

      {/* Question */}
      <View
        style={[general_styles.questionCart, { padding: 16, marginTop: 20 }]}
      >
        <Text style={styles.topicText}>Thema: {current.Thema}</Text>
        <Text style={styles.questionText}>{current.Frage}</Text>

        {["A", "B", "C"].map((opt) => {
          let borderColor = "#ccc";

          if (selectedOption === opt && !showResult) {
            borderColor = "black"; // 👈 étape 1
          }
          if (showResult && selectedOption === opt) {
            borderColor = isAnswerCorrect ? Colors.secondary : Colors.falsch; // 👈 étape 2
          }

          return (
            <TouchableOpacity
              key={opt}
              style={[styles.option, { borderColor }]}
              onPress={() => setSelectedOption(opt)}
              disabled={isPaused || showResult}
            >
              <Text style={styles.optionText}>
                {opt}: {current[`Antwort ${opt}` as keyof Question]}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Navigation */}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            {
              backgroundColor: !selectedOption
                ? "#ccc"
                : !showResult
                ? "black" // 👈 étape 1
                : isAnswerCorrect
                ? Colors.secondary
                : Colors.falsch, // 👈 étape 2
            },
          ]}
          onPress={handleNext}
          disabled={!selectedOption || isPaused || showResult}
        >
          <Text style={styles.nextText}>
            {currentIndex === questions.length - 1 ? "Abgeben" : "Weiter"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* <TimeoutModal
        visible={timeoutVisible}
        correctAnswer=""
        onClose={() => {
          handleFinishExam();
        }}
      /> */}
      <LimitMistakesModal
        visible={limitMistakesVisible}
        onClose={() => {
          handleFinishExam();
          setLimitMistakesVisible(false);
        }}
      />
      <ResultModal
        visible={showResultModal}
        exam={currentExam!}
        onClose={() => {
          setShowResultModal(false);
          setTimeout(() => router.back(), 200);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },
  timerContainer: { flexDirection: "row", alignItems: "center" },
  timerText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  questionText: { fontSize: 18, fontWeight: "500", marginBottom: 16 },
  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: width * 0.1,
    padding: 12,
    marginBottom: 10,
  },
  optionText: { fontSize: 16, color: "black" },
  nextBtn: {
    marginTop: "auto",
    padding: 16,
    borderRadius: width * 0.1,
    alignItems: "center",
    marginBottom: height * 0.01,
  },
  nextText: { fontSize: 16, fontWeight: "bold", color: "white" },
  prevBtn: {
    position: "absolute",
    bottom: height * 0.05,
    left: 20,
    padding: 12,
  },
  prevText: { fontSize: 14, color: "#333" },
  topicText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 8,
  },
  falshText: {
    textAlign: "center",
    color: Colors.falsch,
    alignSelf: "flex-end",
    fontSize: 16,
    fontWeight: "500",
    marginTop: height * 0.01,
    marginRight: width * 0.05,
  },
});
