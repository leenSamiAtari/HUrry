import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,Keyboard, ImageBackground } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
  
    try {
      // Make the API call to sign in
      const response = await fetch("https://c54e-91-186-230-143.ngrok-free.app/api2/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send email and password
      });
      if (!response.ok) {
        // Handle server errors (detect plain text or JSON response)
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          Alert.alert("Error", errorData.message || "Something went wrong.");
        } else {
          const errorMessage = await response.text();
          Alert.alert("Error", errorMessage || "Something went wrong.");
        }
        return;
      }
  
      // Handle success response (detect plain text or JSON response)
      const contentType = response.headers.get("Content-Type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const message = await response.text();
        Alert.alert("Success", message);
        navigation.navigate("Home", { role: null }); // Navigate without role if not provided
        return;
      }
  
      // Assuming the response contains role and token in JSON
      const { role, token } = data;
  
      console.log("User signed in:", data);
      await AsyncStorage.setItem("authToken", token);
      console.log("Token stored:", token);
     // navigation.navigate("notification",{ role,token });
      // Navigate to Home with the role
      navigation.navigate("Home", { role,token });
      Alert.alert("Success", "Signed in successfully!");
    } catch (error) {
      // Handle network errors
      console.error("Sign-in error:", error);
      Alert.alert("Error", "Unable to sign in. Please try again.");
    }
  };
     
  return (
    <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={Keyboard.dismiss}
        >
   
    <View style={styles.overlay}>
      <Text style={styles.title}>Welcome Back !</Text>
      <View style={styles.inputContainer}>
      <MaterialIcons name="email" size={20} color="gray" style={styles.icon} />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      </View>
      <View style={styles.inputContainer}>
      <MaterialIcons name="lock-outline" size={20} color="gray" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Home")} // Replace "signUp" with your actual sign-up route
      >
       <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#ffff",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
    
  },
  background: {
    flex: 1,
    width: '100%', // Ensures the image spans the entire width
    height: '100%', // Ensures the image spans the entire height
    backgroundColor:"#ffff"
  },
  title: {
    color:"#000",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: -90,
  },
  button: {
    backgroundColor: "#59B3F8",
    paddingVertical: 10,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: "#007bff",
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#333",
  },
  icon: {
    marginRight: 10,
  },
});

export default SignIn;