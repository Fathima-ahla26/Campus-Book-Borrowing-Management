import React, {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  router,
  useFocusEffect,
} from "expo-router";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";

type Borrowing = {
  _id: string;
  status: string;
  requestedReturnDate?: string;
  approvedReturnDate?: string;
  resource?: {
    _id?: string;
    title?: string;
    status?: string;
  };
};

export default function RequestsScreen() {
  const { token } = useAuth();

  const [requests, setRequests] =
    useState<Borrowing[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  async function loadRequests() {
    if (!token) return;

    try {
      const data = await apiRequest(
        "/borrowings/my",
        {},
        token
      );

      const items =
        data.borrowings ||
        data.data ||
        (Array.isArray(data) ? data : []);

      setRequests(items);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "Unable to load your requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [token])
  );

  async function cancelRequest(
    borrowingId: string
  ) {
    if (!token) return;

    try {
      await apiRequest(
        `/borrowings/${borrowingId}`,
        {
          method: "DELETE",
        },
        token
      );

      Alert.alert(
        "Request cancelled",
        "Your borrowing request has been cancelled."
      );

      loadRequests();
    } catch (error: any) {
      Alert.alert(
        "Unable to cancel",
        error.message ||
          "This request cannot be cancelled."
      );
    }
  }

  function confirmCancel(id: string) {
    Alert.alert(
      "Cancel request?",
      "Are you sure you want to cancel this borrowing request?",
      [
        {
          text: "Keep",
          style: "cancel",
        },
        {
          text: "Cancel Request",
          style: "destructive",
          onPress: () => cancelRequest(id),
        },
      ]
    );
  }

  function renderItem({
    item,
  }: {
    item: Borrowing;
  }) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          {item.resource?.title ||
            "Resource"}
        </Text>

        <View style={styles.statusRow}>
          <Text style={styles.label}>
            Status
          </Text>

          <Text
            style={[
              styles.status,
              item.status === "Approved" &&
                styles.approved,
              item.status === "Rejected" &&
                styles.rejected,
            ]}
          >
            {item.status}
          </Text>
        </View>

        {item.requestedReturnDate ? (
          <Text style={styles.detail}>
            Requested return:{" "}
            {new Date(
              item.requestedReturnDate
            ).toLocaleDateString()}
          </Text>
        ) : null}

        {item.approvedReturnDate ? (
          <Text style={styles.detail}>
            Approved return:{" "}
            {new Date(
              item.approvedReturnDate
            ).toLocaleDateString()}
          </Text>
        ) : null}

        {item.status === "Pending" ? (
          <Pressable
            style={styles.cancelButton}
            onPress={() =>
              confirmCancel(item._id)
            }
          >
            <Text style={styles.cancelText}>
              Cancel Request
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#176B3A"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.back()}
      >
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.heading}>
        My Borrowing Requests
      </Text>

      <Text style={styles.subtitle}>
        Track resources you have requested.
      </Text>

      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            📋
          </Text>

          <Text style={styles.emptyTitle}>
            No borrowing requests
          </Text>

          <Text style={styles.emptyText}>
            When you request a resource, it will
            appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadRequests();
              }}
            />
          }
          contentContainerStyle={
            styles.list
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7F4",
    padding: 20,
    paddingTop: 55,
  },

  back: {
    color: "#176B3A",
    fontWeight: "700",
    marginBottom: 18,
  },

  heading: {
    fontSize: 27,
    fontWeight: "800",
    color: "#17211B",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 5,
    marginBottom: 18,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 17,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#17211B",
    marginBottom: 12,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#64748B",
  },

  status: {
    fontWeight: "800",
    color: "#B45309",
  },

  approved: {
    color: "#16803A",
  },

  rejected: {
    color: "#B91C1C",
  },

  detail: {
    color: "#475569",
    marginTop: 5,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 14,
  },

  cancelText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});