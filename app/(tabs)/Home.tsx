import ProgressDisplay from "@/components/ProgressDisplay";
import SecondaryCTAs from "@/components/SecondaryCTAs";
import { general_styles } from "@/constants/General_styles";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
export default function HomeScreen() {
  const [overallProgress, setOverallProgress] = useState(0);
  useFocusEffect(
    useCallback(() => {
      const calculateProgress = async () => {
        try {
          // 🔹 Charger tous les quizzes
          const keys = await AsyncStorage.getAllKeys();
          const quizKeys = keys.filter((k) => k.startsWith("quiz_"));
          let totalQuestions = 0;
          let totalCorrect = 0;

          for (let key of quizKeys) {
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
              const answers = JSON.parse(stored);
              totalQuestions += answers.length;
              totalCorrect += answers.filter((a: any) => a.isCorrect).length;
            }
          }

          // 🔹 Charger les exams
          const storedExams = await AsyncStorage.getItem("allExams");
          const allExams = storedExams ? JSON.parse(storedExams) : [];
          for (let exam of allExams) {
            totalQuestions += exam.questions.length;
            totalCorrect += exam.questions.filter(
              (q: any) => q.isCorrect
            ).length;
          }

          // 🔹 Calcul de l'overall progress
          const progress =
            totalQuestions > 0
              ? Math.round((totalCorrect / totalQuestions) * 100)
              : 0;
          setOverallProgress(progress);
        } catch (err) {
          console.error("Erreur calcul progress:", err);
        }
      };

      calculateProgress();
    }, [])
  );

  return (
    <View style={general_styles.container}>
      <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />

      <View style={general_styles.rowView}>
        <Image
          source={require("../../assets/images/generals/logo.png")}
          style={general_styles.brandLogo}
        />
        <Text style={general_styles.brandTitle}>Fischerprüfung Bayern</Text>
        <TouchableOpacity onPress={() => router.push("/SettingsScreen")}>
          <Feather name="settings" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <View style={[general_styles.whiteView, { marginTop: height * 0.01 }]}>
        {/* Cercle de progression */}
        <View style={[styles.progressContainer]}>
          <Text style={styles.progressLabel}>GESAMTFORTSCHRITT</Text>
          <ProgressDisplay progress={overallProgress} />
        </View>

        {/* CTA secondaires */}
        <SecondaryCTAs
          onPressKategorien={() => router.push("/Lernen")}
          onPressStatistik={() => router.push("/Statistik")}
          onPressEinstellungen={() => router.push("/ImprintScreen")}
          onPressUbungsprufung={() => router.push("/Quiz/ExamQuizz")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    padding: 20,
    borderRadius: 25,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
    width: "95%",
    alignSelf: "center",
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  primaryContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  secondaryContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  gradientView: {
    width: "95%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    padding: 20,
    borderRadius: width * 0.15,
    marginTop: height * 0.03,
  },
});
