import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to CampusShare 👋</Text>

      <Text style={styles.welcome}>
        Hello, {user?.name || "Student"}!
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/resources")}
      >
        <Text style={styles.cardTitle}>📚 Browse Resources</Text>
        <Text style={styles.cardText}>
          Find books, notes, past papers and study materials.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/resource/form")}
      >
        <Text style={styles.cardTitle}>➕ Add Resource</Text>
        <Text style={styles.cardText}>
          Share a resource with other students.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/borrowings")}
      >
        <Text style={styles.cardTitle}>📖 My Borrowings</Text>
        <Text style={styles.cardText}>
          View your borrowing requests and their status.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/owner-requests")}
      >
        <Text style={styles.cardTitle}>📬 Owner Requests</Text>
        <Text style={styles.cardText}>
          Manage requests for resources you own.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logout}
        onPress={() => {
          logout();
          router.replace("/login");
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F7F9F7",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  welcome: {
    fontSize: 17,
    marginBottom: 25,
    color: "#555",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 7,
  },
  cardText: {
    color: "#666",
  },
  logout: {
    backgroundColor: "#B71C1C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});