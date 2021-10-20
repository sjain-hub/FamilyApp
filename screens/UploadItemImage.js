import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    Dimensions,
    Pressable,
    TouchableOpacity,
    TextInput,
    SectionList,
    StatusBar,
    ActivityIndicator
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import { COLORS } from '../constants';
import { NewOrders } from '.';
import veg from "../assets/icons/veg.png";
import nonveg from "../assets/icons/nonveg.png";
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

const UploadItemImage = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [item, setItem] = React.useState()

    React.useEffect(() => {
        let { itemid } = route.params;
        fetchItem(itemid)
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

    function fetchItem(itemId) {
        fetch(config.url + '/kitapi/appfetchItem', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "itemid": itemId
            })
        }).then((response) => response.json())
            .then((json) => {
                setItem(json.item)
                setLoading(false)
            }).catch((error) => {
                if (error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")
                } else {
                    console.error(error)
                }
            });
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
                            height: 20
                        }}
                    />
                </TouchableOpacity>
                <View
                    style={{
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>ITEM IMAGE</Text>
                </View>
            </View>
        )
    }

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 10,
                borderColor: '#F5F5F6',
            }}></View>
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
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ shutter? COLORS.blue : COLORS.gray} barStyle="light-content" />
            {loading?
                renderLoader()
                :
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    {renderGap()}
                    
                </View>
            }
            <NewOrders navigation={navigation}/>
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

export default UploadItemImage;