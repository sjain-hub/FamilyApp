import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    SafeAreaView,
    BackHandler,
    Platform,
    Switch,
    StatusBar,
    FlatList,
    ActivityIndicator
} from "react-native";
const { width, height } = Dimensions.get("window");
import AntIcon from 'react-native-vector-icons/AntDesign';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Orders, NewOrders, NoInternet } from './'
import { COLORS } from '../constants'
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import Modal from 'react-native-modal';


const Home = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    // const Tab = createMaterialTopTabNavigator();
    const Tab = createBottomTabNavigator();
    const [kitchen, setKitchen] = React.useState()
    const [tomDate, setTomDate] = React.useState("TOM")
    const [datDate, setDatDate] = React.useState("DAT")
    const [loading, setLoading] = React.useState(true)
    var  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            handleStatus("getKitchen")
            setDates()
        });
        return unsubscribe;
    }, [navigation])

    const setDates = () => {
        var date = new Date()

        date.setDate(date.getDate() + 1)
        setTomDate(date.getDate() + " " + months[date.getMonth()] )

        date.setDate(date.getDate() + 1)
        setDatDate(date.getDate() + " " + months[date.getMonth()] )
    }

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginTop: 10, marginBottom: 20, backgroundColor: 'white', borderRadius: 10, ...styles.shadow }}>
                <View
                    style={{
                        width: '20%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginVertical: 10
                    }}
                >
                    <Switch
                        trackColor={{ false: "gray", true: "lightgray" }}
                        thumbColor={shutter ? "#228B22" : "#ff0033"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => {
                            setShutter(!shutter)
                            handleStatus("changeStatus")
                        }}
                        value={shutter}
                        style={Platform.OS == "ios" ?
                            { transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }
                            :
                            { transform: [{ scaleX: 1.6 }, { scaleY: 1.6 }] }}
                    />
                    <Text style={{ fontFamily: "System", fontSize: 14, color: shutter ? 'green' : 'red', marginTop: 6 }}>{shutter ? 'On-air' : 'Off-air'}</Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80%',
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 24 }}>HOME</Text>
                </View>

                <TouchableOpacity
                    style={{
                        width: '20%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                // onPress={() => setFiltersModal(true)}
                >
                    <AntIcon name="filter" size={24} color={'gray'} />
                    <Text style={{ fontFamily: "System", fontSize: 11 }}>Filters</Text>
                </TouchableOpacity>
            </View>
        )
    }

    function handleStatus(action) {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/apphandleKitchenStatus', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": action,
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setKitchen(json.kitchen)
                        setShutter(json.kitchen.status == "Open"? true : false)
                        AsyncStorage.setItem('shutter', json.kitchen.status)
                        setLoading(false)
                    }).catch((error) => {
                        if (error == 'TypeError: Network request failed') {
                            navigation.navigate("NoInternet")
                        } else {
                            console.error(error)
                        }
                    });
            }
        });
    }

    function renderOrders() {
        return (
            <View style={{ backgroundColor: 'white', width: width, height: height-160 }}>
                <Tab.Navigator
                    tabBarOptions={{
                        showLabel: false
                    }}
                    initialRouteName={'Today'}
                >
                    <Tab.Screen
                        name="Today"
                        component={Orders}
                        initialParams={{ tab: 'today' }}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: "System", fontSize: 16, color: focused? 'blue' : 'gray' }}>Today</Text>
                                </View>
                            )
                        }} 
                    />
                    <Tab.Screen
                        name={tomDate}
                        component={Orders}
                        initialParams={{ tab: 'tomorrow' }}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: "System", fontSize: 16, color: focused ? 'blue' : 'gray' }}>{tomDate}</Text>
                                </View>
                            )
                        }}
                    />
                    <Tab.Screen
                        name={datDate}
                        component={Orders}
                        initialParams={{ tab: 'day-after-tomorrow' }}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: "System", fontSize: 16, color: focused ? 'blue' : 'gray' }}>{datDate}</Text>
                                </View>
                            )
                        }}
                    />
                </Tab.Navigator>
            </View>
        )
    }

    function renderLoader() {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color={COLORS.orange}/>
            </View>
        )
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: shutter? COLORS.blue : COLORS.gray}}>
            <StatusBar backgroundColor={ shutter? COLORS.blue : COLORS.gray} barStyle="light-content" />
            {loading ?
                renderLoader()
                :
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    {renderOrders()}
                </View>
            }
            <NewOrders navigation={navigation}/>
        </SafeAreaView>
    )

}

export default Home;

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: Platform.OS == "ios" ? 0.4 : 0.8,
        shadowRadius: 3,
        elevation: 10,
    }
})