// app/components/ProgressDisplay.tsx
import { Colors } from "@/constants/Colors";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.4;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ProgressDisplayProps {
  progress: number; // valeur en % (0 à 100)
}

export default function ProgressDisplay({ progress }: ProgressDisplayProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    CIRCUMFERENCE - (CIRCUMFERENCE * clampedProgress) / 100;

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          {/* Cercle de fond */}
          <Circle
            stroke={Colors.vertClair}
            fill="none"
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
          />
          {/* Cercle de progression */}
          <Circle
            stroke={Colors.secondary}
            fill="none"
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            originX={CIRCLE_SIZE / 2}
            originY={CIRCLE_SIZE / 2}
          />
        </Svg>
        <Text style={styles.percentage}>{clampedProgress}%</Text>
      </View>
      <Text style={styles.label}>GESAMTFORTSCHRITT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    marginTop: width * 0.05,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 12,
    fontWeight: "700",
  },
  circleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    position: "absolute",
    fontSize: 24,
    fontWeight: "700",
    color: Colors.secondary,
  },
});
