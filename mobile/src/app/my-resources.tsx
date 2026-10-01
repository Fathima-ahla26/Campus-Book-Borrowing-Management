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

type Resource = {
  _id: string;
  title: string;
  category?: string;
  status?: string;
  mode?: string;
};

type Borrowing = {
  _id: string;
  status: string;
  requestedReturnDate?: string;
  borrower?: {
    name?: string;
    studentId?: string;
    email?: string;
  };
  resource?: {
    title?: string;
  };
};

export default function MyResourcesScreen() {
  const { token } = useAuth();

  const [resources, setResources] =
    useState<Resource[]>([]);

  const [requests, setRequests] =
    useState<Borrowing[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  async function loadData() {
    if (!token) return;

    try {
      setLoading(true);

      const [resourceData, requestData] =
        await Promise.all([
          apiRequest(
            "/resources",
            {},
            token
          ),
          apiRequest(
            "/borrowings/owner-requests",
            {},
            token
          ),
        ]);

      const allResources =
        resourceData.resources ||
        resourceData.data ||
        (Array.isArray(resourceData)
          ? resourceData
          : []);

      const ownerRequests =
        requestData.borrowings ||
        requestData.data ||
        (Array.isArray(requestData)
          ? requestData
          : []);

      setResources(allResources);
      setRequests(ownerRequests);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "Unable to load your data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [token])
  );

  async function updateRequest(
    id: string,
    status: string
  ) {
    if (!token) return;

    try {
      await apiRequest(
        `/borrowings/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
          }),
        },
        token
      );

      Alert.alert(
        "Updated",
        `Request marked as ${status}.`
      );

      loadData();
    } catch (error: any) {
      Alert.alert(
        "Update failed",
        error.message ||
          "Unable to update request."
      );
    }
  }

  async function deleteResource(id: string) {
    if (!token) return;

    try {
      await apiRequest(
        `/resources/${id}`,
        {
          method: "DELETE",
        },
        token
      );

      Alert.alert(
        "Deleted",
        "Resource has been deleted."
      );

      loadData();
    } catch (error: any) {
      Alert.alert(
        "Delete failed",
        error.message ||
          "Unable to delete this resource."
      );
    }
  }

  function confirmDelete(id: string) {
    Alert.alert(
      "Delete resource?",
      "This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteResource(id),
        },
      ]
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
        My Resources
      </Text>

      <Text style={styles.subtitle}>
        Manage your shared resources and borrowing
        requests.
      </Text>

      <FlatList
        data={resources}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.section}>
              My Listings
            </Text>

            {resources.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  You have not added any resources yet.
                </Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.resourceCard}>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>
                {item.title}
              </Text>

              <Text style={styles.resourceCategory}>
                {item.category || "Resource"}
              </Text>
            </View>

            <Text style={styles.resourceStatus}>
              {item.status || "Available"}
            </Text>

            <View style={styles.resourceActions}>
              <Pressable
                style={styles.editButton}
                onPress={() =>
                  Alert.alert(
                    "Edit",
                    "The backend supports resource updates. We can connect the edit form after the core demo is verified."
                  )
                }
              >
                <Text style={styles.editText}>
                  Edit
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  confirmDelete(item._id)
                }
              >
                <Text style={styles.deleteText}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.requestsSection}>
            <Text style={styles.section}>
              Borrowing Requests
            </Text>

            {requests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No students have requested your
                  resources.
                </Text>
              </View>
            ) : (
              requests.map((request) => (
                <View
                  key={request._id}
                  style={styles.requestCard}
                >
                  <Text style={styles.resourceTitle}>
                    {request.resource?.title ||
                      "Resource"}
                  </Text>

                  <Text style={styles.detail}>
                    Borrower:{" "}
                    {request.borrower?.name ||
                      request.borrower?.studentId ||
                      "Student"}
                  </Text>

                  <Text style={styles.detail}>
                    Status: {request.status}
                  </Text>

                  {request.status ===
                    "Pending" && (
                    <View
                      style={styles.actionRow}
                    >
                      <Pressable
                        style={styles.approve}
                        onPress={() =>
                          updateRequest(
                            request._id,
                            "Approved"
                          )
                        }
                      >
                        <Text
                          style={
                            styles.actionText
                          }
                        >
                          Approve
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.reject}
                        onPress={() =>
                          updateRequest(
                            request._id,
                            "Rejected"
                          )
                        }
                      >
                        <Text
                          style={
                            styles.actionText
                          }
                        >
                          Reject
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {request.status ===
                    "Approved" && (
                    <Pressable
                      style={styles.returnButton}
                      onPress={() =>
                        updateRequest(
                          request._id,
                          "Returned"
                        )
                      }
                    >
                      <Text
                        style={
                          styles.returnText
                        }
                      >
                        Mark as Returned
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>
        }
        contentContainerStyle={styles.list}
      />
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
    marginBottom: 15,
  },

  list: {
    paddingBottom: 40,
  },

  section: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17211B",
    marginBottom: 10,
    marginTop: 8,
  },

  resourceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 15,
    marginBottom: 10,
  },

  resourceInfo: {
    marginBottom: 8,
  },

  resourceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#17211B",
  },

  resourceCategory: {
    color: "#64748B",
    marginTop: 3,
  },

  resourceStatus: {
    color: "#176B3A",
    fontWeight: "700",
    marginBottom: 10,
  },

  resourceActions: {
    flexDirection: "row",
    gap: 8,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#176B3A",
    borderRadius: 8,
    padding: 9,
    alignItems: "center",
  },

  editText: {
    color: "#176B3A",
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 8,
    padding: 9,
    alignItems: "center",
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  requestsSection: {
    marginTop: 15,
  },

  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 15,
    marginBottom: 10,
  },

  detail: {
    color: "#64748B",
    marginTop: 5,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  approve: {
    flex: 1,
    backgroundColor: "#176B3A",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  reject: {
    flex: 1,
    backgroundColor: "#B91C1C",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  returnButton: {
    backgroundColor: "#E7F3EB",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 14,
  },

  returnText: {
    color: "#176B3A",
    fontWeight: "700",
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});