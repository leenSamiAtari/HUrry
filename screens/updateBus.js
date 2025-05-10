import React, { useState, useEffect } from 'react';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const updateBus = ({ route, navigation }) => {
  const { scheduleId, numberOfBuses } = route.params;

  const [busData, setBusData] = useState(
    Array.from({ length: numberOfBuses }, (_, i) => ({
      numberOfBuses: i + 1,
      driverName: '',
      arrivalTime: '',
      departureTime: '',
      driverEmail: '',
    }))
  );

  const [savedData, setSavedData] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    
    const loadToken = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        if (authToken) {
          setToken(authToken);
        }
      } catch (error) {
        console.log('Error loading token:', error);
      }
    };
  
    loadToken();
  }, []);

  const updateBusStatus = (index, field, value) => {
    const updatedData = [...busData];
    updatedData[index][field] = value;
    setBusData(updatedData);
  };

  const saveUpdates = async () => {
    const isAnyFieldEmpty = busData.some(bus => 
      !bus.driverName || !bus.arrivalTime || !bus.departureTime || !bus.driverEmail
    );

    if (isAnyFieldEmpty) {
      Alert.alert('Error', 'Please fill all fields before saving.');
      return;
    }

    try {
      const response = await fetch('https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/buses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(busData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

     //await AsyncStorage.setItem('busData', JSON.stringify(busData));
      setSavedData(busData);
      Alert.alert('Success', 'Bus data saved successfully!');
    } catch (error) {
      console.log('Error saving data:', error);
      Alert.alert('Error', 'Failed to save bus data.');
    }
  };

  return (
    <View style={styles.container}>
      {/* top*/}
      <View style={styles.topBar}>
        <Text style={styles.appName}>HUrry</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("notification",{role:'OPERATOR'})}>
            <Icon name="bell-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile",{role:'OPERATOR'})} style={{ marginLeft: 15 }}>
            <Icon name="account-circle-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.header}>Update Bus Information</Text>

      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}numberOfLines={1} 
      ellipsizeMode="tail">
            <Text style={styles.tableCell}>Bus Number</Text>
            <Text style={styles.tableCell}>Driver name</Text>
            <Text style={styles.tableCell}>Arrival time</Text>
            <Text style={styles.tableCell}>Departure time </Text>
            <Text style={styles.tableCell}>Driver email</Text>
          </View>
          {busData.map((bus, index) => (
            <View key={index} style={styles.tableRow}>
     
      <Text style={styles.tableCell}>{bus.numberOfBuses}</Text>
              <TextInput
                style={styles.input}
                value={bus.driverName}
                onChangeText={(text) => updateBusStatus(index, 'driverName', text)}
                placeholder="Driver Name"
              />
              <TextInput
                style={styles.input}
                value={bus.arrivalTime}
                onChangeText={(text) => updateBusStatus(index, 'arrivalTime', text)}
                placeholder="Arrival Time"
              />
              <TextInput
                style={styles.input}
                value={bus.departureTime}
                onChangeText={(text) => updateBusStatus(index, 'departureTime', text)}
                placeholder="Departure Time"
              />
              <TextInput
                style={styles.input}
                value={bus.driverEmail}
                onChangeText={(text) => updateBusStatus(index, 'driverEmail', text)}
                placeholder="Driver Email"
              />
            </View>
          ))}
        </View>

        {/* saving schedule*/}
        {savedData.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.savedHeader }numberOfLines={1} 
      ellipsizeMode="tail">Saved Bus Information</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Bus Number</Text>
                <Text style={styles.tableCell}>Driver name</Text>
                <Text style={styles.tableCell}>Arrival time</Text>
                <Text style={styles.tableCell}>Departur time</Text>
                <Text style={styles.tableCell}>Driver email</Text>
              </View>
              {savedData.map((bus, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{bus.numberOfBuses}</Text>
                  <Text style={styles.tableCell}>{bus.driverName}</Text>
                  <Text style={styles.tableCell}>{bus.arrivalTime}</Text>
                  <Text style={styles.tableCell}>{bus.departureTime}</Text>
                  <Text style={styles.tableCell}>{bus.driverEmail}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={saveUpdates}>
          <Text style={styles.buttonText}>Save Updates</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* bottom*/}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("opertor",{role:'OPERATOR'})} style={styles.navItem}>
          <Icon name="home-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("BusSchedule")} style={styles.navItem}>
          <Icon name="calendar-clock" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("feedback",{role:'OPERATOR'})} style={styles.navItem}>
          <Icon name="comment-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ContactUs",{role:'OPERATOR'})} style={styles.navItem}>
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
    padding: 8,
    backgroundColor: '#f8ffff',
    paddingTop: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2C3E50',
    marginTop: 20,
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.4,         
    borderColor: '#DDDDDD',  
    borderRadius: 5,        
    borderStyle: 'solid',
  },
  tableHeader: {
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#DDDDDD',
    paddingBottom: 10,
    marginBottom: 15,
  
    //ellipsizeMode:"tail" ,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
    
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 5,
    fontSize: 14,
    minWidth: 15,
    
    
  },
  input: {
    flex: 1,
    padding:10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    color: '#34495E',
    fontSize: 12, 
    marginHorizontal: 2, 
    height: 40, 
    minWidth: 15,
  },
  savedHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1A5276',
  },
  saveButton: {
    backgroundColor: '#59B3F8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#59B3F8",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    height: 58,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginHorizontal: -20,
    marginTop: 'auto', 
    marginVertical: 0, 
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
});

export default updateBus;