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

type StoredExam = {
  currentIndex: number; // index actuel
  questions: (Question & {
    userAnswer: string | null;
    isCorrect: boolean | null;
  })[];
  startedAt: number; // timestamp
  secondsLeft: number;
};

// helper pour choisir N questions aléatoires
const getRandomSubset = (arr: Question[], n: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

export default function ExamQuizz() {
  const router = useRouter();

  const totalMinutes = 60;
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

  const [showResult, setShowResult] = useState(false); // 👈 étape 2

  // Timer
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

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
    setShowResult(true); // 👈 on affiche les couleurs correct/incorrect

    if (!isCorrect) {
      setMistakesOverall((prev) => prev + 1);
    }

    // sauvegarde réponse
    const updated = [...answers];
    updated[currentIndex] = selectedOption;
    setAnswers(updated);
    saveExam(currentIndex, updated);

    // après 1.5s → prochaine question
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null); // reset choix
        setIsAnswerCorrect(null);
        setShowResult(false);
      } else {
        handleFinishExam();
      }
    }, 1500);
  };

  const handleFinishExam = () => {
    let mistakesOverall = 0;
    const mistakesPerTopic: Record<string, number> = {};

    questions.forEach((q, i) => {
      const ans = answers[i];
      if (ans && ans !== q["Richtige Antwort"]) {
        mistakesOverall++;
        mistakesPerTopic[q.Thema] = (mistakesPerTopic[q.Thema] || 0) + 1;
      }
    });

    const failByTopic = Object.values(mistakesPerTopic).some((m) => m > 6);
    const failOverall = mistakesOverall > 15;
    const passed = !failByTopic && !failOverall;

    console.log("result", String(passed), mistakesOverall);
  };

  const saveExam = async (index: number, answers: (string | null)[]) => {
    const exam: StoredExam = {
      currentIndex: index,
      secondsLeft,
      startedAt: Date.now(),
      questions: questions.map((q, i) => ({
        ...q,
        userAnswer: answers[i],
        correctAnswer: q["Richtige Antwort"],
        isCorrect:
          answers[i] == null ? null : answers[i] === q["Richtige Antwort"],
      })),
    };
    try {
      await AsyncStorage.setItem("currentExam", JSON.stringify(exam));
    } catch (err) {
      console.error("Erreur sauvegarde exam:", err);
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
        <ActivityIndicator size="large" color="green" />
        <Text>Fragen werden geladen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={general_styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
