import PrimaryCTA from "@/components/PrimaryCTA";
import ProgressDisplay from "@/components/ProgressDisplay";
import SecondaryCTAs from "@/components/SecondaryCTAs";
import { general_styles } from "@/constants/General_styles";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";
export default function HomeScreen() {
  const userProgress = 50;
  const handlePrimaryPress = () => {
    console.log("CTA principal pressé !");
    // Ici, navigation vers Übungsprüfung ou autre action
  };

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
        <ProgressDisplay progress={userProgress} />

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
