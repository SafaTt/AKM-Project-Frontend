import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

interface ProgressDisplayProps {
  progress: number; // 0 à 100
}

export default function ProgressDisplay({ progress }: ProgressDisplayProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  // Met à jour displayProgress à chaque tick d'animation
  useEffect(() => {
    const listener = animatedProgress.addListener(({ value }) => {
      setDisplayProgress(Math.round(value));
    });
    return () => animatedProgress.removeListener(listener);
  }, []);

  const data = [
    {
      value: displayProgress, // Progression animée
      color: Colors.secondary,
      gradientCenterColor: Colors.secondary,
    },
    {
      value: 100 - displayProgress, // Fond
      color: Colors.vertClair,
      gradientCenterColor: Colors.vertClair,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <PieChart
          donut
          innerRadius={width * 0.14}
          radius={width * 0.2}
          data={data}
          showGradient={false}
        />
        <Text style={styles.percentage}>{displayProgress}%</Text>
      </View>
      {/* <Text style={styles.label}>GESAMTFORTSCHRITT</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    marginTop: width * 0.05,
    alignItems: "center",
  },
  chartContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    position: "absolute",
    fontSize: 24,
    fontWeight: "700",
    color: Colors.secondary,
  },
  label: {
    fontSize: 16,
    color: Colors.secondary,
    marginTop: 12,
    fontWeight: "700",
  },
});
