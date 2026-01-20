import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { clearNewOrderIndicator } = useContext(AppContext);

  const handleOrdersNavigation = () => {
    clearNewOrderIndicator();
    navigation.navigate("Orders");
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login screen after logout
      navigation.replace('Login');
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* Scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <Icon name="person-circle-outline" size={90} color="#D1D5DB" />
          )}
          <Text style={styles.name}>{user?.username || "User"}</Text>
          <Text style={styles.email}>{user?.email || "No email"}</Text>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("PersonalInfo")}
          >
            <View style={styles.row}>
              <Icon name="person-outline" size={22} color="#16A34A" />
              <Text style={styles.settingText}>Personal Information</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("ProfileAddress")}
          >
            <View style={styles.row}>
              <Icon name="location-outline" size={22} color="#16A34A" />
              <Text style={styles.settingText}>Shipping Addresses</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleOrdersNavigation}
          >
            <View style={styles.row}>
              <Icon name="bag-outline" size={22} color="#16A34A" />
              <Text style={styles.settingText}>My Orders</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.row}>
              <Icon name="heart-outline" size={22} color="#16A34A" />
              <Text style={styles.settingText}>Favorites</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.row}>
              <Icon name="help-circle-outline" size={22} color="#16A34A" />
              <Text style={styles.settingText}>Help Center</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.row}>
              <Icon name="call-outline" size={22} color="#16A34A" />
              <Text style={styles.settingText}>Contact Us</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 20,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  email: {
    color: "#666",
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    backgroundColor: "#FEFFFE",
    borderRadius: 16,
    paddingVertical: 10,
    elevation: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
    marginBottom: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 15,
    marginLeft: 12,
    color: "#222",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginBottom: 40,
    flexDirection: "row",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});
