import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image, FlatList } from 'react-native';
import { Button, TextInput, RadioButton, Text, Card, IconButton, FAB, Icon, Switch } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const API_URL = "https://9557-91-186-250-146.ngrok-free.app";


const ReportMissingS = ({ navigation, route }) => {
  const { name, email} = route.params || {};
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentReport, setCurrentReport] = useState({
    category: '',
    description: '',
    brand: '',
    model: '',
    containsItems: false,
    itemsInside: '',
    uniqueFeatures: '',
    dateLost: new Date(),
    timeApproximate: new Date(),
    locationType: 'station',
    station: '',
    busNumber: '',
    photos: [],
    status: 'pending',
    name,
    email,
    dateSubmitted: new Date(),
    isEditing: false,
    phoneNumber: '',
  sharePhone: false,
  });

  useEffect(() => {
    
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await fetch(`${API_URL}/report-missing/create`,{
          headers: {
           'Authorization' : `Bearer ${token}`
          }
        }
      );
        const data = await response.json();
        const convertedData = data.map(item => ({
          ...item,
          dateLost: new Date(item.dateLost),
          timeApproximate: new Date(item.timeApproximate),
          dateSubmitted: new Date(item.dateSubmitted)
        }));
        
        setReports(convertedData);
        setReports(data);
      } catch (err) {
        setError(err.message);
        Alert.alert('Error', 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!showForm) {
      fetchReports();
    }
  }, [showForm]);

  const ReportItem = ({ item, index }) => (
    <Card style={styles.reportItem}>
      <Card.Content>
        <Text style={styles.reportTitle}>{item.category || 'Uncategorized Item'}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Submitted: {item.dateSubmitted.toLocaleDateString()}</Text>
        <View style={styles.itemActions}>
        {item.status === 'pending' && (
          <Button 
            mode="contained" 
            onPress={() => handleMarkAsFound(index)}
            style={styles.foundButton}
            labelStyle={{ color: 'white' }}
          >
            Mark as Found
          </Button>
        )}
          <Button mode="contained-tonal" onPress={() => handleEditReport(index)} style={styles.editButton} labelStyle={{ color: 'white' }}>
            Edit
          </Button>
          <Button mode="outlined" onPress={() => handleDeleteReport(index)} style={styles.deleteButton} labelStyle={{ color: 'white' }}>
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const handleNewReport = () => {
    setCurrentReport({
      category: '',
      description: '',
      brand: '',
      model: '',
      containsItems: false,
      itemsInside: '',
      uniqueFeatures: '',
      dateLost: new Date(),
      timeApproximate: new Date(),
      locationType: 'station',
      station: '',
      busNumber: '',
      photos: [],
      status: 'pending',
      name,
      email,
      dateSubmitted: new Date(),
      isEditing: false,
      phoneNumber: '',
      sharePhone: false,
    });
    setShowForm(true);
  };

  const handleEditReport = (index) => {
    const reportId = reports[index].id;
    const reportToEdit = reports.find(report => report.id === reportId);
    setCurrentReport({
      ...reportToEdit,
      isEditing: true,
      id: reportId 
    });
    setShowForm(true);
  };

  const handleDeleteReport = async (index) => {
    const id = reports[index].id;
    try {
      const token = await SecureStore.getItemAsync('userToken');

      const response = await fetch(`${API_URL}/report-missing/create/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: id }),
      });
      
      if (!response.ok) throw new Error('Failed to delete report');
      
      const updatedReports = reports.filter((_, i) => i !== index);
      setReports(updatedReports);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const MandatoryLabel = () => <Text style={{ color: 'red' }}>*</Text>;

  const validateForm = () => {
    const requiredFields = {
      category: true,
      description: true,
      locationType: true,
      station: currentReport.locationType === 'station',
      busNumber: false
    };
  
    const missingFields = Object.entries(requiredFields)
      .filter(([field, isRequired]) => isRequired && !currentReport[field])
      .map(([field]) => field);
  
    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in the following required fields:\n\n- ${missingFields
          .map(field => field === 'station' ? 'Station selection' : field)
        .join('\n- ')}`
      );
      return false;
    }
    return true;
  };


  const uploadImage = async (imageSource) => {
  try {
    let fileType = 'image/jpeg'; 
    let formData = new FormData();
    
    if (fileType === 'image/png') {
      fileName = `photo_${Date.now()}.png`;
    } else if (fileType === 'image/gif') {
      fileName = `photo_${Date.now()}.gif`;
    }
    formData.append('file', { 
      uri: imageSource,
      name: `photo_${Date.now()}.${fileType.split('/')[1]}`, 
      type: fileType,
    });

    
    const uploadResponse = await fetch(`${API_URL}/report-missing/create`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Image upload failed:', errorData);
      Alert.alert('Error', 'Failed to upload image.');
      return null; 
    }

    const uploadResult = await uploadResponse.json();
    console.log('Image upload successful:', uploadResult);

    return uploadResult.url;
  } catch (error) {
    console.error('Image upload error:', error);
    Alert.alert('Error', 'Failed to upload image.');
    return null;
  }
};

  const handlePhotoUpload = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please enable photo library access in settings');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    console.log("ImagePicker Result:", result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      const imageUri = selectedAsset.uri;

      if (imageUri) {
        setIsLoading(true); 
        const imageUrl = await uploadImage(imageUri);
        setIsLoading(false);

        if (imageUrl) {
          setCurrentReport(prev => ({
            ...prev,
            photos: [...prev.photos, imageUrl], 
          }));
        }
      }
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to select image');
    console.error("ImagePicker Error:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const method = currentReport.isEditing ? 'PUT' : 'POST';
      const url = currentReport.isEditing 
        ? `${API_URL}/report-missing/create/${currentReport.id}`
        : `${API_URL}/report-missing/create`;

        const payload = {
      category: currentReport.category,
      description: currentReport.description,
      brand: currentReport.brand,
      model: currentReport.model,
      containsItems: currentReport.containsItems,
      itemsInside: currentReport.itemsInside,
      uniqueFeatures: currentReport.uniqueFeatures,
      dateLost: currentReport.dateLost.toISOString(),
      timeApproximate: currentReport.timeApproximate.toISOString(),
      locationType: currentReport.locationType,
      station: currentReport.station,
      busNumber: currentReport.busNumber,
      photoUrls: currentReport.photos, 
      status: currentReport.status,
      name: currentReport.name,
      email: currentReport.email,
      dateSubmitted: currentReport.dateSubmitted.toISOString(),
      phoneNumber: currentReport.phoneNumber,
      sharePhone: currentReport.sharePhone,
      ...(currentReport.isEditing && { id: currentReport.id }), // Include id for editing
    };
    console.log("Submitting payload:", JSON.stringify(payload));

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save report');

      // Refresh reports after submission
      const updatedReports = await fetch(`${API_URL}/report-missing/create`).then(res => res.json());
      setReports(updatedReports);
      
      setShowForm(false);
      Alert.alert('Success', `Report ${currentReport.isEditing ? 'Updated' : 'Submitted'}!`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsFound = async (index) => {
    const id = reports[index].id;
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${API_URL}/report-missing/create/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({ status: 'found' }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      const updatedReports = [...reports];
      updatedReports[index].status = 'found';
      setReports(updatedReports);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>
        {showForm ? (
          <>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.infoTitle}>📋 Reporting Process</Text>
                <Text style={styles.infoText}>
                  1. Fill all mandatory fields (*){'\n'}
                  2. Add photos if available{'\n'}
                  3. Submit your report{'\n'}
                  4. Edit the report anytime a change occur
                </Text>
              </Card.Content>
            </Card>

             {/* Student Info Section */}
        <Card style={styles.userCard}>
          <Card.Content>
            <Text style={styles.userInfo}>
              👤 Reporter: {name}
            </Text>
            <Text style={styles.userInfo}>
              📧 Contact Email: {email}
            </Text>
          </Card.Content>
        </Card>

            <Card style={styles.card}>
              <Card.Content>
              <View style={styles.iconRow}>
              <Icon source="tag" size={20} color="#666" />
                <Text style={styles.label}> Item Category : <MandatoryLabel /></Text></View>
                <Picker
                  selectedValue={currentReport.category}
                  onValueChange={value => setCurrentReport(prev => ({ ...prev, category: value }))}
                  style={styles.picker}
                  dropdownIconColor="#59B3F8"
                >
                  <Picker.Item label="Select Item Category" value="" />
                  <Picker.Item label="Phone" value="phone" />
                  <Picker.Item label="Laptop" value="laptop" />
                  <Picker.Item label="iPad" value="iPad" />
                  <Picker.Item label="Bag/Backpack" value="bag/backpack" />
                  <Picker.Item label="Wallet" value="wallet" />
                  <Picker.Item label="Keys" value="keys" />
                  <Picker.Item label="Purse/Handbag" value="purse/handbag" />
                  <Picker.Item label="Clothing Item" value="clothing" />
                  <Picker.Item label="Headphones/Earphones" value="headphones" />
                  <Picker.Item label="Charger" value="charger" />
                  <Picker.Item label="Hat/Cap" value="hat" />
                  <Picker.Item label="Glasses" value="glasses" />
                  <Picker.Item label="Academic Items" value="academic" />
                  <Picker.Item label="Other" value="other" />
                </Picker>

                {['phone', 'laptop', 'iPad'].includes(currentReport.category) && (
                  <TextInput
                    label="Brand"
                    value={currentReport.brand}
                    onChangeText={text => setCurrentReport(prev => ({ ...prev, brand: text }))}
                    style={styles.input}
                  />
                )}

               {['bag/backpack', 'wallet', 'purse/handbag'].includes(currentReport.category) && (
              <>
                <RadioButton.Group
                value={currentReport.containsItems}
                onValueChange={value => setCurrentReport(prev =>({ ...prev, containsItems: value }))}>
                <View style={styles.radioGroup}>
                  <Text>Did it contain any items?</Text>
                  <RadioButton.Item label="Yes" value={true} />
                  <RadioButton.Item label="No" value={false} />
                </View>
              </RadioButton.Group>

              {currentReport.containsItems && (
                <TextInput
                  label="List items inside"
                  multiline
                  value={currentReport.itemsInside}
                  onChangeText={text => setCurrentReport(prev =>({ ...prev, itemsInside: text }))}
                  style={styles.input}
                />
              )}
            </>
          )}

                <TextInput 
                  label={
                    <View style={{ flexDirection: 'row' }}>
                    <Text>Description </Text>
                    <MandatoryLabel />
                  </View>
                  }
                  multiline
                  value={currentReport.description}
                  onChangeText={text => setCurrentReport(prev => ({ ...prev, description: text }))}
                  placeholder="Color, Shape, Size, etc."
                  style={styles.input}
                />

              <TextInput
                label="Unique Features"
                multiline
                value={currentReport.uniqueFeatures}
                onChangeText={text => setCurrentReport(prev =>({ ...prev, uniqueFeatures: text }))}
                style={styles.input}
                placeholder="Scratches, stickers, etc."
               /> 


                <View style={styles.iconRow}>  
                <Icon source="calendar" size={20} color="#666" />
                <Text style={styles.label}> Date Lost :</Text></View>
                <DateTimePicker
                  value={currentReport.dateLost}
                  mode="date"
                  onChange={(_, date) => {
                    const newDate = date || currentReport.dateLost;
                    // Preserve existing time when changing date
                    const newTime = new Date(
                      newDate.getFullYear(),
                      newDate.getMonth(),
                      newDate.getDate(),
                      currentReport.timeApproximate.getHours(),
                      currentReport.timeApproximate.getMinutes()
                    );
                    setCurrentReport(prev => ({
                      ...prev,
                      dateLost: newTime,
                      timeApproximate: newTime
                    }));
                  }}
                />

                 <View style={styles.iconRow}>
                <Icon source="clock" size={20} color="#666" />
                <Text style={styles.label}> Approximate Time :</Text></View>
                 <View style={styles.timeContainer}>
                     <DateTimePicker
                     value={currentReport.timeApproximate}
                     mode="time"
                     onChange={(_, time) => {
                      const newTime = time || currentReport.timeApproximate;
                      // Merge with existing date
                      const mergedDate = new Date(
                        currentReport.dateLost.getFullYear(),
                        currentReport.dateLost.getMonth(),
                        currentReport.dateLost.getDate(),
                        newTime.getHours(),
                        newTime.getMinutes()
                      );
                      setCurrentReport(prev => ({
                        ...prev,
                        dateLost: mergedDate,
                        timeApproximate: mergedDate
                      }));
                    }}
                     />
                  </View>

                  <View style={styles.iconRow}>
                  <Icon source="map-marker" size={20} color="#666" />
                <Text style={styles.label}> Location : <MandatoryLabel /></Text></View>
                <RadioButton.Group
                  value={currentReport.locationType}
                  onValueChange={value => setCurrentReport(prev => ({ ...prev, locationType: value,  station: value === 'bus' ? '' : prev.station,  busNumber: value === 'station' ? '' : prev.busNumber }))}>
                  <View style={styles.radioGroup}>
                    <RadioButton.Item label="Station" value="station" />
                    <RadioButton.Item label="Bus" value="bus" />
                  </View>
                </RadioButton.Group>

                {currentReport.locationType === 'station' ? (
                  <Picker
                    selectedValue={currentReport.station}
                    onValueChange={value => setCurrentReport(prev => ({ ...prev, station: value }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Station" value="" />
                    <Picker.Item label="North Amman Bus Station" value="North Amman Bus Station" />
                    <Picker.Item label="South bus station" value="South bus station" />
                    <Picker.Item label="Raghadan" value="Ragadan" />
                    <Picker.Item label="Shafa badran" value="Shafa badran" />
                    <Picker.Item label="Sweileh" value="Sweileh" />
                  </Picker>
                ) : (
                  <TextInput
                    label="Bus Number"
                    value={currentReport.busNumber}
                    onChangeText={text => setCurrentReport(prev => ({ ...prev, busNumber: text }))}
                    style={styles.input}
                  />
                )}

                <Card style={styles.card}>
  <Card.Content>
    <View style={styles.switchContainer}>
      <Text variant="bodyMedium" style={styles.phoneQuestion}>
        Can we share your phone number with the operator?
      </Text>
      <Switch 
        value={currentReport.sharePhone}
        onValueChange={value => setCurrentReport(prev => ({
          ...prev, 
          sharePhone: value,
          phoneNumber: value ? prev.phoneNumber : '' // Clear number when switching off
        }))}
      />
    </View>

    {currentReport.sharePhone && (
      <>
        <Text style={styles.phoneNote}>
          This may help speed the communication between you and the operator
        </Text>
        
        <View style={styles.phoneInputContainer}>
          <View style={styles.phonePrefix}>
            <Text style={{fontSize: 20}}>🇯🇴</Text>
            <Text>+962</Text>
          </View>
          <TextInput
            label="Phone Number"
            value={currentReport.phoneNumber}
            onChangeText={text => setCurrentReport(prev => ({
              ...prev,
              phoneNumber: text.replace(/[^0-9]/g, '') // Only allow numbers
            }))}
            keyboardType="phone-pad"
            style={styles.phoneInput}
            placeholder="7XXXXXXXX"
            maxLength={9}
          />
        </View>
      </>
    )}
  </Card.Content>
</Card>


        <Text style={styles.note}>Adding photos increases match chances by 60%!</Text>
                <View style={styles.photoContainer}>
                  {currentReport.photos.map((uri, index) => (
                    <View key={index} style={styles.photoWrapper}>
                      <Image source={{ uri }} style={styles.photo} />
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={() => setCurrentReport(prev => ({
                          ...prev,
                          photos: prev.photos.filter((_, i) => i !== index)
                        }))}
                      />
                    </View>
                  ))}
                  <IconButton
                    icon="camera-plus"
                    size={40}
                    onPress={handlePhotoUpload}
                    style={styles.addPhoto}
                  />
                </View>

                <View style={styles.submitContainer}>
                  <Button 
                    mode="contained" 
                    onPress={handleSubmit}
                    style={styles.submitButton}
                  >
                    {currentReport.isEditing ? 'Update Report' : 'Submit Report'}
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={() => setShowForm(false)}
                    style={styles.cancelButton}
                    textColor='black'
                  >
                    Cancel
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </>
        ) : (
          <>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.infoText}>
                  - Tap + to create a new report{'\n'}
                  - You'll be notified when:{'\n'}
                  • An operator/driver finds your item{'\n'}
                  • Your report approaches 30 days old{'\n'}
                  - Update status if found or delete report
                </Text>
                <Text style={styles.noteText}>
              Note: Reports auto-expire after 30 days
            </Text>
              </Card.Content>
            </Card>
           
            <Text variant="titleMedium" style={styles.infoTitle}>
                     Your Submitted Reports:
                </Text>

            <FlatList
              data={reports}
              renderItem={({ item, index }) => <ReportItem item={item} index={index} />}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No reports submitted yet</Text>
              }
              scrollEnabled={false}
            />

            <FAB
              style={styles.fab}
              icon="plus"
              label="New Report"
              onPress={handleNewReport}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#e3f2fd',
  },
  reportItem: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    marginHorizontal:1
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap:8,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: '#e3f2fd',
  },
  noteText: {
    marginTop: 8,
    color: '#d32f2f',
    fontWeight: '500'
  },
  label: {
    fontSize: 18,
    marginVertical: 8,
    color: '#333',
  },
  picker: {
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
    borderRadius: 25,
  },
  input: {
    marginVertical: 8,
    backgroundColor: "#fff"
    },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  note: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
    gap: 8,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  addPhoto: {
    alignSelf: 'flex-start',
  },
  submitContainer: {
    gap: 12,
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#59B3F8",
  },
  cancelButton: {
    borderColor: '#d32f2f',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 100,
    bottom: 0,
    backgroundColor: '#59B3F8',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  foundButton: {
    backgroundColor: '#4CAF50', // Green background
    borderWidth: 1,
    borderColor: '#388E3C', // Slightly darker green border
    minWidth: 110, // Consistent minimum width
    height: 40, // Consistent height
  },
  editButton:{
    backgroundColor: '#59B3F8', // Blue background
    borderWidth: 1,
    borderColor: '#1976D2', // Darker blue border
    minWidth: 80,
    height: 40,
  },
  deleteButton: {
    backgroundColor: '#ff4444', // Red background
    borderWidth: 1,
    borderColor: '#D32F2F', // Darker red border
    minWidth: 90,
    height: 40,
    marginRight:-20
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  userCard: {
    marginBottom: 30,
  },
  userInfo: {
    fontSize: 14,
    marginVertical: 4,
    color: '#616161'
  },
  statusCard: {
    marginVertical: 16,
    backgroundColor: '#fff3e0'
  },
  statusLabel: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  statusActions: {
    flexDirection: 'row',
    gap: 10
  },
  statusButton: {
    flex: 1
  },
  mandatoryNote: {
    textAlign: 'center',
    marginTop: 16,
    color: '#757575'
  },
  fieldContainer: {
    marginBottom: 16
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
   switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  phoneQuestion: {
    flex: 1,
    marginRight: 10
  },
  phoneNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 10
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'white'
  }
  
});

export default ReportMissingS;