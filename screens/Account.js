import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    SectionList,
    Switch,
    Platform,
    Pressable,
    TextInput
} from "react-native";
const { width, height } = Dimensions.get("window");
import { COLORS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewOrders } from './';
import config from '../config.json';
import Modal from 'react-native-modal';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import veg from "../assets/icons/veg.png";
import nonveg from "../assets/icons/nonveg.png";


const Account = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("shutter").then((value) => {
                if (value == "Open") {
                    setShutter(true)
                }
                else {
                    setShutter(false)
                }
            });
        });
        return unsubscribe;
    }, [navigation])

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginTop: 10, marginBottom: 20, backgroundColor: 'white', borderRadius: 10, ...styles.shadow }}>
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        marginVertical: 20
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 24 }}>ACCOUNT</Text>
                </View>
            </View>
        )
    }

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 5,
                borderColor: '#F5F5F6',
            }}></View>
        )
    }

    function renderProfileTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("Profile")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>My Profile</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderKitchenTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                // onPress={() => navigation.navigate("Profile")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>My Kitchen</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderItemsTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("MyItems")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>My Items</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderSubscriptionTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                // onPress={() => navigation.navigate("Profile")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>My Subscription</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderCouponsTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                // onPress={() => navigation.navigate("Profile")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>My Coupons</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderLogoutTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                // onPress={() => setLogoutModalVisible(true)}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Logout</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="logout" size={30} color={'red'} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderFooter() {
        return (
            <View style={{ borderStyle: 'solid', borderWidth: 100, borderColor: '#F5F5F6', width: width }}></View>
        )
    }

    function renderAccount() {
        return (<View style={{width: width, backgroundColor: 'white', paddingBottom: 60}}>
            {renderGap()}
            {renderProfileTab()}
            {renderGap()}
            {renderKitchenTab()}
            {renderGap()}
            {renderItemsTab()}
            {renderGap()}
            {renderSubscriptionTab()}
            {renderGap()}
            {renderCouponsTab()}
            {renderGap()}
            {renderGap()}
            {renderLogoutTab()}
            {renderGap()}
            {renderFooter()}
        </View>)
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
            {loading?
                renderLoader()
                :
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    {renderAccount()}
                </View>
            }
            <NewOrders navigation={navigation}/>
        </SafeAreaView>
    )

}

export default Account;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 10,
    }
})