import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { apiRequest } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ResourceFormScreen() {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Book");
  const [type, setType] = useState("Textbook");
  const [mode, setMode] = useState("Lend");
  const [contactInfo, setContactInfo] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const createResource = async () => {
    if (!title || !description || !category || !type || !contactInfo) {
      Alert.alert("Validation", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/api/resources", {
        method: "POST",
        token,
        body: {
          title,
          description,
          category,
          type,
          mode,
          contactInfo,
          price: price ? Number(price) : 0,
        },
      });

      Alert.alert("Success", "Resource created successfully.");
      router.replace("/resources");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Resource</Text>

      <TextInput
        style={styles.input}
        placeholder="Title *"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.large]}
        placeholder="Description *"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Category * e.g. Book, Notes, Past Paper"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Type * e.g. Textbook, Novel"
        value={type}
        onChangeText={setType}
      />

      <TextInput
        style={styles.input}
        placeholder="Mode: Lend or Sell"
        value={mode}
        onChangeText={setMode}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact information *"
        value={contactInfo}
        onChangeText={setContactInfo}
      />

      <TextInput
        style={styles.input}
        placeholder="Price"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={createResource}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Resource"}
        </Text>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  large: {
    height: 110,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});