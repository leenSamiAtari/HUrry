import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,Keyboard,TouchableWithoutFeedback,ScrollView } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const notification = ({ route, navigation }) => {
    const { role: userRole } = route.params;
    const [message, setMessage] = useState('');
    const [userMessage, setUserMessage] = useState('');
    const [selectedRole, setSelectedRole] = useState('STUDENT');
    const [userId, setUserId] = useState('');
    const [notificationsList, setNotificationsList] = useState([]);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [notificationType, setNotificationType] = useState('ANNOUNCEMENT'); // 'ANNOUNCEMENT' or 'EMERGENCY'

    const API_URLS = {
        OPERATOR: {
            SEND: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/announcements/create',
        },
        OTHERS: {
            GET: 'https://2fbd-2a01-9700-80db-d300-10c1-b5b3-7169-c9e6.ngrok-free.app/announcements/view'
        }
    };

    useEffect(() => {
        const getToken = async () => {
            const authToken = await AsyncStorage.getItem('authToken');
            if (authToken) {
                setToken(authToken);
                if (userRole !== 'OPERATOR') {
                    fetchNotifications(authToken);
                }
            } else {
                Alert.alert('Error', 'No token found');
            }
        };
        getToken();
    }, [userRole]);

    const fetchNotifications = useCallback(async (authToken) => {
        setLoading(true);
        try {
            const response = await fetch(API_URLS.OTHERS.GET, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            console.log('Notifications data:', data);
            if (response.ok) {
                setNotificationsList(Array.isArray(data) ? data : []);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'An error occurred while fetching notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    const sendNotificationToRole = async () => {
        if (!token) {
            Alert.alert('Error', 'No token available');
            return;
        }
        
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter a message');
            return;
        }

        try {
            const response = await fetch(API_URLS.OPERATOR.SEND, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: selectedRole,
                    message: message,
                    type: notificationType // Add notification type to the request
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Notification sent successfully');
                setMessage('');
            } else {
                Alert.alert('Error', data.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Send error:', error);
            Alert.alert('Error', 'An error occurred while sending notification');
        }
    };

    const sendNotificationToUser = async () => {
        if (!token) {
            Alert.alert('Error', 'No token available');
            return;
        }
        
        if (!userId) {
            Alert.alert('Error', 'Please enter a user ID');
            return;
        }

        if (!userMessage.trim()) {
            Alert.alert('Error', 'Please enter a message');
            return;
        }

        try {
            const response = await fetch(API_URLS.OPERATOR.SEND, {  
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: selectedRole,
                    message: userMessage,
                    userId: userId,
                    type: notificationType // Add notification type to the request
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Notification sent successfully');
                setUserMessage('');
                setUserId('');
            } else {
                Alert.alert('Error', data.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Send error:', error);
            Alert.alert('Error', 'An error occurred while sending notification');
        }
    };

    const deleteNotificationFrontend = (notificationId) => {
        setNotificationsList(notificationsList.filter(item => item.id !== notificationId));
        Alert.alert('Success', 'Notification deleted');
    };

    const renderNotificationItem = ({ item, index }) => {
        const isEmergency = item.type === 'EMERGENCY';
      
        return (
            <View style={[
                styles.notificationItem,
                isEmergency && styles.emergencyNotification
            ]}>
                <View style={styles.notificationHeader}>
                    <Icon 
                        name={isEmergency ? "alert-circle-outline" : "bell-alert-outline"} 
                        size={20} 
                        color={isEmergency ? '#FF5252' : '#59B3F8'} 
                    />
                    <Text style={[
                        styles.notificationNumber,
                        isEmergency && styles.emergencyText
                    ]}> {index + 1}</Text>
                </View>
                <Text style={[
                    styles.notificationText,
                    isEmergency && styles.emergencyText
                ]}>{item.message}</Text>
                <Text style={[
                    styles.notificationDetails,
                    isEmergency && styles.emergencyText
                ]}>
                    Sent at: {new Date(item.sentAt).toLocaleString()}
                </Text>
               
                {isEmergency && (
                    <Text style={styles.emergencyTag}>EMERGENCY</Text>
                )}
                
                {/* Delete Button */}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            'Confirm Delete',
                            'Are you sure you want to delete this notification?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', onPress: () => deleteNotificationFrontend(item.id), style: 'destructive' },
                            ]
                        );
                    }}
                >
                    <Icon name="delete-outline" size={20} color="#FF5252" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
            {/* Top Bar */}
           <View style={styles.topBar}>
                   <Text style={styles.appName}>HUrry</Text>
                   <View style={styles.iconContainer}>
                     <TouchableOpacity onPress={() => navigation.navigate("notification", { userRole })}>
                       <Icon name="bell-outline" size={25} color="#fff" />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => navigation.navigate("profileop", { userRole })} style={{ marginLeft: 15 }}>
                       <Icon name="account-circle-outline" size={25} color="#fff" />
                     </TouchableOpacity>
                   </View>
                 </View>
                 <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    bounces={true}
                    alwaysBounceVertical={true}
                    showsVerticalScrollIndicator={true}
      >

            <Text style={styles.title}>Notifications {userRole}</Text>

            {loading && <ActivityIndicator size="large" color="#59B3F8" />}

            {userRole === 'OPERATOR' ? (
               <View style={styles.dashboard}>
               {/* Notification Type Selector */}
               <View style={styles.typeSelector}>
                   <TouchableOpacity
                       style={[
                           styles.typeButton, 
                           notificationType === 'ANNOUNCEMENT' && styles.selectedTypeButton
                       ]}
                       onPress={() => setNotificationType('ANNOUNCEMENT')}
                   >
                       <Text style={styles.typeButtonText}>Announcement</Text>
                   </TouchableOpacity>
                   <TouchableOpacity
                       style={[
                           styles.typeButton, 
                           notificationType === 'EMERGENCY' && styles.emergencyTypeButton
                       ]}
                       onPress={() => setNotificationType('EMERGENCY')}
                   >
                       <Text style={styles.typeButtonText}>Emergency</Text>
                   </TouchableOpacity>
               </View>
               
               {/* Section 1: Send to All Users */}
               <View style={styles.sectionContainer}>
                   <Text style={styles.sectionTitle}>Send to All: </Text>
                   
                   <View style={styles.roleSelector}>
                       <TouchableOpacity
                           style={[styles.roleButton, selectedRole === 'STUDENT' && styles.selectedRoleButton]}
                           onPress={() => setSelectedRole('STUDENT')}
                       >
                           <Text style={styles.roleButtonText}>Students</Text>
                       </TouchableOpacity>
                       <TouchableOpacity
                           style={[styles.roleButton, selectedRole === 'DRIVER' && styles.selectedRoleButton]}
                           onPress={() => setSelectedRole('DRIVER')}
                       >
                           <Text style={styles.roleButtonText}>Drivers</Text>
                       </TouchableOpacity>
                   </View>
                   
                   <TextInput
                       style={styles.input}
                       placeholder="Type your message here..."
                       value={message}
                       onChangeText={setMessage}
                       multiline
                   />
                   
                   <TouchableOpacity 
                       style={[
                           styles.sendButton,
                           notificationType === 'EMERGENCY' && styles.emergencySendButton
                       ]} 
                       onPress={sendNotificationToRole}
                   >
                       <Text style={styles.sendButtonText}>
                           Send to All {selectedRole}S ({notificationType === 'EMERGENCY' ? 'EMERGENCY' : 'Announcement'})
                       </Text>
                   </TouchableOpacity>
               </View>
       
               {/* Divider */}
               <View style={styles.divider} />
       
               {/* Section 2: Send to Specific User */}
               <View style={styles.sectionContainer}>
                   <Text style={styles.sectionTitle}>Send to Specific User:</Text>
                   
                   <TextInput
                       style={styles.input}
                       placeholder="Enter User ID"
                       value={userId}
                       onChangeText={setUserId}
                   />
                   
                   <TextInput
                       style={styles.input}
                       placeholder="Type your message here..."
                       value={userMessage}
                       onChangeText={setUserMessage}
                       multiline
                   />
                   
                   <TouchableOpacity 
                       style={[
                           styles.sendButton,
                           notificationType === 'EMERGENCY' && styles.emergencySendButton
                       ]} 
                       onPress={sendNotificationToUser}
                   >
                       <Text style={styles.sendButtonText}>
                           Send to User ({notificationType === 'EMERGENCY' ? 'EMERGENCY' : 'Announcement'})
                       </Text>
                   </TouchableOpacity>
               </View>
           </View>
           
       ) : (
                <View style={styles.dashboard}>
                    <Text style={styles.subtitle}>Your Notifications:</Text>
                    <FlatList
                        data={notificationsList}
                        renderItem={renderNotificationItem}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <Text style={styles.noNotifications}>
                                {loading ? 'Loading...' : 'No notifications available'}
                            </Text>
                        }
                    />
                </View>
            )}
        </ScrollView>
            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                    <TouchableOpacity onPress={() => navigation.navigate("Home", { role })} style={styles.navItem}>
                      <Icon name="home-outline" size={25} color="#59B3F8" />
                      <Text style={styles.navText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(role === "OPERATOR" ? 'updateschedule' : 'busSchedule')} style={styles.navItem}>
                      <Icon name="calendar-clock" size={25} color="#59B3F8" />
                      <Text style={styles.navText}>Schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("feedback",{userRole})} style={styles.navItem}>
                      <Icon name="comment-outline" size={25} color="#59B3F8" />
                      <Text style={styles.navText}>Feedback</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(role === "OPERATOR" ? 'ReportMissingOD' : 'ReportMissingS')} style={styles.navItem}>
                      <Icon name="alert-circle-outline" size={25} color="#59B3F8" />
                      <Text style={styles.navText}>Missing</Text>
                    </TouchableOpacity>
                  </View>
                </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 9,
        paddingTop: 0,
        paddingBottom: 60,
        backgroundColor: '#f8ffff',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2C3E50',
        marginTop: 20,
    },
    dashboard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 3,
        borderColor: '#ddd',
        borderWidth: 0.4,
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        marginHorizontal: -16,  
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 10,
        color: '#555',
    },
    notificationItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f9f9f9', 
        borderRadius: 8,            
        marginBottom: 10,          
    },
    emergencyNotification: {
        backgroundColor: '#FFEBEE',
        borderLeftWidth: 4,
        borderLeftColor: '#FF5252',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    notificationNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#59B3F8',
        marginLeft: 8,
    },
    emergencyText: {
        color: '#D32F2F',
    },
    notificationText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    notificationDetails: {
        fontSize: 12,
        color: '#777',
        fontStyle: 'italic',
    },
    emergencyTag: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF5252',
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'auto',
    },
    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    typeButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#eee',
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    selectedTypeButton: {
        backgroundColor: '#59B3F8',
    },
    emergencyTypeButton: {
        backgroundColor: '#FF5252',
    },
    typeButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    sendButton: {
        backgroundColor: '#59B3F8',
        borderWidth:1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        borderColor:'#59B3F8',
        alignSelf:'center',
    },
    emergencySendButton: {
        backgroundColor: '#FF5252',
        borderColor: '#FF5252',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight:'40',
    },
    scrollContainer: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 80, 
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 10,
        padding: 8,
        backgroundColor: '#FFEBEE',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    deleteButtonText: {
        color: '#FF5252',
        fontSize: 14,
        marginLeft: 5,
        fontWeight: '500',
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
        fontWeight: 'bold',
        color: '#fff',
    },
    iconContainer: {
        flexDirection: 'row',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: 60,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
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
    roleSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    roleButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#eee',
    },
    selectedRoleButton: {
        backgroundColor: '#E57373',
    },
    roleButtonText: {
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 15,
    },
});

export default notification;