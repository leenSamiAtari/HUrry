import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Home = ({ navigation, route }) => {
  const { role } = route.params; // Role passed from the sign-in page
   const { token } = route.params;

  const studentMenuItems = [
    {
      title: "Closest Bus Station",
      icon: "map-marker-radius",
      action: () => navigation.navigate("ClosestBusStation", {role:'STUDENT'}),
    },
    {
      title: "Give Feedback",
      icon: "comment-outline",
      action: () => navigation.navigate("evaluation", {role}),
    },
    {
      title: "Report Missing Items",
      icon: "alert-circle-outline",
      action: () => navigation.navigate("ReportMissingS",{
        role: 'STUDENT'})
    },
    {
      title: "View Bus Schedule",
      icon: "calendar-clock",
      action: () => navigation.navigate("busSchedule"),
    },
    {
      title: "View Notifications",
      icon: "bell-outline",
      action: () => navigation.navigate("notification", {role}),
    },
    {
      title: "Messages",
      icon: "email",
      action: () => navigation.navigate("feedback", { role }),
    },
  ];
  const operatorMenuItems = [
    {
      title: "Update Bus Schedule",
      icon: "pencil-outline",
      action: () => navigation.navigate("updateschedule"),
    },
    {
      title: "Missing Items Reports",
      icon: "alert-circle-outline",
      action: () => navigation.navigate("ReportMissingOD" ,{role}),
    },
    {
      title: "Notify Students",
      icon: "message-alert-outline",
      action: () => navigation.navigate("notification", {role}),
    },
    {
      title: "Students' Feedback",
      icon: "account-check-outline",
      action: () => navigation.navigate("evaluation", {role}),
    },
    {
      title: "View Notifications",
      icon: "bell-ring-outline",
      action: () => navigation.navigate("notification", {role}),
    },
    {
      title: "Messages",
      icon: "email",
      action: () => navigation.navigate("feedback", { role }),
    },
  ];
  
  const driverMenuItems = [
    {
      title: "Missing Items Reports",
      icon: "alert-circle-outline",
      action: () => navigation.navigate("ReportMissingOD" ,{role}),
    },
    {
      title: "Notify Students",
      icon: "message-alert-outline",
      action: () => navigation.navigate("notification", {role}),
    },
    {
      title: "View Notifications",
      icon: "bell-ring-outline",
      action: () => navigation.navigate("notification",{role}),
    },
    {
      title: "Messages",
      icon: "email",
      action: () => navigation.navigate("feedback", { role }),
    },
  ];
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };
  
  const menuItems = 
  role === "OPERATOR" ? operatorMenuItems : 
  role === "DRIVER" ? driverMenuItems : 
  studentMenuItems;

  return (
    <ScrollView contentContainerStyle={styles.container}>
       {/* Top Bar */}
       <View style={styles.topBar}>
        <Text style={styles.appName}>HUrry</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("notification", {role})}>
            <Icon name="bell-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile", {role})} style={{ marginLeft: 15 }}>
            <Icon name="account-circle-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
<Text style={styles.header}>{getTimeBasedGreeting()}, <Text style={styles.role}>{formatRole(role)}</Text>!</Text>
<Text style={styles.subHeader}>How can we assist you today?</Text>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.action}
          >
            <Icon name={item.icon} size={30} color="#59B3F8" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

     {/* Bottom Navigation */}
     <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("Home",{role})} style={styles.navItem}>
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
        <TouchableOpacity onPress={() => navigation.navigate(role === "OPERATOR" ? 'ReportMissingOD' : 'ReportMissingS')} style={styles.navItem}>
          <Icon name="alert-circle-outline" size={25} color="#59B3F8" />
          <Text style={styles.navText}>Missing</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'rgba(89, 179, 248, 0.09)',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    textAlign: "center",
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 30,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 40,
  },
  footerLinkText: {
    fontSize: 16,
    color: "#59B3F8",
    marginLeft: 5,
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
    marginHorizontal: -20,
    marginVertical:75,
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
  role: {
    color: "#59B3F8",  
  },
});

export default Home;

