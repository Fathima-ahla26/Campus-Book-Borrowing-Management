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
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AddResourceScreen() {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Book");
  const [type, setType] = useState("Book");
  const [contactInfo, setContactInfo] = useState("");
  const [mode, setMode] = useState("Lend");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  // async function createResource() {
  //   if (!token) {
  //     Alert.alert("Not logged in", "Please log in first.");
  //     return;
  //   }
    async function createResource() {
  console.log("RESOURCE TOKEN:", token);

  if (!token) {
    Alert.alert("Not logged in", "Please log in first.");
    return;
  }

  //

    if (
      !title.trim() ||
      !description.trim() ||
      !contactInfo.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please fill in title, description, and contact information."
      );
      return;
    }

    if (mode === "Sell" && !price.trim()) {
      Alert.alert(
        "Missing price",
        "Please enter a price for a resource being sold."
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
        contactInfo: contactInfo.trim(),
        mode,
        price: mode === "Sell" ? Number(price) : 0,
      };

      const data = await apiRequest("/api/resources", {
        method: "POST",
        body,
        token,
      });

      console.log("RESOURCE CREATED:", data);

      Alert.alert(
        "Resource created",
        "Your resource has been added to CampusShare.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/home"),
          },
        ]
      );
    } catch (error: any) {
      console.error("CREATE RESOURCE ERROR:", error);

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
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>
          Add Resource
        </Text>

        <Text style={styles.subtitle}>
          Share a book or study resource with other
          students.
        </Text>

        <View style={styles.card}>
          {/* TITLE */}
          <Text style={styles.label}>
            Title *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Database System Concepts"
            value={title}
            onChangeText={setTitle}
          />

          {/* DESCRIPTION */}
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

          {/* CATEGORY */}
          <Text style={styles.label}>
            Category *
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

          {/* TYPE */}
          <Text style={styles.label}>
            Type *
          </Text>

          <View style={styles.options}>
            {[
              "Book",
              "Novel",
              "Academic",
              "Personal",
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

          {/* CONTACT INFORMATION */}
          <Text style={styles.label}>
            Contact Information *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. WhatsApp: 0771234567"
            value={contactInfo}
            onChangeText={setContactInfo}
          />

          <Text style={styles.helperText}>
            Students can use this information to
            contact you about the resource.
          </Text>

          {/* SHARING MODE */}
          <Text style={styles.label}>
            Sharing Mode *
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

          {/* PRICE */}
          {mode === "Sell" && (
            <>
              <Text style={styles.label}>
                Price (LKR) *
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. 2500"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </>
          )}

          {/* IMAGE */}
          <View style={styles.imageBox}>
            <Text style={styles.imageTitle}>
              📷 Resource Image
            </Text>

            <Text style={styles.imageText}>
              Image upload is supported by the
              backend. We will connect the Expo
              image picker after the core resource
              creation flow is confirmed.
            </Text>
          </View>

          {/* CREATE BUTTON */}
          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
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

  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 5,
  },

  imageBox: {
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderRadius: 10,
    marginTop: 18,
  },

  imageTitle: {
    color: "#334155",
    fontWeight: "700",
    marginBottom: 5,
  },

  imageText: {
    color: "#64748B",
    lineHeight: 18,
  },

  button: {
    backgroundColor: "#176B3A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});