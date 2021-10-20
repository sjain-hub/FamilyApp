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
import { Orders } from './'
import { COLORS } from '../constants'
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import Modal from 'react-native-modal';


const NewOrders = ({ route, navigation }) => {

    const [newOrders, setNewOrders] = React.useState([])
    const [newOrdersModal, setNewOrdersModal] = React.useState(false)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            checkNewOrders()
        });
        return unsubscribe;
    }, [])

    function checkNewOrders() {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/apporderList', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "day": "all",
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setNewOrders(json.orders)
                        if (json.orders.length > 0) {
                            setNewOrdersModal(true)
                        }
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

    function renderNewOrdersModal() {
        const renderItem = ({ item }) => {
            return (
                <TouchableOpacity
                    style={{marginVertical: 10, borderRadius: 6, backgroundColor: 'lightgreen', paddingVertical: 20, width: width*0.66, alignItems: 'center'}}
                    onPress={() => {
                        navigation.navigate("OrderDetails", {
                            order: item
                        })
                        setNewOrdersModal(false)
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 18, color: 'white' }}># {item.id}   <AntIcon name="right" size={16} /><AntIcon name="right" size={16} /><AntIcon name="right" size={16} /></Text>
                </TouchableOpacity>
            )
        }

        return (
            <Modal
                isVisible={newOrdersModal}
                style={{
                    width: width*0.8,
                    alignSelf: 'center'
                }}
            >
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 20,
                    maxHeight: height*0.6,
                    width: '100%'
                }}>
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>NEW ORDERS</Text>
                    <View style={{
                        borderStyle: 'solid',
                        borderWidth: 0.5,
                        borderColor: 'lightgray',
                        width: '100%',
                        marginVertical: 10
                    }}></View>
                    <FlatList
                        data={newOrders}
                        keyExtractor={item => `${item.id}`}
                        renderItem={renderItem}
                        // contentContainerStyle={{
                        //     marginTop: 10
                        // }}
                    />
                </View>
            </Modal>
        )
    }

    return (
        renderNewOrdersModal()
    )

}

export default NewOrders;

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
        shadowOpacity: Platform.OS == "ios" ? 0.4 : 0.8,
        shadowRadius: 3,
        elevation: 5,
    }
})