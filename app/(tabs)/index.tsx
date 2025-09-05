import PrimaryCTA from "@/components/PrimaryCTA";
import ProgressDisplay from "@/components/ProgressDisplay";
import SecondaryCTAs from "@/components/SecondaryCTAs";
import { general_styles } from "@/constants/General_styles";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
    <View style={general_styles.containerUI}>
      <View style={general_styles.rowView}>
        <Image
          source={require("../../assets/images/generals/logo.png")}
          style={general_styles.brandLogo}
        />
        <Text style={general_styles.brandTitle}>Fischerprüfung Bayern</Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={general_styles.whiteView}>
        {/* Cercle de progression */}
        <ProgressDisplay progress={overallProgress} />

        {/* CTA principal */}
        <PrimaryCTA
          title="Übungsprüfung"
          onPress={() => console.log("Übungsprüfung")}
        />

        {/* CTA secondaires */}
        <SecondaryCTAs
          onPressKategorien={() => console.log("Kategorien")}
          onPressStatistik={() => console.log("Statistik")}
          onPressEinstellungen={() => console.log("Einstellungen")}
        />
      </View>
    </View>
  );
}
