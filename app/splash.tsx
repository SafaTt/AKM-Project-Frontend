import { general_styles } from "@/constants/General_styles";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  // Anim values
  const opacity = useRef(new Animated.Value(0)).current; // fade-in
  const translateY = useRef(new Animated.Value(20)).current; // slide-up
  const scale = useRef(new Animated.Value(0.9)).current; // subtle pulse

  useEffect(() => {
    // Entrée : fade + montée + scale → durée totale 1500ms
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Attente courte après l’animation (~500ms) → total ~2s max
      const timeout = setTimeout(() => {
        router.replace("/(tabs)");
      }, 500);

      // Pas besoin de lancer une boucle infinie, car on quitte rapidement
      return () => clearTimeout(timeout);
    });
  }, [opacity, translateY, scale, router]);

  return (
    <View style={general_styles.container}>
      <Animated.Image
        source={require("../assets/images/generals/logo.png")}
        style={[
          general_styles.logo,
          { opacity, transform: [{ translateY }, { scale }] },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}
