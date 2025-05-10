import React,  { useState }from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from 'react-native-vector-icons';

import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Welcome from './screens/Welcome';
import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import Home from './screens/Home';
import ClosestBusStation from './screens/ClosestBusStation';
import ReportMissingS from './screens/ReportMissingS';
import ReportMissingOD from './screens/ReportMissingOD';
import updateschedule from './screens/updateschedule';
import busSchedule from './screens/busSchedule';
import updateBus from './screens/updateBus';
import BusDetails from './screens/BusDetails';
import notification from './screens/notification';
import feedback from './screens/feedback';
import evaluation from './screens/evaluation';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
   return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={Welcome}  options={{ headerShown: false,  headerTitle: '    ' }} />

 <Stack.Screen name="SignUp" component={SignUp}  
       options={{
         headerTitle: '     ',
        headerTransparent: false,
        headerTintColor: 'black',  // To change the color of any text/icon in the header
      }}
       />
        <Stack.Screen name="SignIn" component={SignIn} 
         options={{
           headerTitle: '   ',
          headerTransparent: false,
          headerTintColor: 'black',  // To change the color of any text/icon in the header
        }}
      />

        <Stack.Screen name="Home" component={Home}
        options={{
          headerTitle: '   ',
         headerTransparent: false,
         headerTintColor: 'black',  // To change the color of any text/icon in the header
       }}
        />
         <Stack.Screen name="ClosestBusStation" component={ClosestBusStation} />
          <Stack.Screen name="ReportMissingS" component={ReportMissingS} options={{
          headerTitle: 'Report Missing Item'}}/>
        <Stack.Screen name="ReportMissingOD" component={ReportMissingOD} options={{
          headerTitle: 'Report Missing Item'}} />

          <Stack.Screen name="updateschedule" component={updateschedule} />
          <Stack.Screen name="busSchedule" component={busSchedule} />
        <Stack.Screen name="updateBus" component={updateBus} />
        <Stack.Screen name="BusDetails" component={BusDetails} />
        <Stack.Screen name="notification" component={notification} />
        <Stack.Screen name="feedback" component={feedback} />
        <Stack.Screen name="evaluation" component={evaluation} />
        </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>

  );
};
export default App;