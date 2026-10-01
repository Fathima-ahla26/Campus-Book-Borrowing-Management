import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";

type Resource = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  type?: string;
  mode?: string;
  price?: number;
  status?: string;
  owner?: {
    _id?: string;
    name?: string;
    studentId?: string;
  };
};

export default function HomeScreen() {
  const { user, token, logout } = useAuth();

  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadResources = async () => {
    try {
      setError("");

      const data = await apiRequest("/resources");

      const items =
        data.resources ||
        data.data ||
        (Array.isArray(data) ? data : []);

      setResources(items);
    } catch (err: any) {
      setError(
        err.message || "Unable to load resources."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadResources();
    }, [])
  );

  function refresh() {
    setRefreshing(true);
    loadResources();
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  const filteredResources = resources.filter((resource) => {
    const text =
      `${resource.title} ${resource.description || ""} ${
        resource.category || ""
      } ${resource.type || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  function renderResource({
    item,
  }: {
    item: Resource;
  }) {
    return (
      <Pressable
        style={styles.resourceCard}
        onPress={() =>
          router.push({
            pathname: "/resource/[id]",
            params: { id: item._id },
          })
        }
      >
        <View style={styles.resourceHeader}>
          <View style={styles.resourceIcon}>
            <Text style={styles.iconText}>📚</Text>
          </View>

          <View style={styles.resourceInfo}>
            <Text
              style={styles.resourceTitle}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <Text style={styles.category}>
              {item.category || item.type || "Study Resource"}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text style={styles.mode}>
            {item.mode || "Lend"}
          </Text>

          <Text
            style={[
              styles.status,
              item.status === "Available"
                ? styles.available
                : styles.unavailable,
            ]}
          >
            {item.status || "Available"}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>CampusShare</Text>
          <Text style={styles.welcome}>
            Hi, {user?.name || "Student"} 👋
          </Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.primaryAction}
          onPress={() => router.push("/add-resource")}
        >
          <Text style={styles.primaryActionText}>
            + Add Resource
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryAction}
          onPress={() => router.push("/requests")}
        >
          <Text style={styles.secondaryActionText}>
            My Requests
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.myResourcesButton}
        onPress={() => router.push("/my-resources")}
      >
        <Text style={styles.myResourcesText}>
          Manage My Resources & Owner Requests →
        </Text>
      </Pressable>

      <TextInput
        style={styles.search}
        placeholder="Search books, notes, past papers..."
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.sectionTitle}>
        Available Campus Resources
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#176B3A"
          />
          <Text style={styles.helper}>
            Loading resources...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>
            {error}
          </Text>

          <Pressable
            style={styles.retry}
            onPress={loadResources}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : filteredResources.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>
            No resources found
          </Text>
          <Text style={styles.helper}>
            Try another search or add the first
            resource.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          keyExtractor={(item) => item._id}
          renderItem={renderResource}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
            />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7F4",
    paddingHorizontal: 18,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  brand: {
    fontSize: 27,
    fontWeight: "800",
    color: "#176B3A",
  },

  welcome: {
    color: "#64748B",
    marginTop: 3,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },

  logoutText: {
    color: "#475569",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  primaryAction: {
    flex: 1,
    backgroundColor: "#176B3A",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },

  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  secondaryAction: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#176B3A",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },

  secondaryActionText: {
    color: "#176B3A",
    fontWeight: "700",
  },

  myResourcesButton: {
    backgroundColor: "#E7F3EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  myResourcesText: {
    textAlign: "center",
    color: "#176B3A",
    fontWeight: "700",
  },

  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 13,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#17211B",
    marginBottom: 10,
  },

  list: {
    paddingBottom: 30,
  },

  resourceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  resourceHeader: {
    flexDirection: "row",
  },

  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E7F3EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 24,
  },

  resourceInfo: {
    flex: 1,
  },

  resourceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#17211B",
  },

  category: {
    color: "#64748B",
    marginTop: 4,
  },

  description: {
    color: "#475569",
    marginTop: 12,
    lineHeight: 20,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  mode: {
    color: "#475569",
    fontWeight: "600",
  },

  status: {
    fontWeight: "700",
  },

  available: {
    color: "#16803A",
  },

  unavailable: {
    color: "#B45309",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },

  helper: {
    color: "#64748B",
    marginTop: 10,
    textAlign: "center",
  },

  error: {
    color: "#B91C1C",
    textAlign: "center",
    marginBottom: 12,
  },

  retry: {
    backgroundColor: "#176B3A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
    color: "#17211B",
  },
});