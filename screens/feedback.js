import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet,
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Pressable
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const feedback = ({ route, navigation }) => {
  const { role } = route.params;
  const [formData, setFormData] = useState({
    content: '',
    receiverEmail: '',
    receiverRole: '',
    
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const receiverRoles = ['STUDENT', 'OPERATOR', 'DRIVER'];
  const filteredReceiverRoles = receiverRoles.filter(r => r !== role);

  const API_URLS = {
    SEND: 'https://c54e-91-186-230-143.ngrok-free.app/comments/submit',
    RECEIVE: 'https://c54e-91-186-230-143.ngrok-free.app/comments/page'
  };

  useEffect(() => {
    const getTokenAndData = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        if (authToken) {
          setToken(authToken);
          await fetchMessages(authToken);
        }
      } catch (error) {
        console.error('Token error:', error);
        Alert.alert('Error', 'Failed to load authentication token');
      }
    };
    getTokenAndData();
  }, [role]);

  const handleSubmit = async () => {
    if (!formData.content || !formData.receiverEmail || !formData.receiverRole) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_URLS.SEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: formData.content,
          receiverEmail: formData.receiverEmail,
          receiverRole: formData.receiverRole,
         // bus_number: 0
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Invalid response from server');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Message sending failed');
      }

      Alert.alert('Success', 'Message sent successfully!');
      setFormData({ content: '', receiverEmail: '', receiverRole: '' });
      await fetchMessages(token);
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(API_URLS.RECEIVE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Raw response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch messages');
      }

      const formattedMessages = Array.isArray(data) ? data.map(item => ({
        content: item.content || '',
        senderName: item.senderName || 'Unknown',
        senderEmail: item.senderEmail || 'N/A',
        senderRole: item.senderRole || '',
        receiverEmail: item.receiverEmail || '',
        receiverRole: item.receiverRole || '',
        sentAt: item.sentAt || new Date().toISOString()
      })) : [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackHeader}>
        <Icon name="account-circle" size={20} color="#59B3F8" />
        <Text style={styles.feedbackNumber}>{index + 1}</Text>
        <Text style={styles.feedbackTitle}>Message</Text>
      </View>
      <Text style={styles.feedbackContent}>{item.content}</Text>
      <View style={styles.feedbackDetails}>
        <Text style={styles.detailText}>
          <Icon name="account" size={14} color="#666" /> From: {item.senderName} ({item.senderRole})
        </Text>
        <Text style={styles.detailText}>
          <Icon name="email" size={14} color="#666" /> Sender Email: {item.senderEmail}
        </Text>
        
        
      </View>
      <Text style={styles.feedbackDate}>
        <Icon name="clock-outline" size={14} color="#999" /> 
        {item.sentAt ? new Date(item.sentAt).toLocaleString() : 'Unknown date'}
      </Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {role === 'STUDENT' ? 'Messages' : 'Messages'}
          </Text>
        </View>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#59B3F8" />
          </View>
        )}

        <ScrollView style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Message</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Write your message here..."
              value={formData.content}
              onChangeText={(text) => setFormData({...formData, content: text})}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Receiver Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter receiver email..."
              value={formData.receiverEmail}
              onChangeText={(text) => setFormData({...formData, receiverEmail: text})}
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Receiver Role</Text>
            <TouchableOpacity 
              style={styles.dropdownInput}
              onPress={() => setModalVisible(true)}
            >
              <Text style={formData.receiverRole ? styles.dropdownText : styles.dropdownPlaceholder}>
                {formData.receiverRole || 'Select receiver role'}
              </Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {filteredReceiverRoles.map((roleItem) => (
                    <Pressable
                      key={roleItem}
                      style={styles.modalItem}
                      onPress={() => {
                        setFormData({...formData, receiverRole: roleItem});
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{roleItem}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={[styles.modalItem, {borderTopWidth: 1, borderTopColor: '#eee'}]}
                    onPress={() => {
                      setFormData({...formData, receiverRole: ''});
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>Clear Selection</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
          
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Send Message</Text>
          </TouchableOpacity>
        </ScrollView>

        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No messages found'}
            </Text>
          }
        />

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
            <Text style={styles.navText}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ContactUs",{role})} style={styles.navItem}>
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
    backgroundColor: "#f8ffff",
    paddingBottom: 60,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  form: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1, 
    borderColor: '#ddd',
    marginTop:5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    fontSize: 16,
    color: "#333",
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  feedbackItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#59B3F8',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  feedbackNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#59B3F8',
    marginLeft: 8,
    marginRight: 10,
  },
  feedbackTitle: {
    color: '#59B3F8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  feedbackContent: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
    lineHeight: 22,
  },
  feedbackDetails: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#59B3F8",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#59B3F8',
    paddingVertical:4,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#4a9bd6',
    alignSelf:'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default feedback;