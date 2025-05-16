import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Welcome = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
     
     <Image
    source={require('../assets/images/bus.png')} 
    style={styles.image}
    
  />
      <Text style={styles.title}>Welcome to <Text style={styles.hurry}>HUrry</Text>, your journey starts here!</Text>
      <Text style={styles.subtitle}>How would you describe yourself?</Text>

      {/* Add your buttons here */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp', { role: 'STUDENT', userName: "Test User", userEmail: "test@example.com" })}>
        <Text style={styles.buttonText}>Student</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp', { role: 'DRIVER' })}>
        <Text style={styles.buttonText}>Driver</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp', { role: 'OPERATOR' })}>
        <Text style={styles.buttonText}>Operator</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignIn' )}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffff',
  },
  image: {
    width: 340, // Adjust width of the image
    height: 300, // Adjust height of the image
    marginBottom: 20, // Add spacing between the image and the text
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 13,
  },
  hurry:{
    color:"#59B3F8",
    fontSize: 20,
  },
  button: {
    backgroundColor: '#59B3F8',
    width: '80%',
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffff',
    textAlign: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});

export default Welcome;