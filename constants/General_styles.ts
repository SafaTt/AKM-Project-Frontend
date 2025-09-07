import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "./Colors";

const { height, width } = Dimensions.get("window");

export const general_styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "white",
  },
  containerUI: { flex: 1, backgroundColor: Colors.primary },
  whiteContainer: { backgroundColor: "white", flex: 1 },
  rowView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "8%",
    marginLeft: width * 0.02,
    marginRight: width * 0.02,
    alignItems: "center",
    zIndex: 10,
    padding: 15,
    borderRadius: width * 0.15,

    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // Shadow Android
    elevation: 5,

    // Optionnel : background pour que le shadow soit visible
    backgroundColor: "#fff",
  },

  logo: {
    maxWidth: 100,
    maxHeight: 220,
    alignSelf: "center",
  },
  logoSplash: {
    maxWidth: width * 0.5,
    maxHeight: 220,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  whiteView: {
    backgroundColor: "white",
    height: "95%",
    width: "100%",
    marginTop: "5%",
  },
  brandLogo: {
    width: 30,
    height: 40,
  },
  brandTitle: {
    color: Colors.primary,
    fontSize: 18,
    alignSelf: "center",
    fontWeight: "500",
    textAlign: "center",
  },
  // ---------------- Lernen styles --------------
  topicCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 10,
    marginRight: 10,
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  questionCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  box: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  boxText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  startButton: {
    // backgroundColor: Colors.secondary,
    // paddingVertical: 10,
    // borderRadius: 8,
    // alignItems: "center",
    // borderColor: Colors.primary,
    // borderWidth: 1,
    backgroundColor: "transparent",
    width: "100%",
    borderRadius: 25,
    alignItems: "center",
    paddingVertical: 10,
  },
  startButtonText: {
    // color: "#fff",
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "5%",
    marginBottom: height * 0.02,
  },
  iconImg: {
    alignSelf: "center",
    width: width * 0.4,
    height: height * 0.2,
  },
  nbFrageText: {
    color: Colors.primary,
    fontWeight: "500",
    fontSize: 20,
    letterSpacing: 1.5,
  },
  questionCart: {
    width: "95%",
    height: "80%",
    borderRadius: 20,
    backgroundColor: "#fff", // important sinon le shadow ne se voit pas
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    // Android shadow
    elevation: 5,
    alignSelf: "center",
  },
  fehler: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
    marginRight: 10,
    marginTop: 10,
  },

  closeBtn: {
    marginTop: 20,
    backgroundColor: Colors.falsch,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: "85%",
    alignItems: "center",
  },
  barView: {
    margin: 6,
    padding: 6,
    // paddingTop: 24, // 🔹 espace pour les labels
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    height: 250, // 🔹 définir une hauteur suffisante
  },
});
