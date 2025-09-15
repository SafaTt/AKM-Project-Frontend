import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");
// 🔹 Images
const quizImg = require("@/assets/images/generals/quiz.png");
const examImg = require("@/assets/images/generals/exam.png");

export default function Statistik() {
  const [selectedTab, setSelectedTab] = useState<"quizz" | "exam">("quizz");
  const [quizStats, setQuizStats] = useState<any[]>([]);
  const [examStats, setExamStats] = useState<any[]>([]);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [totalWrongAnswers, setTotalWrongAnswers] = useState(0);

  const currentData = selectedTab === "quizz" ? quizStats : examStats;

  const totalExams = examStats.length;
  const passedExams = examStats.filter((e) => e.passed).length;
  const failedExams = totalExams - passedExams;

  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          // 🔹 Charger tous les quizzes
          const keys = await AsyncStorage.getAllKeys();
          const quizKeys = keys.filter((k) => k.startsWith("quiz_"));

          let quizzes: any[] = [];
          let totalCorrect = 0;
          let totalWrong = 0;

          for (let i = 0; i < quizKeys.length; i++) {
            const key = quizKeys[i];
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
              const answers = JSON.parse(stored);
              const correct = answers.filter((a: any) => a.isCorrect).length;
              const wrong = answers.filter((a: any) => !a.isCorrect).length;
              totalCorrect += correct;
              totalWrong += wrong;

              quizzes.push({
                theme: `T ${i + 1}`,
                percent: Math.round((correct / answers.length) * 100),
                total: answers.length,
              });
            }
          }

          setQuizStats(quizzes);
          setTotalCorrectAnswers(totalCorrect);
          setTotalWrongAnswers(totalWrong);

          // 🔹 Charger les exams
          const storedExams = await AsyncStorage.getItem("allExams");
          const allExams = storedExams ? JSON.parse(storedExams) : [];

          const exams = allExams.map((exam: any, idx: number) => {
            const correct = exam.questions.filter(
              (q: any) => q.isCorrect
            ).length;
            const percent = Math.round((correct / exam.questions.length) * 100);

            return {
              title: `E ${idx + 1}`,
              percent,
              passed: exam.passed,
              elapsed: exam.elapsedTime,
            };
          });

          setExamStats(exams);
        } catch (err) {
          console.error("Erreur stats:", err);
        }
      };

      loadStats();
    }, [])
  );

  // Vérifier s'il y a des données
  const hasData =
    (selectedTab === "quizz" && quizStats.length > 0) ||
    (selectedTab === "exam" && examStats.length > 0);

  return (
    <View style={[general_styles.whiteContainer, { padding: 16 }]}>
      <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />
      {/* Header */}
      <View
        style={[
          general_styles.header,
          { marginTop: "10%", marginLeft: width * 0.03, marginBottom: "0%" },
        ]}
      >
        <TouchableOpacity
          style={{
            backgroundColor: Colors.vertClair,
            padding: 10,
            borderRadius: 25,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => router.push("/(tabs)/Home")}
        >
          <AntDesign name="home" size={24} color="black" />
          <Text style={{ marginLeft: width * 0.02, fontWeight: "500" }}>
            Home
          </Text>
        </TouchableOpacity>
      </View>
      {/* Onglets */}
      <View style={{ flexDirection: "row", marginBottom: 20, marginTop: "5%" }}>
        {[
          { key: "quizz", label: "Quiz", img: quizImg },
          { key: "exam", label: "Prüfung", img: examImg },
        ].map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                padding: 10,
                backgroundColor: isActive
                  ? Colors.secondary
                  : Colors.secondaryClair,
                borderRadius: 10,
                marginHorizontal: 5,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => setSelectedTab(tab.key as "quizz" | "exam")}
            >
              <Image
                source={tab.img}
                style={{ width: 40, height: 40, marginBottom: 6 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  textAlign: "center",
                  color: isActive ? "white" : "black",
                  fontWeight: isActive ? "700" : "400",
                  fontSize: 16,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView>
        {hasData ? (
          <>
            {/* BarChart */}
            <View style={general_styles.barView}>
              <BarChart
                data={currentData.map((item, idx) => ({
                  value: item.percent,
                  label: item.theme || item.title,
                  frontColor: item.percent >= 70 ? "#049c44" : "#CEF2DB",
                  barBorderRadius: 20,
                }))}
                barWidth={30}
                noOfSections={5}
                maxValue={100}
                showValuesAsTopLabel={false}
                yAxisLabelTexts={["0", "20", "40", "60", "80", "100"]}
                yAxisTextStyle={{ color: "#494848ff" }}
                // hideRules
              />
            </View>

            {/* Stats Cards */}
            {selectedTab === "exam" && examStats.length > 0 && (
              <View
                style={{
                  marginTop: width * 0.02,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {[
                  { label: "Gesamt", value: totalExams, icon: "📋" },
                  { label: "Bestanden", value: passedExams, icon: "🏆" },
                  { label: "Nicht bestanden", value: failedExams, icon: "⚠️" },
                ].map((stat, idx) => (
                  <LinearGradient
                    key={idx}
                    colors={["#CEF2DB", "#fff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      width: "32%",
                      marginBottom: 12,
                      padding: 16,
                      borderRadius: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 6 }}>
                      {stat.icon}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginBottom: 4,
                        color: "#004d40",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#004d40",
                      }}
                    >
                      {stat.value}
                    </Text>
                  </LinearGradient>
                ))}
              </View>
            )}

            {selectedTab === "quizz" && quizStats.length > 0 && (
              <View
                style={{
                  marginTop: width * 0.02,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {[
                  { label: "Gesamt", value: quizStats.length, icon: "📋" },
                  {
                    label: "Beste Antworten",
                    value: totalCorrectAnswers,
                    icon: "🏆",
                  },
                  {
                    label: "Falsche Antworten",
                    value: totalWrongAnswers,
                    icon: "⚠️",
                  },
                ].map((stat, idx) => (
                  <LinearGradient
                    key={idx}
                    colors={["#CEF2DB", "#fff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      width: "32%",
                      marginBottom: 12,
                      padding: 16,
                      borderRadius: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 6 }}>
                      {stat.icon}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginBottom: 4,
                        color: "#004d40",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#004d40",
                      }}
                    >
                      {stat.value}
                    </Text>
                  </LinearGradient>
                ))}
              </View>
            )}
            {/* Footer */}
            <View
              style={{
                marginTop: width * 0.01,
                padding: 16,
                backgroundColor: Colors.secondaryClair,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text
                style={{ textAlign: "center", fontWeight: "600", fontSize: 15 }}
              >
                <Text style={{ fontSize: 25 }}>⚡</Text>
                Mach weiter so! Du bist auf dem{`\n`}richtigen Weg.
              </Text>
            </View>
          </>
        ) : (
          <View
            style={{
              marginTop: 40,
              padding: 20,
              backgroundColor: Colors.secondaryClair,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 16, color: "#004d40", textAlign: "center" }}
            >
              Statistiken sind derzeit nicht verfügbar!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
