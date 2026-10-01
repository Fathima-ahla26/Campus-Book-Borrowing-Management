import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function AddResourceScreen() {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [category, setCategory] =
    useState("Book");
  const [type, setType] = useState("Book");
  const [mode, setMode] = useState("Lend");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  async function createResource() {
    if (!token) return;

    if (!title.trim() || !description.trim()) {
      Alert.alert(
        "Missing information",
        "Title and description are required."
      );
      return;
    }

    try {
      setLoading(true);

      const body = {
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        mode,
        price:
          mode === "Sell"
            ? Number(price || 0)
            : 0,
      };

      await apiRequest(
        "/resources",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        token
      );

      Alert.alert(
        "Resource created",
        "Your resource has been added to CampusShare."
      );

      router.replace("/home");
    } catch (error: any) {
      Alert.alert(
        "Unable to create resource",
        error.message ||
          "Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>
          Add Resource
        </Text>

        <Text style={styles.subtitle}>
          Share a book or study resource with
          other students.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Title *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Software Engineering Notes"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>
            Description *
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multiline,
            ]}
            placeholder="Describe the resource..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>
            Category
          </Text>

          <View style={styles.options}>
            {[
              "Book",
              "Novel",
              "Past Paper",
              "Notes",
              "Study Material",
              "Other",
            ].map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.option,
                  category === item &&
                    styles.optionSelected,
                ]}
                onPress={() =>
                  setCategory(item)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    category === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>
            Type
          </Text>

          <View style={styles.options}>
            {[
              "Book",
              "Novel",
              "Academic",
              "Past Paper",
              "Notes",
              "Study Material",
              "Other",
            ].map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.option,
                  type === item &&
                    styles.optionSelected,
                ]}
                onPress={() =>
                  setType(item)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    type === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>
            Sharing Mode
          </Text>

          <View style={styles.row}>
            {["Lend", "Sell"].map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.modeOption,
                  mode === item &&
                    styles.optionSelected,
                ]}
                onPress={() =>
                  setMode(item)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    mode === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          {mode === "Sell" && (
            <>
              <Text style={styles.label}>
                Price (LKR)
              </Text>

              <TextInput
                style={styles.input}
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </>
          )}

          <Text style={styles.imageNote}>
            📷 Image upload can be attached to this
            resource. We will connect the image
            picker after the core API flow is working.
          </Text>

          <Pressable
            style={styles.button}
            onPress={createResource}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Creating..."
                : "Create Resource"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7F4",
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  back: {
    color: "#176B3A",
    fontWeight: "700",
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17211B",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 5,
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
  },

  label: {
    color: "#334155",
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 13,
    backgroundColor: "#FFFFFF",
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  option: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },

  modeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },

  optionSelected: {
    backgroundColor: "#176B3A",
    borderColor: "#176B3A",
  },

  optionText: {
    color: "#475569",
    fontWeight: "600",
  },

  optionTextSelected: {
    color: "#FFFFFF",
  },

  imageNote: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
    color: "#475569",
    marginTop: 18,
    lineHeight: 19,
  },

  button: {
    backgroundColor: "#176B3A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});