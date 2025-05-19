import React, { useState, useEffect } from 'react';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from '@react-navigation/native'; 
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/Constants';

const API_URLS = {
  Zarqa: `${API_URL}/zarqa/add`,
  Amman:  `${API_URL}/amman/add`,
}

const updateschedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    nameOfBusStation: '',
    numberOfBuses: '',
    operatorId: '',
  });

  const [selectedCity, setSelectedCity] = useState('Amman');
  const [menuVisible, setMenuVisible] = useState(false); 

  const navigation = useNavigation();

  const navigateToUpdateBusPage = (scheduleId) => {
    const scheduleToUpdate = schedules.find(schedule => schedule.id === scheduleId);
    navigation.navigate('updateBus', { scheduleId: scheduleId, numberOfBuses: scheduleToUpdate.numberOfBuses });
  };

 // Fetch schedules and operatorId
 useEffect(() => {
  const loadSchedules = async () => {
    try {
      setSchedules([]);
   //const storedSchedules = await AsyncStorage.getItem(`${selectedCity.toLowerCase()}Schedules`);
      if (storedSchedules) {
        setSchedules(JSON.parse(storedSchedules));
      } else {
        fetchSchedulesFromAPI();
     }
    } catch (error) {
      console.log('Failed to load schedules', error);
    }
  };
  loadSchedules();
}, [selectedCity]);

const fetchSchedulesFromAPI = async () => {
  try {
    
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'Token not found');
      return;
    }

    const response = await fetch(API_URLS[selectedCity], {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
      },
    });
    
    const data = await response.json();
    setSchedules(data);
    saveSchedulesToStorage(data);
    console.log('Data from API:', data);
    

    if (data && data.length > 0) {
      const operatorId = data[0].operatorId;  
      setNewSchedule(prevState => ({
        ...prevState,
        operatorId: operatorId,
      }));
    const updatedSchedules = data.map(schedule => ({
      ...schedule,
      operatorId: operatorId,  
    }));
    setSchedules(updatedSchedules);
  }
  } catch (error) {
    console.log('Failed to fetch schedules from API', error);
  }
};

const saveSchedulesToStorage = async (updatedSchedules) => {
  try {
   await AsyncStorage.setItem(`${selectedCity.toLowerCase()}Schedules`, JSON.stringify(updatedSchedules));
    console.log("Data saved successfully for city: " + selectedCity);
  } catch (error) {
    Alert.alert('Error', 'Failed to save schedules');
  }
};

const addSchedule = async () => {
  if (!newSchedule.nameOfBusStation || !newSchedule.numberOfBuses ) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  const updatedSchedules = [
    ...schedules,
    { ...newSchedule, id: Date.now(), editable: false },
  ];
  setSchedules(updatedSchedules);
  saveSchedulesToStorage(updatedSchedules);

  try {
    
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'Token not found');
      return;
    }

    await fetch(API_URLS[selectedCity], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  
      },
      body: JSON.stringify(newSchedule),
    });
    setNewSchedule({ nameOfBusStation: '', numberOfBuses: '', operatorId: '' });
  } catch (error) {
    console.log('Failed to add schedule to API', error);
  }
};

const removeSchedule = async (id) => {
  try {
   
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'Token not found');
      return;
    }

    await fetch(`${API_URLS[selectedCity]}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,  
      },
    });
    const updatedSchedules = schedules.filter((schedule) => schedule.id !== id);
    setSchedules(updatedSchedules);
    saveSchedulesToStorage(updatedSchedules);
  } catch (error) {
    console.log('Failed to remove schedule from API', error);
  }
};

const toggleEdit = (id) => {
  const updatedSchedules = schedules.map((schedule) =>
    schedule.id === id ? { ...schedule, editable: !schedule.editable } : schedule
  );
  setSchedules(updatedSchedules);
  saveSchedulesToStorage(updatedSchedules);
};

const editSchedule = async (id, field, value) => {
  const updatedSchedules = schedules.map((schedule) =>
    schedule.id === id ? { ...schedule, [field]: value } : schedule
  );
  setSchedules(updatedSchedules);
  saveSchedulesToStorage(updatedSchedules);

  try {
    
    const token = await AsyncStorage.getItem('authToken');
    console.log('token', token);
    if (!token) {
      return;
    }

    await fetch(`${API_URLS[selectedCity]}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify(updatedSchedules.find((schedule) => schedule.id === id)),
    });
  } catch (error) {
    console.log('Failed to update schedule in API', error);
  }
};

return (
  <View style={styles.container}>
    {/* Top Bar */}
    <View style={styles.topBar}>
      <Text style={styles.appName}>HUrry</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("notification",{role:'OPERATOR'})}>
          <Icon name="bell-outline" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("profileop",{role:'OPERATOR'})} style={{ marginLeft: 15 }}>
          <Icon name="account-circle-outline" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>

    {/* City Selector */}
    <View style={styles.citySelector}>
      <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.cityButton}>
        <Icon name="menu" size={20} color="#59B3F8" />
        <Text style={styles.cityButtonText}>Select a city</Text>
      </TouchableOpacity>

      {menuVisible && (
        <View style={styles.cityMenu}>
          <TouchableOpacity onPress={() => { setSelectedCity('Amman'); setMenuVisible(false); }} style={styles.cityOption}>
            <Text style={styles.cityOptionText}>   Amman</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSelectedCity('Zarqa'); setMenuVisible(false); }} style={styles.cityOption}>
            <Text style={styles.cityOptionText}>Zarqa</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>

    <ScrollView>
      <Text style={styles.header}>Manage Bus Schedules</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name of bus station"
          placeholderTextColor="#888"
          value={newSchedule.nameOfBusStation}
          onChangeText={(text) => setNewSchedule({ ...newSchedule, nameOfBusStation: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Number of Buses"
          placeholderTextColor="#888"
          value={newSchedule.numberOfBuses}
          onChangeText={(text) => setNewSchedule({ ...newSchedule, numberOfBuses: text })}
          keyboardType="numeric"
        />
        

        <TouchableOpacity style={styles.addButton} onPress={addSchedule}>
          <Text style={styles.buttonText}>Add Schedule</Text>
        </TouchableOpacity>
      </View>

      {schedules.length > 0 && (
        schedules.map((schedule) => (
          <View key={schedule.id} style={styles.scheduleCard}>
            {schedule.editable ? (
              <>
                <TextInput
                  style={[styles.scheduleInput, styles.editableInput]}
                  value={schedule.nameOfBusStation}
                  onChangeText={(text) => editSchedule(schedule.id, 'nameOfBusStation', text)}
                />
                <TextInput
                  style={[styles.scheduleInput, styles.editableInput]}
                  value={schedule.numberOfBuses}
                  onChangeText={(text) => editSchedule(schedule.id, 'numberOfBuses', text)}
                  keyboardType="numeric"
                />
                
              </>
            ) : (
              <>
                <Text style={styles.text}>
                  <Text style={styles.label}>Bus station:</Text> {schedule.nameOfBusStation}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.label}>Number of buses:</Text> {schedule.numberOfBuses}
                </Text>
              </>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => toggleEdit(schedule.id)}
              >
                <Text style={styles.buttonText}>
                  {schedule.editable ? 'Save' : 'Edit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigateToUpdateBusPage(schedule.id)}
              >
                <Text style={styles.buttonText}>Update Buses</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeSchedule(schedule.id)}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>

    {/* Bottom Navigation */}
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => navigation.navigate("Home",{role:'OPERATOR'})} style={styles.navItem}>
        <Icon name="home-outline" size={25} color="#59B3F8" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("updateschedule")} style={styles.navItem}>
        <Icon name="calendar-clock" size={25} color="#59B3F8" />
        <Text style={styles.navText}>Schedule</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("feedback",{role:'OPERATOR'})} style={styles.navItem}>
        <Icon name="comment-outline" size={25} color="#59B3F8" />
        <Text style={styles.navText}>Feedback</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate(role === "OPERATOR" ? 'ReportMissingOD' : 'ReportMissingS')} style={styles.navItem}>
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
    padding: 20,
    backgroundColor: '#f8ffff',
    paddingTop: 0,
    //paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2C3E50',
    
  },
  form: {
    marginBottom: 20,
    backgroundColor: '#F1F8FF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#59B3F8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderTopColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scheduleCard: {
    backgroundColor: '#F1F8FF',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  scheduleInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
  },
  editableInput: {
    backgroundColor: '#FFFBEA',
    borderColor: '#F0C674',
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495E',
  },
  label: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  editButton: {
    backgroundColor: '#59B3F8',
    padding: 10,
    borderRadius: 10,
  },
  updateButton: {
    backgroundColor: '#59B3F8',
    padding: 10,
    borderRadius: 10,
  },
  removeButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#59B3F8",
    paddingVertical: 10,
    paddingHorizontal:20,
    marginHorizontal: -20,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  iconContainer: {
    flexDirection: "row",
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    //marginHorizontal: -20,
    //marginTop: 'auto', 
   //marginVertical: 0, 
    position: 'absolute', 
  bottom: 0, 
  left: 0,
  right: 0,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#59B3F8',
    marginTop: 5,
  },
  menu: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop:150,
  },
  menuItem: {
    width: "45%", // Adjusted for a grid layout
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    elevation: 5, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    color: "#666",
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  citySelector: {
    position: 'relative',
    marginBottom: 1,
    paddingVertical: 5,
    
    
  },
  cityButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopColor: '#e0e0e0',
    //backgroundColor: '#59B3F8',
    borderRadius: 10,
    marginBottom: 1,
    alignItems: 'center',
    borderTopWidth: 1,
    marginHorizontal: -20,
    //marginVertical:75,
   // width:200,
    paddingVertical: 10,
  paddingHorizontal: 10,
  borderWidth: 1.4,         
    borderColor: '#DDDDDD',  
    borderRadius: 1,        
    borderStyle: 'solid',
  
  },
  cityButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    marginLeft: 10,
  },
  cityMenu: {
    marginTop: 8,
    position: 'absolute',
    top: 40,
    backgroundColor: '#fff',
    borderRadius: 1,
    width: 350,
    height:83,
    elevation: 5,
    zIndex: 1,
    borderWidth: 1.4,         
    borderColor: '#DDDDDD',  
    borderRadius: 5,        
    borderStyle: 'solid',
  },
  cityOption: {
    padding: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  cityOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default updateschedule;