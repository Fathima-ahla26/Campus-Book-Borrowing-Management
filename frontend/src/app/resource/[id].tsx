import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { apiRequest } from "../../api/client";

export default function ResourceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResource();
  }, []);

  const loadResource = async () => {
    try {
      const data = await apiRequest(`/api/resources/${id}`);
      setResource(data.resource);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.center}>
        <Text>Resource not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{resource.title}</Text>

      <Text style={styles.description}>
        {resource.description}
      </Text>

      <Text>Category: {resource.category}</Text>
      <Text>Type: {resource.type}</Text>
      <Text>Mode: {resource.mode}</Text>
      <Text>Status: {resource.status}</Text>

      {resource.price !== undefined && (
        <Text>Price: {resource.price}</Text>
      )}

      <Text style={styles.contact}>
        Contact: {resource.contactInfo}
      </Text>

      {resource.mode === "Lend" &&
        resource.status === "Available" && (
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/create-borrowing",
                params: { resourceId: resource._id },
              })
            }
          >
            <Text style={styles.buttonText}>
              Request to Borrow
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: "#F7F9F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
    color: "#555",
  },
  contact: {
    marginTop: 15,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});