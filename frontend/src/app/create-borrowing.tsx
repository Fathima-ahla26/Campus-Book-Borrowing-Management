import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function CreateBorrowingScreen() {
  const { resourceId } = useLocalSearchParams<{
    resourceId: string;
  }>();

  const { token } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [meetingDetails, setMeetingDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    if (!startDate || !returnDate) {
      Alert.alert(
        "Validation",
        "Please enter both dates."
      );
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/api/borrowings", {
        method: "POST",
        token,
        body: {
          resourceId,
          startDate,
          requestedReturnDate: returnDate,
          meetingDetails,
        },
      });

      Alert.alert(
        "Success",
        "Borrowing request submitted.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/borrowings"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Request Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Request to Borrow
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Start date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Return date (YYYY-MM-DD)"
        value={returnDate}
        onChangeText={setReturnDate}
      />

      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Meeting details"
        value={meetingDetails}
        onChangeText={setMeetingDetails}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={submitRequest}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Submitting..." : "Submit Request"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: "#F7F9F7",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
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