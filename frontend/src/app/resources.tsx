import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { apiRequest } from "../api/client";

export default function ResourcesScreen() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/resources");

      setResources(data.resources || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading resources...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={loadResources}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={resources}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No resources are available yet.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/resource/[id]",
                params: { id: item._id },
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>

            <Text>
              Category: {item.category}
            </Text>

            <Text>
              Type: {item.type}
            </Text>

            <Text>
              Mode: {item.mode}
            </Text>

            <Text style={styles.status}>
              Status: {item.status}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F7F9F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
  },
  status: {
    marginTop: 8,
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#666",
  },
  error: {
    color: "#B71C1C",
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});