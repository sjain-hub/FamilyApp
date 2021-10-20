import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native'
// import PushNotification from "react-native-push-notification";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Login, NoInternet, Home, Orders, OrderDetails, Menu, NewOrders, AddMenuItems, Account, Profile, MyItems, AddNewItem, UploadItemImage } from './screens'
import Tabs from './navigation/tabs'

const Stack = createStackNavigator();

const App = () => {
  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(() => {
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
        initialRouteName={'Login'}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="NoInternet" component={NoInternet} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Orders" component={Orders} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="NewOrders" component={NewOrders} />
        <Stack.Screen name="AddMenuItems" component={AddMenuItems} />
        <Stack.Screen name="Account" component={Account} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="MyItems" component={MyItems} />
        <Stack.Screen name="AddNewItem" component={AddNewItem} />
        <Stack.Screen name="UploadItemImage" component={UploadItemImage} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;