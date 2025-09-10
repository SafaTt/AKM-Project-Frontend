import { Colors } from "@/constants/Colors";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface SecondaryCTAsProps {
  onPressKategorien?: () => void;
  onPressStatistik?: () => void;
  onPressEinstellungen?: () => void;
  onPressUbungsprufung?: () => void;
}

const SecondaryButton = ({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }], marginBottom: 15 }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#b5e0c5ff", "#effcf4ff"]}
          // colors={["#93daafff", "#CEF2DB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <View style={{ alignItems: "center" }}>
            {icon}
            <Text style={styles.text}>{title}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SecondaryCTAs({
  onPressKategorien,
  onPressStatistik,
  onPressEinstellungen,
  onPressUbungsprufung,
}: SecondaryCTAsProps) {
  return (
    <View style={styles.gridContainer}>
      <SecondaryButton
        title="Lernen"
        icon={<Feather name="list" size={28} color={Colors.primary} />}
        onPress={onPressKategorien}
      />
      <SecondaryButton
        title="Statistik"
        icon={
          <MaterialIcons name="bar-chart" size={28} color={Colors.primary} />
        }
        onPress={onPressStatistik}
      />
      <SecondaryButton
        title="Impressum"
        icon={<FontAwesome name="balance-scale" size={24} color="black" />}
        onPress={onPressEinstellungen}
      />
      <SecondaryButton
        title="Übungsprüfung"
        icon={
          <Ionicons
            name="document-text-outline"
            size={28}
            color={Colors.primary}
          />
        }
        onPress={onPressUbungsprufung}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: width * 0.9,
    alignSelf: "center",
    marginTop: 20,
  },
  button: {
    width: (width * 0.9 - 15) / 2,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  text: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
