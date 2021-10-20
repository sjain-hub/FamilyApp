import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Pressable,
    TextInput
} from "react-native";
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import Modal from 'react-native-modal';
import { COLORS } from '../constants'

const Orders = ({ route, navigation }) => {

    const [orders, setOrders] = React.useState([])
    const [selectedOrder, setSelectedOrder] = React.useState()
    const [changeStatusModal, setChangeStatusModal] = React.useState(false)
    const [paymentModal, setPaymentModal] = React.useState(false)
    const [tempBalance, setTempBalance] = React.useState(0)
    const [tempAmountPaid, setTempAmountPaid] = React.useState(0)
    const [day, setDay] = React.useState()
    var  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    React.useEffect(() => {
        let { tab } = route.params;
        setDay(tab)
        fetchOrders(tab)
        const unsubscribe = navigation.addListener('focus', () => {
            fetchOrders(tab)
        });
        return unsubscribe;
    }, [navigation])

    function fetchOrders(day) {
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
                        "day": day,
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setOrders(json.orders)
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

    const getButtonLabel = (order) => {
        if (order?.mode == "Delivery") {
            labels = ["Placed", "Preparing", "Ready", "Dispatched", "Delivered"]
        } else {
            labels = ["Placed", "Preparing", "Ready", "Picked"]
        }
        return labels[labels.indexOf(order?.status) + 1]
    }

    function renderOrders() {
        const getFormattedDate = (timestamp) => {
            var date = new Date(timestamp)
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
            return (date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear() + "   " + (date.getHours()>12 ? date.getHours()-12 + ":" + (date.getMinutes().toString().length>1 ? date.getMinutes() : "0" + date.getMinutes()) + " pm" : date.getHours() + ":" + (date.getMinutes().toString().length>1 ? date.getMinutes() : "0" + date.getMinutes()) + " am"))
        }

        const getColor = (status) => {
            if (status=="Delivered" || status=="Picked") {
                return "#4BB543"
            }
            else if (status=="Rejected" || status=="Cancelled") {
                return "red"
            }
            else if (status=="Waiting" || status=="Payment" || status=="Placed" || status=="Preparing" || status=="Ready" || status=="Dispatched") {
                return "#FFCC00"
            }
        }

        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{ width: width * 0.9, paddingVertical: 20, paddingHorizontal: 20, borderRadius: 10, backgroundColor: 'white', marginVertical: 16, ...styles.shadow }}
                onPress={() => navigation.navigate("OrderDetails", {
                    order: item
                })}
            >
                {day == "today" ?
                    null
                    :
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            height: 30,
                            width: width*0.9,
                            backgroundColor: 'black',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottomRightRadius: 2,
                            borderBottomLeftRadius: 2,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                        }}>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', color: 'white' }}>NOT TODAY'S ORDER</Text>
                    </View>
                }
                <View style={{ flexDirection: 'row', marginTop: day == "today"? null : 30 }}>
                    <View style={{ width: '60%', marginRight: 5 }}>
                        <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}># {item.id}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', width: '40%' }}>
                        <Text style={{ fontFamily: "System", fontSize: 16, marginBottom: 6, color: getColor(item.status), fontWeight: 'bold' }}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <View>
                    <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 6 }}>Customer: {item.customer.first_name} {item.customer.last_name}</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', marginBottom: 6 }}>{item.itemswithquantity}</Text>
                    <View style={{flexDirection: 'row', marginBottom: 6}}>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>{'\u20B9'}{item.total_amount}</Text>
                        {item.status == "Rejected" || item.status == "Cancelled" ?
                            item.amount_paid != 0 ? <Text style={{ fontFamily: "System", fontSize: 14, marginLeft: 14, color: 'gray', fontWeight: 'bold' }}>(Refund Initiated: {'\u20B9'}{item.amount_paid})</Text> : null
                            :
                            <Text style={{ fontFamily: "System", fontSize: 14, marginLeft: 14, color: item.balance == 0 ? 'green' : 'red', fontWeight: 'bold' }}>{item.balance == 0 ? "PAID" : "(Bal: " + '\u20B9' + item.balance + ")"}</Text>
                        }
                    </View>
                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', marginBottom: 6 }}>{getFormattedDate(item.scheduled_order)}</Text>
                </View>
                {getColor(item.status) == "#FFCC00" ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity
                            style={{
                                height: 40,
                                width: '48%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 10
                            }}
                            onPress={() => {
                                setSelectedOrder(item)
                                setPaymentModal(true)
                                setTempBalance(item.balance)
                                setTempAmountPaid(item.amount_paid)
                            }}
                        >
                            <Text style={{ fontSize: 14 }}>Payment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                height: 40,
                                width: '48%',
                                backgroundColor: getButtonLabel(item) == "Delivered" || getButtonLabel(item) == "Picked" ? '#4BB543' : '#FFCC00',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 10
                            }}
                            onPress={() => {
                                setSelectedOrder(item)
                                setChangeStatusModal(true)
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 14 }}>Mark {getButtonLabel(item)}</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    null
                }
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={orders}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingTop: 20,
                    paddingBottom: 80
                }}
            />
        )
    }

    function renderStatusChangeModal() {
        return (
            <Modal
                isVisible={changeStatusModal}
                onBackdropPress={() => setChangeStatusModal(!changeStatusModal)}
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: width*0.8,
                    alignSelf: 'center'
                }}
            >
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 35,
                }}>
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Do you want to change the Order status to <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold' }}>"{getButtonLabel(selectedOrder)}"</Text> ?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => setChangeStatusModal(!changeStatusModal)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>NO</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setChangeStatusModal(!changeStatusModal)
                                changeOrderStatus(getButtonLabel(selectedOrder))
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>YES</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function renderPaymentModal() {
        const changeTempBalance = (amount) => {
            setTempAmountPaid(amount)
            setTempBalance(selectedOrder?.total_amount - amount)
        }

        return (
            <Modal
                isVisible={paymentModal}
                onBackdropPress={() => setPaymentModal(!paymentModal)}
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: width*0.8,
                    alignSelf: 'center'
                }}
            >
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 35,
                    width: '100%'
                }}>
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Total Amount:  {'\u20B9'}{selectedOrder?.total_amount}</Text>
                    <View
                        style={{
                            marginTop: 20,
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ fontFamily: "System", fontSize: 18 }}>Amount Paid:  {'\u20B9'}</Text>
                        <TextInput
                            autoFocus
                            keyboardType={'number-pad'}
                            maxLength={5}
                            style={{ fontFamily: "System", fontSize: 18, width: '30%', backgroundColor: '#F5F5F6', paddingHorizontal: 10, marginLeft: 10 }}
                            onChangeText={(text) => changeTempBalance(text)}
                            value={'' + tempAmountPaid}
                            editable={!selectedOrder?.balance == 0}
                        >
                        </TextInput>
                    </View>
                    <Text style={{ fontFamily: "System", fontSize: 18, marginTop: 20, color: tempBalance == 0 ? 'green' : 'red', fontWeight: 'bold' }}>{tempBalance == 0 ? "PAID" : "Bal: " + '\u20B9' + tempBalance}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => setPaymentModal(!paymentModal)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>CANCEL</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center', marginLeft: 20 }}
                            onPress={() => {
                                setPaymentModal(!paymentModal)
                                updatePayment()
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>UPDATE</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function changeOrderStatus(orderstatus) {
        fetch(config.url + '/kitapi/appchangeOrderStatus', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "status": orderstatus,
                "orderid": selectedOrder.id
            })
        }).then((response) => response.json())
            .then((json) => {
                console.log(json);
                if (json.response == "Status updated Successfully") {
                    fetchOrders(day)
                }
                else {
                    alert(json.response)
                }
            }).catch((error) => {
                if (error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")
                } else {
                    console.error(error)
                }
            });
    }

    function updatePayment() {
        fetch(config.url + '/kitapi/appupdatePayment', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "amountpaid": tempAmountPaid? tempAmountPaid : 0,
                "balamount": tempBalance,
                "orderid": selectedOrder.id
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.response == "Payment updated Successfully") {
                    fetchOrders(day)
                }
                else {
                    alert(json.response)
                }
            }).catch((error) => {
                if (error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")
                } else {
                    console.error(error)
                }
            });
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderStatusChangeModal()}
            {renderPaymentModal()}
            {renderOrders()}
        </SafeAreaView>
    )

}

export default Orders;

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
        elevation: 5,
    }
})