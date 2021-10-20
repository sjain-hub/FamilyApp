import React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Text,
    Platform
} from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from "@react-navigation/bottom-tabs"
import Svg, { Path } from 'react-native-svg';
import { isIphoneX } from 'react-native-iphone-x-helper';

import { Home, Menu, Account } from "../screens"
import { COLORS } from '../constants';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Tab = createBottomTabNavigator();

const TabBarCustomButton = ({ accessibilityState, children, onPress }) => {

    var isSelected = accessibilityState.selected

    if (isSelected) {
        return (
            <View style={{ flex: 1, alignItems: "center" }}>
                <View style={{ flexDirection: 'row', position: 'absolute', top: 0 }}>
                    <View style={{ flex: 1, backgroundColor: 'white' }}></View>
                    <Svg
                        width={75}
                        height={61}
                        viewBox="0 0 75 61"
                    >
                        <Path
                            d="M75.2 0v61H0V0c4.1 0 7.4 3.1 7.9 7.1C10 21.7 22.5 33 37.7 33c15.2 0 27.7-11.3 29.7-25.9.5-4 3.9-7.1 7.9-7.1h-.1z"
                            fill={'white'}
                        />
                    </Svg>
                    <View style={{ flex: 1, backgroundColor: 'white' }}></View>
                </View>

                <TouchableOpacity
                    style={{
                        top: -22.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: 'white',
                        ...styles.shadow
                    }}
                    onPress={onPress}
                >
                    {children}
                </TouchableOpacity>
            </View>
        )
    } else {
        return (
            <TouchableOpacity
                style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: 'white'
                }}
                activeOpacity={1}
                onPress={onPress}
            >
                {children}
                {/* <Text style={{fontSize: 12, alignSelf: 'center', marginBottom: 10}}>dskjfhi</Text> */}
            </TouchableOpacity>
        )
    }
}

const CustomTabBar = (props) => {
    if (isIphoneX()) {
        return (
            <View>
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 30,
                        backgroundColor: 'white',
                    }}
                ></View>
                <BottomTabBar
                    {...props.props}
                />
            </View>
        )
    } else {
        return (
            <BottomTabBar
                {...props.props}
            />
        )
    }

}

const Tabs = ({ route, navigation }) => {

    const [totalCartItems, setTotalCartItems] = React.useState(0);

    React.useEffect(() => {
        
    }, [])

    function countOrderItems(items) {
        let count = 0
        items.map(item => {
            count = count + item.qty
        })
        setTotalCartItems(count)
    }

    return (
        <Tab.Navigator
            tabBarOptions={{
                showLabel: false,
                style: {
                    position: 'absolute',
                    left: 0,
                    bottom: Platform.OS == "ios" ? 11 : 0,
                    right: 0,
                    borderTopWidth: 0,
                    backgroundColor: "transparent",
                    elevation: 0
                }
            }}
            tabBar={(props) => (
                <CustomTabBar
                    props={props}
                />
            )}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Entypo name="home" size={26} color={focused ? COLORS.orange : 'gray'} />
                            {!focused && <Text style={{ fontFamily: "System", fontSize: 10, color: 'gray' }}>Home</Text>}
                        </View> 
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    ),
                    unmountOnBlur: () => { true }
                }}
            />

            <Tab.Screen
                name="Search"
                component={Menu}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{alignItems: 'center', justifyContent: 'center'}}>
                            <MaterialIcons name="restaurant-menu" size={26} color={focused ? COLORS.orange : 'gray'} />
                            {!focused && <Text style={{ fontFamily: "System", fontSize: 10, color: 'gray' }}>Menu</Text>}
                        </View> 
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="Items"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name="search" size={28} color={focused ? COLORS.orange : 'gray'} />
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="Cart"
                component={Home}
                initialParams={{ raiseButton: true }}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ flexDirection: 'row' }}>
                            <Entypo name="shopping-cart" size={22} color={focused ? COLORS.orange : 'gray'} />
                            {totalCartItems > 0 && !focused ?
                                <View style={{ width: 18, height: 18, borderRadius: 50, backgroundColor: COLORS.orange, alignItems: 'center', justifyContent: 'center', marginLeft: -5, marginTop: -5 }}>
                                    <Text style={{ color: 'white', fontSize: 12 }}>{totalCartItems}</Text>
                                </View>
                                :
                                null}

                        </View>
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    ),
                    unmountOnBlur: () => { true }
                }}
            />

            <Tab.Screen
                name="Settings"
                component={Account}
                initialParams={{ cameFromCart: false }}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Ionicons name="settings" size={26} color={focused ? COLORS.orange : 'gray'} />
                            {!focused && <Text style={{ fontFamily: "System", fontSize: 10, color: 'gray' }}>Settings</Text>}
                        </View> 
                    ),
                    tabBarButton: (props) => (
                        <TabBarCustomButton
                            {...props}
                        />
                    ),
                    unmountOnBlur: () => { true }
                }}
            />
        </Tab.Navigator>
    )
}

export default Tabs

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: Platform.OS == "ios" ? 0.4 : 0.8,
        shadowRadius: 3,
        elevation: 5,
    }
})