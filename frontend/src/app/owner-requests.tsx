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

export default function OwnerRequestsScreen() {
  const { token } = useAuth();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await apiRequest(
        "/api/borrowings/owner-requests",
        { token }
      );

      setRequests(data.borrowings || []);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      await apiRequest(`/api/borrowings/${id}`, {
        method: "PUT",
        token,
        body: { status },
      });

      loadRequests();
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
        data={requests}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No borrowing requests for your resources.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.resourceId?.title || "Resource"}
            </Text>

            <Text>
              Borrower:{" "}
              {item.borrowerId?.name || "Unknown"}
            </Text>

            <Text>
              Student ID:{" "}
              {item.borrowerId?.studentId || "Unknown"}
            </Text>

            <Text>Status: {item.status}</Text>

            {item.status === "Pending" && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.approve}
                  onPress={() =>
                    updateStatus(item._id, "Approved")
                  }
                >
                  <Text style={styles.actionText}>
                    Approve
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reject}
                  onPress={() =>
                    updateStatus(item._id, "Rejected")
                  }
                >
                  <Text style={styles.actionText}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === "Approved" && (
              <TouchableOpacity
                style={styles.returnButton}
                onPress={() =>
                  updateStatus(item._id, "Returned")
                }
              >
                <Text style={styles.actionText}>
                  Confirm Return
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
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  approve: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },
  reject: {
    flex: 1,
    backgroundColor: "#B71C1C",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },
  returnButton: {
    backgroundColor: "#1565C0",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#666",
  },
});