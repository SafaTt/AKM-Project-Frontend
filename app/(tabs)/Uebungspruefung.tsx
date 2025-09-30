import { general_styles } from "@/constants/General_styles";
import {
  AntDesign,
  Entypo,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StoredExam } from "../Quiz/ExamQuizz";

const { height, width } = Dimensions.get("window");

export default function ÜbungsprüfungIntro() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [exams, setExams] = useState<StoredExam[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadExams = async () => {
        try {
          // const currentRaw = await AsyncStorage.getItem("currentExam");
          const finishedRaw = await AsyncStorage.getItem("allExams");

          // const currentExam: StoredExam | null = currentRaw
          //   ? JSON.parse(currentRaw)
          //   : null;
          const finishedExams: StoredExam[] = finishedRaw
            ? JSON.parse(finishedRaw)
            : [];

          // Combiner les examens finis + examen en cours
          const combined: StoredExam[] = [...finishedExams];
          // if (currentExam) combined.unshift(currentExam); // en cours en premier

          // Trier par currentIndex croissant (examen en cours peut avoir 0)
          // combined.sort((a, b) => a.currentIndex - b.currentIndex);
          combined.sort((a, b) => b.currentIndex - a.currentIndex);

          setExams(combined);
        } catch (err) {
          console.error("Erreur récupération exams :", err);
        } finally {
          setLoading(false);
        }
      };

      loadExams();
    }, [])
  );

  const startExam = () => {
    router.push("../Quiz/ExamQuizz");
  };

  const formatTime = (exam: StoredExam) => {
    if (exam.statusExam === "fini" && exam.elapsedTime !== undefined) {
      const m = Math.floor(exam.elapsedTime / 60);
      const s = exam.elapsedTime % 60;
      return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    } else {
      const elapsed = Math.floor((Date.now() - exam.startedAt) / 1000);
      const total = elapsed + exam.secondsLeft;
      const m = Math.floor(total / 60);
      const s = total % 60;
      return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
  };

  const getExamStats = (exam: StoredExam) => {
    const answered = exam.questions.filter((q) => q.userAnswer !== null).length;
    const correct = exam.questions.filter((q) => q.isCorrect).length;
    const percentage = Math.round((correct / exam.questions.length) * 100);
    const passed = exam.statusExam === "fini" ? percentage >= 70 : null;
    return { answered, percentage, passed };
  };

  if (loading) return <Text>Laden...</Text>;

  return (
    <View style={general_styles.container}>
      <View
        style={[
          general_styles.whiteView,
          !exams.length && { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />

        {!exams.length ? (
          <>
            <Image
              source={require("@/assets/images/examen.png")}
              style={general_styles.iconImg}
            />
            <TouchableOpacity
              onPress={startExam}
              activeOpacity={0.8}
              style={general_styles.startButton}
            >
              <LinearGradient
                colors={["#e7f5ecff", "#CEF2DB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  general_styles.startButton,
                  { width: "90%", marginTop: 10 },
                ]}
              >
                <Text style={general_styles.startButtonText}>
                  Prüfung starten
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignSelf: "flex-end",
                padding: 10,
                marginRight: width * 0.01,
                marginTop: insets.top,
              }}
              onPress={startExam}
            >
              <Text
                style={[
                  general_styles.startButtonText,
                  { textDecorationLine: "underline" },
                ]}
              >
                Neue Übungsprüfung starten
              </Text>
              <AntDesign
                name="pluscircleo"
                size={24}
                color="black"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>

            <ScrollView style={{ width: "100%" }}>
              {exams.map((exam, idx) => {
                const stats = getExamStats(exam);

                return (
                  <View
                    key={exam.currentIndex || idx}
                    style={{
                      width: "90%",
                      backgroundColor: "white",
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 3,
                      marginTop: height * 0.01,
                      alignSelf: "center",
                      marginBottom: height * 0.01,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
                      Prüfung {exam.currentIndex}
                    </Text>

                    <View style={{ flexDirection: "row" }}>
                      <FontAwesome6
                        name="circle-question"
                        size={21}
                        color="black"
                      />
                      <Text style={{ marginLeft: 10 }}>
                        {stats.answered} / {exam.questions.length} Fragen
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                      <Entypo name="back-in-time" size={24} color="black" />
                      <Text style={{ marginLeft: 10 }}>
                        Verstrichene Zeit: {formatTime(exam)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                      <MaterialIcons name="star-rate" size={24} color="black" />
                      <Text style={{ marginLeft: 10 }}>
                        Erfolgsquote: {stats.percentage}%
                      </Text>
                    </View>

                    {/* <Text style={{ marginLeft: 10 }}>{exam.statusExam}</Text> */}
                    {exam.statusExam === "fini" ? (
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        {exam.passed ? (
                          <MaterialCommunityIcons
                            name="emoticon-happy-outline"
                            size={24}
                            color="green"
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="emoticon-sad-outline"
                            size={24}
                            color="red"
                          />
                        )}
                        <Text style={{ marginLeft: 10 }}>
                          {exam.passed ? "Erfolg" : "Misserfolg"}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <MaterialCommunityIcons
                          name="progress-clock"
                          size={24}
                          color="orange"
                        />
                        <Text style={{ marginLeft: 10 }}>Nicht beendet</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* <TouchableOpacity
                style={[
                  general_styles.closeBtn,
                  {
                    marginTop: 20,
                    backgroundColor: "red",
                    alignSelf: "center",
                  },
                ]}
                onPress={clearAllExams}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Alle Prüfungen löschen
                </Text>
              </TouchableOpacity> */}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}
