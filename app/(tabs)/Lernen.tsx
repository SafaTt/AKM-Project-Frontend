import { Colors } from "@/constants/Colors";
import { general_styles } from "@/constants/General_styles";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import * as Papa from "papaparse";
import { useCallback, useState } from "react";
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
      boxes: number[]; // stack 1 → stack 5
      url: any;
      selectedStack: number | null; // stack sélectionné pour ce thème
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
                selectedStack: number | null;
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
                    let boxes = [validRows.length, 0, 0, 0, 0]; // toutes les questions dans la première carte

                    answers.forEach((a: any) => {
                      const stack = a.stack || 1;

                      // Retirer la question de la première carte et la mettre dans la bonne pile
                      if (stack === 1) {
                        // déjà comptée dans la première carte, rien à changer
                      } else {
                        boxes[0] -= 1; // on enlève de la carte 1
                        boxes[stack - 1] += 1; // on ajoute dans la carte correspondante
                      }
                    });

                    resolve({
                      title: file.title,
                      questions: validRows.length,
                      progress,
                      boxes,
                      url: file.url,
                      selectedStack: null,
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

  // 🔹 Sélectionner un stack pour un thème spécifique
  const handleStackSelect = (topicIndex: number, stackIndex: number) => {
    setTopics((prev) =>
      prev.map((t, i) =>
        i === topicIndex
          ? {
              ...t,
              selectedStack:
                t.selectedStack === stackIndex + 1 ? null : stackIndex + 1,
            }
          : t
      )
    );
  };

  return (
    <View style={general_styles.container}>
      <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />
      {/* Header */}
      <View
        style={[
          general_styles.header,
          { marginTop: "12%", marginLeft: width * 0.03, marginBottom: "0%" },
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
      <View style={[general_styles.whiteView, { flex: 1, marginTop: "0%" }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: height * 0.05 }}
        >
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
                loop
                style={{ width: 200, height: 200, marginRight: width * 0.1 }}
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
            topics.map((topic, topicIndex) => {
              const stackColors = [
                "#D32F2F77",
                "#fa8333aa",
                "#ffea4d77",
                "#a6ff4d77",
                "#049c4477",
              ];

              const filteredBoxes = topic.boxes;

              return (
                <View key={topicIndex} style={general_styles.topicCard}>
                  <Text style={general_styles.topicTitle}>{topic.title}</Text>
                  <Text style={general_styles.questionCount}>
                    {topic.questions} Fragen
                  </Text>
                  <ProgressBar
                    progress={topic.progress}
                    color={Colors.secondary}
                    style={general_styles.progressBar}
                  />

                  <View style={general_styles.boxesContainer}>
                    {filteredBoxes.map((count, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          general_styles.box,
                          {
                            backgroundColor: stackColors[i],
                            borderWidth: topic.selectedStack === i + 1 ? 2 : 0,
                            borderColor: Colors.secondary,
                            opacity: count === 0 ? 0.5 : 1,
                          },
                        ]}
                        onPress={() =>
                          count > 0 && handleStackSelect(topicIndex, i)
                        }
                        disabled={count === 0}
                      >
                        <Text style={general_styles.boxText}>{count}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "../Quiz/Quizz",
                        params: {
                          topicName: topic.title,
                          topicUrl: topic.url,
                          stack: topic.selectedStack || null,
                        },
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
                      style={general_styles.startButton}
                    >
                      <Text style={general_styles.startButtonText}>
                        Start Lernkarten
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}
