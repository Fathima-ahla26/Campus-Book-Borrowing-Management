import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BorrowingsScreen() {
  const { token } = useAuth();

  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBorrowings = async () => {
    try {
      const data = await apiRequest("/api/borrowings/my", {
        token,
      });

      setBorrowings(data.borrowings || []);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowings();
  }, []);

  const cancelRequest = async (id: string) => {
    try {
      await apiRequest(`/api/borrowings/${id}`, {
        method: "PUT",
        token,
        body: {
          status: "Cancelled",
        },
      });

      loadBorrowings();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={borrowings}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            You have no borrowing requests.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.resourceId?.title || "Resource"}
            </Text>

            <Text>Status: {item.status}</Text>

            <Text>
              Start:{" "}
              {new Date(item.startDate).toLocaleDateString()}
            </Text>

            <Text>
              Return:{" "}
              {new Date(
                item.requestedReturnDate
              ).toLocaleDateString()}
            </Text>

            {item.status === "Pending" && (
              <TouchableOpacity
                style={styles.cancel}
                onPress={() => cancelRequest(item._id)}
              >
                <Text style={styles.cancelText}>
                  Cancel Request
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cancel: {
    backgroundColor: "#B71C1C",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#666",
  },
});