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
import back from "../assets/icons/back.png";


const Profile = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [user, setUser] = React.useState();
    const [phoneNo, setPhoneNo] = React.useState();
    const [email, setEmail] = React.useState();
    const [errors, setErrors] = React.useState();
    const [editMode, setEditMode] = React.useState(false);
    const [updateFormValid, setUpdateFormValid] = React.useState(false);

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
            fetchUserAccDetails()
        });
        return unsubscribe;
    }, [navigation])

    function fetchUserAccDetails() {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/userapi/appFetchUser', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Token ' + value
                    },
                }).then((response) => response.json())
                    .then((json) => {
                        setLoading(false)
                        setUser(json.user)
                        setPhoneNo(json.user.phone)
                        setEmail(json.user.email)
                        setErrors()
                    }).catch((error) => {
                         if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
                    });
            }
        });
    }

    async function removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', height: 50 }}>
                <TouchableOpacity
                    style={{
                        width: 50,
                        paddingLeft: 20,
                        justifyContent: 'center'
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={back}
                        resizeMode="contain"
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: 'white'
                        }}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    function renderProfile() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ width: width * 0.9, backgroundColor: 'white', alignSelf: 'center', borderRadius: 30, ...styles.shadow }}>
                            {editMode ?
                                <View style={{ padding: 50 }}>
                                    <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold' }}>PROFILE</Text>
                                    <Text style={{ fontFamily: "System", color: 'gray', marginTop: 10 }}>Update your account details</Text>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Username</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.username}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Full Name</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.first_name + ' ' + user?.last_name}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Phone</Text>
                                        <TextInput
                                            keyboardType={'number-pad'}
                                            maxLength={10}
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={phoneNo}
                                            // onChangeText={(text) => {
                                            //     setPhoneNo(text)
                                            //     setErrors(errors ? {
                                            //         'email': errors.email
                                            //     } : null)
                                            //     checkUpdateForm(text, email, errors ? {
                                            //         'email': errors.email
                                            //     } : null)
                                            // }}
                                        >
                                        </TextInput>
                                        {errors?.phone ?
                                            <Text style={{ fontFamily: "System", fontSize: 14, color: 'red' }}>{errors.phone}</Text>
                                            : null
                                        }
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Email</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={email}
                                            // onChangeText={(text) => {
                                            //     setEmail(text)
                                            //     setErrors(errors ? {
                                            //         'phone': errors.phone,
                                            //     } : null)
                                            //     checkUpdateForm(phoneNo, text, errors ? {
                                            //         'phone': errors.phone,
                                            //     } : null)
                                            // }}
                                        >
                                        </TextInput>
                                        {errors?.email ?
                                            <Text style={{ fontFamily: "System", fontSize: 14, color: 'red' }}>{errors.email}</Text>
                                            : null
                                        }
                                    </View>
                                    <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'center' }}>
                                        <Pressable
                                            style={{ width: '60%' }}
                                            // onPress={() => {
                                            //     setEditMode(false)
                                            //     fetchUserAccDetails()
                                            //     setUpdateFormValid(false)
                                            // }}
                                        >
                                            <Text style={{ fontFamily: "System", fontSize: 18, color: COLORS.orange }}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            disabled={!updateFormValid}
                                            // onPress={() => {
                                            //     sendOTP()
                                            //     AsyncStorage.setItem('tempUpdateClicked', 'true')
                                            //     AsyncStorage.setItem('tempEmail', email)
                                            // }}
                                        >
                                            <Text style={{ fontFamily: "System", fontSize: 18, color: updateFormValid ? COLORS.orange : 'lightgray' }}>Update</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                :
                                <View style={{ padding: 50 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold', width: width * 0.5 }}>PROFILE</Text>
                                        <Pressable
                                            style={{ alignItems: 'center' }}
                                            onPress={() => setEditMode(true)}
                                        >
                                            <Text style={{ fontFamily: "System", fontSize: 18, color: COLORS.orange }}>Edit</Text>
                                        </Pressable>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Username</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.username}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Full Name</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.first_name + ' ' + user?.last_name}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Phone</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={phoneNo}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Email</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={email}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                </View>
                            }
                    </View>
                </View>
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
            {loading?
                renderLoader()
                :
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    {renderProfile()}
                </View>
            }
            <NewOrders navigation={navigation}/>
        </SafeAreaView>
    )

}

export default Profile;

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