import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BusDetails = ({ route, navigation }) => {
  const { role,scheduleId,operatorEmail,numberOfBuses } = route.params;
  const [busDetails, setBusDetails] = useState([]);

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        
        console.log('Auth Token:', authToken);
        if (!authToken) {
          throw new Error('No authentication token found');
        }
        const apiUrl = 'https://a1d2-109-107-251-133.ngrok-free.app/buses/all'; 

        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Bus details fetched from API:', data); 
        setBusDetails(data);

        
        
      } catch (error) {
        console.log('Error fetching bus details:', error);
        
       
      }
    };

    fetchBusDetails();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>HUrry</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("notification",{role:'STUDENT'})}>
            <Icon name="bell-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("profileop",{role:'STUDENT'})} style={{ marginLeft: 15 }}>
            <Icon name="account-circle-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.header}>Bus Details</Text>

      {/* Bus Details Table */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
  <View style={styles.tableContainer}>
    <View style={styles.table}>
      {/* Header Row */}
      <View style={styles.tableHeader}>
        <View style={styles.iconHeaderCell}>
          <Icon name="bus" size={18} color="#2C3E50" />
          <Text style={[styles.tableHeaderText, styles.busNumberCell]}>Bus </Text>
        </View>
        <View style={styles.iconHeaderCell}>
          <Icon name="account" size={18} color="#2C3E50" />
          <Text style={[styles.tableHeaderText, styles.driverCell]}>Driver</Text>
        </View>
        <View style={styles.iconHeaderCell}>
          <Icon name="clock-time-four-outline" size={18} color="#2C3E50" />
          <Text style={[styles.tableHeaderText, styles.timeCell]}>Arrival time</Text>
        </View>
        <View style={styles.iconHeaderCell}>
          <Icon name="clock-time-three-outline" size={18} color="#2C3E50" />
          <Text style={[styles.tableHeaderText, styles.timeCell]}>Departure </Text>
        </View>
        <View style={styles.iconHeaderCell}>
          <Icon name="email-outline" size={18} color="#2C3E50" />
          <Text style={[styles.tableHeaderText, styles.emailCell]}>Email</Text>
        </View>
      </View>
      
      {/* Data Rows */}
      {busDetails.length > 0 ? (
        busDetails.map((bus, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.iconDataCell}>
              <Text style={[styles.tableCell, styles.busNumberCell]}>{bus.numberOfBuses}</Text>
            </View>
            <View style={styles.iconDataCell}>
              <Text style={[styles.tableCell, styles.driverCell]}>{bus.driverName}</Text>
            </View>
            <View style={styles.iconDataCell}>
              <Text style={[styles.tableCell, styles.timeCell]}>{bus.arrivalTime}</Text>
            </View>
            <View style={styles.iconDataCell}>
              <Text style={[styles.tableCell, styles.timeCell]}>{bus.departureTime}</Text>
            </View>
            <View style={styles.iconDataCell}>
              <Text style={[styles.tableCell, styles.emailCell]}>{bus.driverEmail}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No bus details available.</Text>
      )}
    </View>
  </View>
</ScrollView>
      

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("operator",{role:'STUDENT'})} style={styles.navItem}>
          <Icon name="home-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("BusSchedule")} style={styles.navItem}>
          <Icon name="calendar-clock" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("feedback",{role:'STUDENT'})} style={styles.navItem}>
          <Icon name="comment-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ContactUs",{role:'STUDENT'})} style={styles.navItem}>
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2C3E50',
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1.4,
    borderColor: '#e0e6ed',
    borderRadius: 6,
    //borderStyle: 'solid',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderColor: '#59B3F8',
    paddingBottom: 12,
    marginBottom: 8,
    backgroundColor: '#f5f9ff',
    borderRadius: 8,
    //paddingHorizontal: 5,
    minWidth: 400,
  },
  tableHeaderText: {
    fontWeight: '700',
    color: '#2C3E50',
    fontSize: 15,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    //paddingHorizontal: 5,
    minWidth: 400,
    
  },
  tableCell: {
   // width: 100,
    //flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    paddingHorizontal: 8, // خلاه ينزل سطر بدل 3
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
    paddingVertical: 20,
    fontStyle: 'italic',
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
  tableContainer: {
    flexDirection: 'column',
    minWidth: 400, 
  },
  busNumberCell: {
    width: 26, 
  },
  driverCell: {
    width: 100, 
  },
  timeCell: {
    width: 80,
  },
  emailCell: {
    width: 140,
  },
  iconHeaderCell: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    color:"#59B3F8",
  },
  iconDataCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    color:"#59B3F8",
  },
  tableHeaderText: {
    fontWeight: '700',
    color: '#2C3E50',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    
  },
});

export default BusDetails;