import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile= ({ route, navigation }) => {
  const { role } = route.params;
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    studentId: '',
    licenseNumber: '',
    companyName: '',
    profilePicture: null,
  });

 
  const API_URLS = {
    STUDENT: {
      GET: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/student/profile',
      PUT: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/student/profile'
    },
    DRIVER: {
      GET: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/driver/profile',
      PUT: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/driver/profile'
    },
    OPERATOR: {
      GET: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/operator/profile',
      PUT: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/operator/profile'
    }
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      
      const apiUrl = API_URLS[role].GET;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      
      if (role === 'OPERATOR') {
        await AsyncStorage.setItem('operatorInfo', JSON.stringify({
          name: data.name,  // تم تغيير من data.operatorName إلى data.name
          email: data.email // تم تغيير من data.operatorEmail إلى data.email
        }));
      }
      
      const updatedData = {
        name: data.name || '',
        email: data.email || '',
        profilePicture: data.profilePicture || null,
      };

      if (role === 'STUDENT') {
        updatedData.studentId = data.studentId || '';
      } else if (role === 'DRIVER') {
        updatedData.licenseNumber = data.licenseNumber || '';
      } else if (role === 'OPERATOR') {
        updatedData.companyName = data.companyName || '';
      }
      
      setUserData(updatedData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEditProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUserData({ ...userData, profilePicture: result.assets[0].uri });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      
      const apiUrl = API_URLS[role].PUT;

      
      const requestData = {
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture,
      };

      
      if (role === 'STUDENT') {
        requestData.studentId = userData.studentId;
      } else if (role === 'DRIVER') {
        requestData.licenseNumber = userData.licenseNumber;
      } else if (role === 'OPERATOR') {
        requestData.companyName = userData.companyName;
      }

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      Alert.alert('Success', 'Your changes have been saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
      console.error(error);
    }
  };

  
  const renderContentBasedOnRole = () => {
    switch (role) {
      case 'STUDENT':
        return (
          <View style={styles.roleSpecificContainer}>
            <View style={styles.inputContainer}>
              <Icon name="account" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => setUserData({ ...userData, name: text })}
                placeholder="Student Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="email" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text })}
                placeholder="Student Email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="card-account-details" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.studentId}
                onChangeText={(text) => setUserData({ ...userData, studentId: text })}
                placeholder="Student ID"
                keyboardType="numeric"
              />
            </View>
          </View>
        );
      case 'DRIVER':
        return (
          <View style={styles.roleSpecificContainer}>
            <View style={styles.inputContainer}>
              <Icon name="account" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => setUserData({ ...userData, name: text })}
                placeholder="Driver Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="email" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text })}
                placeholder="Driver Email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="license" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.licenseNumber}
                onChangeText={(text) => setUserData({ ...userData, licenseNumber: text })}
                placeholder="License Number"
              />
            </View>
          </View>
        );
      case 'OPERATOR':
        return (
          <View style={styles.roleSpecificContainer}>
            <View style={styles.inputContainer}>
              <Icon name="account" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => setUserData({ ...userData, name: text })}
                placeholder="Operator Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="email" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text })}
                placeholder="Operator Email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="office-building" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.companyName}
                onChangeText={(text) => setUserData({ ...userData, companyName: text })}
                placeholder="Company Name"
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>HUrry</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("notification", { role })}>
            <Icon name="bell-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("profileop", { role })} style={{ marginLeft: 15 }}>
            <Icon name="account-circle-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Picture */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.profileSection}>
        <View style={styles.profilePictureContainer}>
          {userData.profilePicture ? (
            <Image
              source={{ uri: userData.profilePicture }}
              style={styles.profilePicture}
            />
          ) : (
            <Icon name="account-circle" size={120} color="#CCCCCC" />
          )}
          <TouchableOpacity
            style={styles.editPictureButton}
            onPress={handleEditProfilePicture}
          >
            <Text style={styles.editPictureText}>Edit</Text>
          </TouchableOpacity>
        </View>

{/* User Info */}
<View style={styles.userInfo}>
          <Text style={styles.userName}>{userData.name || 'Name'}</Text>
          <Text style={styles.userRole}>{role}</Text>
        </View>
      </View>

        {/* Role-specific content */}
        <View style={styles.formContainer}>
        {renderContentBasedOnRole()}
        </View>
        
        {/* Save button */}
          <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveChanges}
          >
            <Icon name="content-save" size={24} color="#fff" />
            <Text style={styles.footerButtonText}>Save Changes</Text>
          </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("operator", { role })} style={styles.navItem}>
          <Icon name="home-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(role === "OPERATOR" ? 'updateschedule' : 'busSchedule')} style={styles.navItem}>
          <Icon name="calendar-clock" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("feedback",{role})} style={styles.navItem}>
          <Icon name="comment-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ContactUs",{role})} style={styles.navItem}>
          <Icon name="alert-circle-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Missing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8ffff',
    paddingTop: 0,
    paddingBottom: 60,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#59B3F8",
    paddingVertical: 15,
    paddingHorizontal: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#f8ffff', 
    //backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    //elevation: 2,
    shadowColor: '#000',
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.1,
  },
  profilePictureContainer: {
    position: 'relative',
    marginRight: 25,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#59B3F8',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#59B3F8',
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editPictureText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#7F8C8D',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 15,
    color: '#59B3F8',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#59B3F8',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf:'center',
  },
  footerButtonText: {
    color: '#ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 65,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#59B3F8',
    marginTop: 5,
    fontWeight: '500',
  },
});
export default Profile;