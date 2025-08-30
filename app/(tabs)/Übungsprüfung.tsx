import { general_styles } from "@/constants/General_styles";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ÜbungsprüfungIntro() {
  const router = useRouter();

  const startExam = () => {
    router.push("../Quiz/ExamQuizz"); // redirige vers le composant d'examen
    console.log("start exam");
  };

  return (
    <View style={general_styles.container}>
      <View
        style={[
          general_styles.whiteView,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Image
          source={require("@/assets/images/exam2.png")}
          style={general_styles.iconImg}
        />
        <TouchableOpacity
          style={[general_styles.startButton, { width: "90%", marginTop: 10 }]}
          onPress={startExam}
        >
          <Text style={general_styles.startButtonText}>Start Exam</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
