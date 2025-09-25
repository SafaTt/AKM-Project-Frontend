import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Dimensions, View } from "react-native";

import HomeScreen from "./Home";
import LernenScreen from "./Lernen";
import StatistikScreen from "./Statistik";
import ÜbungsprüfungScreen from "./Uebungspruefung";

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get("window");

// tailles dynamiques basées sur l’écran
const ICON_CONTAINER_SIZE = width * 0.12; // ~12% de la largeur écran
const ICON_SIZE = ICON_CONTAINER_SIZE * 0.5; // icône prend la moitié

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "white" },
        tabBarActiveTintColor: "white", // label actif en blanc
        tabBarInactiveTintColor: "black", // label inactif en noir
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#049c44" : "white",
                borderRadius: ICON_CONTAINER_SIZE / 1.5,
                width: width * 0.24,
                height: ICON_CONTAINER_SIZE,
                alignItems: "center",
                justifyContent: "center",
                marginTop: width * 0.03,
              }}
            >
              <MaterialCommunityIcons
                name="home"
                size={ICON_SIZE}
                color={focused ? "white" : "black"}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Lernen"
        component={LernenScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#049c44" : "white",
                borderRadius: ICON_CONTAINER_SIZE / 1.5,
                width: width * 0.24,
                height: ICON_CONTAINER_SIZE,
                alignItems: "center",
                justifyContent: "center",
                marginTop: width * 0.03,
              }}
            >
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={ICON_SIZE}
                color={focused ? "white" : "black"}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Übungsprüfung"
        component={ÜbungsprüfungScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#049c44" : "white",
                borderRadius: ICON_CONTAINER_SIZE / 2,
                width: width * 0.24,
                height: ICON_CONTAINER_SIZE,
                alignItems: "center",
                justifyContent: "center",
                marginTop: width * 0.03,
              }}
            >
              <MaterialCommunityIcons
                name="file-document"
                size={ICON_SIZE}
                color={focused ? "white" : "black"}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Statistik"
        component={StatistikScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#049c44" : "white",
                borderRadius: ICON_CONTAINER_SIZE / 2,
                width: width * 0.24,
                height: ICON_CONTAINER_SIZE,
                alignItems: "center",
                justifyContent: "center",
                marginTop: width * 0.03,
              }}
            >
              <MaterialCommunityIcons
                name="chart-bar"
                size={ICON_SIZE}
                color={focused ? "white" : "black"}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
