import React, { useState } from "react";
import { View,TouchableOpacity, Text,ImageBackground, TextInput, Button, StyleSheet,Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView } from "react-native";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";

const API_URL = "https://9557-91-186-250-146.ngrok-free.app";

const SignUp = ({ route, navigation }) => {
  const { role } = route.params; // Role passed from the welcome page
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    licenseNumber: "",
    companyName: "",
    adminId: "",
  });
  
  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSignUp = async () => {
    console.log("Form Data being sent:", formData); // Log formData before the fetch call
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          studentId: role === "STUDENT" ? formData.studentId : undefined,
          licenseNumber: role === "DRIVER" ? formData.licenseNumber : undefined,
          companyName: role === "OPERATOR" ? formData.companyName : undefined,
          adminId: role === "ADMIN" ? formData.adminId : undefined,
          role: role, // Include the role to tell the backend the user's type
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text(); // Read as plain text
        console.error("Error during sign-up:", errorMessage);
        Alert.alert("Sign-Up Failed", errorMessage);
        return;
      }
  
      // Handle plain text response or JSON response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        Alert.alert("Sign-Up Successful", data.message);
      } else {
        const message = await response.text();
        Alert.alert("Sign-Up Successful", message);
      }
  
      navigation.navigate("SignIn",{role, name:formData.name});
    } catch (error) {
      console.error("Error during sign-up:", error.message);
      Alert.alert("Sign-Up Failed", error.message);
    }
  };

  const renderRoleSpecificField = () => {
    switch (role) {
      case "STUDENT":
        return (
          <View style={styles.inputContainer}>
            <FontAwesome name="id-card" size={20} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Enter Student ID"
            value={formData.studentId}
            onChangeText={(value) => handleInputChange("studentId", value)}
            style={styles.input}
          />
          </View>
        );
      case "DRIVER":
        return (
          <View style={styles.inputContainer}>
            <Ionicons name="car-outline" size={20} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Enter License Number"
            value={formData.licenseNumber}
            onChangeText={(value) => handleInputChange("licenseNumber", value)}
            style={styles.input}
          />
          </View>
        );
      case "OPERATOR":
        return (
          <View style={styles.inputContainer}>
            <MaterialIcons name="business" size={20} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Enter Company Name"
            value={formData.companyName}
            onChangeText={(value) => handleInputChange("companyName", value)}
            style={styles.input}
          />
          </View>
        );
      case "ADMIN":
        return (
          <View style={styles.inputContainer}>
            <MaterialIcons name="admin-panel-settings" size={20} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Enter Admin ID"
            value={formData.adminId}
            onChangeText={(value) => handleInputChange("adminId", value)}
            style={styles.input}
          />
          </View>
        );
      default:
        return null;
    }
  };
  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };
 return (
  
  <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={Keyboard.dismiss}
    >
      <Text style={styles.title}>Sign Up As <Text style={styles.role}>{formatRole(role)}</Text></Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="person-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange("name", value)}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => handleInputChange("password", value)}
          style={styles.input}
        />
      </View>

      {renderRoleSpecificField()}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </TouchableOpacity>

  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent overlay
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffff",
    justifyContent: "center",
    
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 15,
    marginBottom: 30,
    paddingHorizontal: 10,
    
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#333",
  },
  button: {
    backgroundColor: "#59B3F8",
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  role: {
    color: "#59B3F8",  
  },
});

export default SignUp;