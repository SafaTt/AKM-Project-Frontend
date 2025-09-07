import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import * as Papa from "papaparse";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProgressBar } from "react-native-paper";

const { width, height } = Dimensions.get("window");
interface QuestionRow {
  Nummer: string;
  Frage: string;
  "Antwort A": string;
  "Antwort B": string;
  "Antwort C": string;
  "Richtige Antwort": string;
  "Bild URL"?: string;
}

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

export default function Lernen() {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<
    {
      title: string;
      questions: number;
      progress: number;
      boxes: number[];
      url: any;
    }[]
  >([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        try {
          const results = await Promise.all(
            csvFiles.map(async (file) => {
              const response = await fetch(file.url);
              const text = await response.text();

              return new Promise<{
                title: string;
                questions: number;
                progress: number;
                boxes: number[];
                url: any;
              }>((resolve) => {
                Papa.parse<QuestionRow>(text, {
                  header: true,
                  skipEmptyLines: true,
                  complete: async (parsed) => {
                    const validRows = parsed.data.filter(
                      (row) => row.Frage?.trim().length > 0
                    );
                    const key = `quiz_${file.title}`;
                    const stored = await AsyncStorage.getItem(key);
                    const answers = stored ? JSON.parse(stored) : [];
                    const progress = answers.length / validRows.length;

                    let boxes = [0, 0, 0, 0, 0];
                    answers.forEach((a: any) => {
                      if (a.isCorrect) boxes[1] += 1;
                      else boxes[0] += 1;
                    });

                    resolve({
                      title: file.title,
                      questions: validRows.length,
                      progress,
                      boxes,
                      url: file.url,
                    });
                  },
                });
              });
            })
          );

          setTopics(results);
        } catch (err) {
          console.error("Erreur CSV:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProgress();
    }, [])
  );

  //chargé les donnée du localstorage
  useEffect(() => {
    const fetchCSVAndProgress = async () => {
      try {
        const promises = csvFiles.map(async (file) => {
          const response = await fetch(file.url);
          const text = await response.text();

          return new Promise<{
            title: string;
            questions: number;
            progress: number;
            boxes: number[];
            url: any;
          }>(async (resolve) => {
            Papa.parse<QuestionRow>(text, {
              header: true,
              skipEmptyLines: true,
              complete: async (parsed) => {
                const validRows = parsed.data.filter(
                  (row) => row.Frage && row.Frage.trim().length > 0
                );

                // 🔹 Charger réponses utilisateur depuis AsyncStorage
                const key = `quiz_${file.title}`;
                const stored = await AsyncStorage.getItem(key);
                const answers = stored ? JSON.parse(stored) : [];

                // 🔹 Calcul progression
                const progress = answers.length / validRows.length;

                // 🔹 Calcul des boxes (ici très simplifié : Box1 = total - réponses correctes, Box2 = réponses correctes)
                let boxes = [0, 0, 0, 0, 0];
                answers.forEach((a: any) => {
                  if (a.isCorrect) {
                    boxes[1] += 1; // en vrai → avancer dans la box suivante
                  } else {
                    boxes[0] += 1;
                  }
                });

                resolve({
                  title: file.title,
                  questions: validRows.length,
                  progress,
                  boxes,
                  url: file.url,
                });
              },
            });
          });
        });

        const results = await Promise.all(promises);
        setTopics(results);
      } catch (err) {
        console.error("Erreur CSV:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCSVAndProgress();
  }, []);

  return (
    <View style={general_styles.container}>
      <View style={[general_styles.whiteView]}>
        <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: height * 0.3,
              }}
            >
              <LottieView
                source={require("@/assets/lottie/loading.json")}
                autoPlay
                loop={true}
                style={{ width: 150, height: 150, marginRight: width * 0.1 }}
              />
              <Text
                style={{
                  marginTop: 10,
                  fontWeight: "600",
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                Informationen zum Laden...
              </Text>
            </View>
          ) : (
            topics.map((topic, index) => (
              <View key={index} style={general_styles.topicCard}>
                <Text style={general_styles.topicTitle}>{topic.title}</Text>
                <Text style={general_styles.questionCount}>
                  {topic.questions} Fragen
                </Text>
                {/* Barre de progression */}
                <ProgressBar
                  progress={topic.progress}
                  color={Colors.secondary}
                  style={general_styles.progressBar}
                />
                {/* Boîtes */}
                <View style={general_styles.boxesContainer}>
                  {topic.boxes.map((count, i) => (
                    <View key={i} style={general_styles.box}>
                      <Text style={general_styles.boxText}>{count}</Text>
                    </View>
                  ))}
                </View>
                {/* CTA */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "../Quiz/Quizz",
                      params: { topicName: topic.title, topicUrl: topic.url },
                    })
                  }
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <LinearGradient
                    colors={["#e7f5ecff", "#CEF2DB"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={general_styles.startButton} // garder le style existant
                  >
                    <Text style={general_styles.startButtonText}>
                      Start Flashcards
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
