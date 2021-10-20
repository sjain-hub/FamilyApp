import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    FlatList,
    Dimensions,
    Pressable,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    StatusBar
} from "react-native";
import config from '../config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import { COLORS } from '../constants'


const Login = ({ route, navigation }) => {

    const [userName, setUserName] = React.useState()
    const [pass, setPass] = React.useState()
    const [loginButton, setLoginButton] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("kitAuthToken").then((value) => {
                if (value) {
                    navigation.navigate("Tabs")
                }
            });
        });
        return unsubscribe;
    }, [])

    function checkCredentialsValid(user, passw) {
        if (user && passw) {
            setLoginButton(true)
        } else {
            setLoginButton(false)
        }
    }

    function renderLogin() {
        return (
            <View style={{ backgroundColor: COLORS.blue, flex: 1 }}>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ width: width * 0.9, backgroundColor: 'white', alignSelf: 'center', borderRadius: 30, opacity: 0.9, ...styles.shadow }}>
                        <View style={{ padding: 50 }}>
                            <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold' }}>LOGIN</Text>
                            <View
                                style={{
                                    marginTop: 20,
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{ fontFamily: "System", fontSize: 16, color: 'grey', marginBottom: 10 }}>Username</Text>
                                <TextInput
                                    style={{ fontFamily: "System", fontSize: 18, width: '100%', backgroundColor: 'white', borderRadius: 5, paddingHorizontal: 10 }}
                                    onChangeText={(text) => {
                                        setUserName(text)
                                        checkCredentialsValid(text, pass)
                                    }}
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
                                <Text style={{ fontFamily: "System", fontSize: 16, color: 'grey', marginBottom: 10 }}>Password</Text>
                                <TextInput
                                    style={{ fontFamily: "System", fontSize: 18, width: '100%', backgroundColor: 'white', borderRadius: 5, paddingHorizontal: 10 }}
                                    secureTextEntry={true}
                                    onChangeText={(text) => {
                                        setPass(text)
                                        checkCredentialsValid(userName, text)
                                    }}
                                >
                                </TextInput>
                            </View>
                            <TouchableOpacity
                                disabled={!loginButton}
                                style={{
                                    height: 40,
                                    backgroundColor: loginButton? COLORS.orange : 'lightgray',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 10,
                                    marginTop: 40
                                }}
                                onPress={() => requestLogin()}
                            >
                                <Text style={{ color: loginButton? 'white' : 'gray', fontSize: 16 }}>LOGIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    function requestLogin() {
        setLoading(true)
        fetch(config.url + '/kitapi/applogin', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "username": userName,
                "password": pass
            })
        }).then((response) => response.json())
            .then((json) => {
                setLoading(false)
                if (json.token) {
                    AsyncStorage.setItem('kitAuthToken', json.token)
                    navigation.navigate("Tabs")
                }
                else {
                    alert(json.detail)
                }
            }).catch((error) => {
                setLoading(false)
                 if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
            });
    }

    function renderLoader() {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color={COLORS.orange}/>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ COLORS.blue} barStyle="light-content" />
            {loading? renderLoader() : renderLogin()}
        </SafeAreaView>
    )
}

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
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    }
})

export default Login;