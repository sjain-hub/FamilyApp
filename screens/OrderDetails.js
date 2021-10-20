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
    FlatList,
    Linking,
    Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import { COLORS } from '../constants'
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import paid from '../assets/icons/paid.png';
import StepIndicator from 'react-native-step-indicator';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';


const OrderDetails = ({ route, navigation }) => {

    const messagetocustomer = React.useRef()
    const [order, setOrder] = React.useState();
    const [msgToCust, setMsgToCust] = React.useState("");
    const [action, setAction] = React.useState("");
    const [acceptRejectModal, setAcceptRejectModal] = React.useState(false);
    const [paymentModal, setPaymentModal] = React.useState(false)
    const [tempBalance, setTempBalance] = React.useState(0)
    const [tempAmountPaid, setTempAmountPaid] = React.useState(0)
    const [changeStatusModal, setChangeStatusModal] = React.useState(false)
    const [cancelOrderModal, setCancelOrderModal] = React.useState(false)
    const [showErrorMessage, setShowErrorMessage] = React.useState(false)
    const [scrollViewRef, setScrollViewRef] = React.useState();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const customStyles = {
        stepIndicatorSize: 22,
        currentStepIndicatorSize: 22,
        separatorStrokeWidth: 2,
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: COLORS.orange,
        stepStrokeWidth: 3,
        stepStrokeFinishedColor: COLORS.orange,
        stepStrokeUnFinishedColor: 'lightgray',
        separatorFinishedColor: COLORS.orange,
        separatorUnFinishedColor: 'lightgray',
        stepIndicatorFinishedColor: COLORS.orange,
        stepIndicatorUnFinishedColor: '#ffffff',
        stepIndicatorCurrentColor: '#ffffff',
        stepIndicatorLabelFontSize: 0,
        currentStepIndicatorLabelFontSize: 0,
        stepIndicatorLabelCurrentColor: 'transparent',
        stepIndicatorLabelFinishedColor: 'transparent',
        stepIndicatorLabelUnFinishedColor: 'transparent',
        labelColor: 'gray',
        labelSize: 16,
        currentStepLabelColor: COLORS.orange,
        labelAlign: 'flex-start'
    }

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            let { order } = route.params;
            fetchOrder(order.id)
        });
        return unsubscribe;
    }, [navigation])

    function fetchOrder(orderid) {
        fetch(config.url + '/kitapi/appgetOrder', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "orderid": orderid,
            })
        }).then((response) => response.json())
            .then((json) => {
                setOrder(json.order)
                setMsgToCust(json.order.msgtocust)
            }).catch((error) => {
                if (error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")
                } else {
                    console.error(error)
                }
            });
    }

    const getColor = (status) => {
        if (status == "Delivered" || status == "Picked") {
            return "#4BB543"
        }
        else if (status == "Rejected" || status == "Cancelled") {
            return "red"
        }
        else if (status == "Waiting" || status == "Placed" || status == "Preparing" || status == "Ready" || status == "Dispatched") {
            return "#FFCC00"
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
                            height: 20
                        }}
                    />
                </TouchableOpacity>
                <View
                    style={{
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        width: width * 0.6-50
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>ORDER  #{order?.id}</Text>
                </View>
               
                <View
                    style={{
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        width: width * 0.36
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, color: getColor(order?.status), fontWeight: 'bold' }}>{order?.status.toUpperCase()}</Text>
                </View>
            </View>
        )
    }

    function renderCartItems() {
        return (
            <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
                <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Items</Text>
                {order?.itemswithquantity.split(", ").map((item) => {
                    return (item? <Text key={item} style={{ fontFamily: "System", fontSize: 16, marginVertical: 2 }}>{item}</Text> : null)
                })}
            </View>
        )
    }

    function renderContactInfo() {
        const goToDialpad = (phoneno) => {
            if (Platform.OS == "android") {
                Linking.openURL('tel:${' + phoneno + '}')
            } else {
                Linking.openURL('telprompt:${' + phoneno + '}')
            }
        }

        const goToMaps = (lat, lng, kitchen) => {
            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
            const latLng = `${lat},${lng}`;
            const label = kitchen;
            const url = Platform.select({
                ios: `${scheme}${label}&ll=${latLng}`,
                android: `${scheme}${latLng}(${label})`
            });
            Linking.openURL(url)
        }

        return (
            <View style={{ paddingHorizontal: 10, marginBottom: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity
                    style={{ backgroundColor: 'white', paddingVertical: 10, borderRadius: 10, ...styles.shadow, width: width * 0.4, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 14 }}
                    onPress={() => goToDialpad(order?.customer.phone)}
                >
                    <Ionicons name="call" size={18} color={COLORS.orange} />
                    <Text style={{ fontFamily: "System", fontSize: 12, color: COLORS.orange, alignSelf: 'center', marginLeft: 6 }}>CALL CUSTOMER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: 'white', paddingVertical: 10, borderRadius: 10, ...styles.shadow, width: width * 0.4, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 14 }}
                    onPress={() => goToMaps(order?.delivery_addr.latitude, order?.delivery_addr.longitude)}
                >
                    <MaterialCommunityIcons name="map-marker-path" size={20} color={COLORS.orange} />
                    <Text style={{ fontFamily: "System", fontSize: 12, color: COLORS.orange, alignSelf: 'center', marginLeft: 6 }}>SHOW DIRECTIONS</Text>
                </TouchableOpacity>
            </View>
        )
    }

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 6,
                borderColor: '#F5F5F6',
            }}></View>
        )
    }

    function renderDates() {
        const getFormattedDate = (timestamp) => {
            var date = new Date(timestamp)
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
            return (date.getDate() + " " + months[date.getMonth()] + ", " + (date.getHours() > 12 ? date.getHours() - 12 + ":" + (date.getMinutes().toString().length > 1 ? date.getMinutes() : "0" + date.getMinutes()) + " pm" : date.getHours() + ":" + (date.getMinutes().toString().length > 1 ? date.getMinutes() : "0" + date.getMinutes()) + " am"))
        }

        return (
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                    <View style={{ width: '50%' }}>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>Scheduled On</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', width: '50%' }}>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>{getFormattedDate(order?.scheduled_order)}</Text>
                    </View>
                </View>
            </View>
        )
    }

    function renderAddress() {
        return (
            <View style={{ paddingHorizontal: 20, marginVertical: 20 }}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Address</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14 }}>{order?.delivery_addr.address},  Floor No: {order?.delivery_addr.floorNo}</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14 }}>Distance: {order?.dist_from_kit} km (approx.)</Text>
                </View>
                <View>
                    <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Mode</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14 }}>{order?.mode}</Text>
                </View>
            </View>
        )
    }

    function renderBillingDetails() {
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>Billing Details</Text>
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ width: width * 0.75 }}>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>Sub-Total</Text>
                        {order?.kit_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>Kitchen Discount</Text>
                            : null
                        }
                        {order?.coup_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>Coupon Discount</Text>
                            : null
                        }
                        {order?.mode == "Delivery" ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>Delivery Charge</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>Total Amount</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>{'\u20B9'}{order?.sub_total}</Text>
                        {order?.kit_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14, color: 'green' }}>- {'\u20B9'}{order?.kit_discount}</Text>
                            : null
                        }
                        {order?.coup_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14, color: 'green' }}>- {'\u20B9'}{order?.coup_discount}</Text>
                            : null
                        }
                        {order?.mode == "Delivery" ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>{'\u20B9'}{order?.delivery_charge}</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>{'\u20B9'}{order?.total_amount}.00</Text>
                    </View>
                </View>
                {order?.balance == 0 ?
                    <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={paid}
                            resizeMode="contain"
                            style={{
                                height: width * 0.16
                            }}
                        />
                    </View>
                    :
                    <View>
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <View style={{ width: width * 0.76 }}>
                                <Text style={{ fontFamily: "System", fontSize: 14 }}>Paid</Text>
                                <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>Balance</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontFamily: "System", fontSize: 14 }}>- {'\u20B9'}{order?.amount_paid}</Text>
                                <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', color: 'red' }}>{'\u20B9'}{order?.balance}.00</Text>
                            </View>
                        </View>
                        {order?.status == "Picked" || order?.status == "Delivered" || order?.status == "Rejected" || order?.status == "Cancelled" ?
                            null
                            :
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{
                                        height: 40,
                                        width: '90%',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        marginTop: 20,
                                        paddingHorizontal: 20,
                                        ...styles.shadow,
                                        backgroundColor: 'white'
                                    }}
                                    onPress={() => {
                                        setPaymentModal(true)
                                        setTempBalance(order?.balance)
                                        setTempAmountPaid(order?.amount_paid)
                                    }}
                                >
                                    <Text style={{ fontSize: 16 }}>Update Payment</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                }
            </View>
        )
    }

    function renderCustomerMessage() {
        return (
            <View style={{ marginHorizontal: 20, marginBottom: 20, padding: 10, backgroundColor: '#F5F5F6' }}>
                <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Message</Text>
                <Text style={{ fontFamily: "System", fontSize: 16 }}>{order?.message}</Text>
            </View>
        )
    }

    function renderMessageTextbox() {
        return (
            <View style={{ marginVertical: 20, marginHorizontal: 20}}>
                <View style={{ flexDirection: 'row' }}>
                    <View
                        style={{
                            width: '87%',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                            backgroundColor: '#F5F5F6',
                        }}
                    >
                        <TextInput
                            ref={messagetocustomer}
                            style={{ fontFamily: "System", fontSize: 16, width: '100%' }}
                            onChangeText={(text) => {
                                setMsgToCust(text)
                                setShowErrorMessage(false)
                            }}
                            placeholder="Any message for the Customer?"
                            multiline={true}
                            textAlignVertical={"top"}
                            maxLength={200}
                            value={msgToCust}
                        >
                        </TextInput>
                    </View>
                    <View style={{ width: '10%', justifyContent: 'center', marginLeft: '3%' }}>
                        {order?.status == "Picked" || order?.status == "Delivered" || order?.status == "Rejected" || order?.status == "Cancelled" ?
                            <TouchableOpacity
                                disabled
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 50,
                                    ...styles.shadow,
                                    backgroundColor: 'white',
                                    height: 40,
                                    width: 40
                                }}
                                onPress={() => {
                                    updateMessageToCustomer()
                                }}
                            >
                                <FontAwesome name="send" size={22} color={'gray'} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 50,
                                    ...styles.shadow,
                                    backgroundColor: 'white',
                                    height: 40,
                                    width: 40
                                }}
                                onPress={() => {
                                    updateMessageToCustomer()
                                }}
                            >
                                <FontAwesome name="send" size={22} color={'green'} />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                {showErrorMessage && <View style={{marginTop: 5}}>
                    <Text style={{ color: 'white', fontSize: 14, color: 'red' }}>Write a message to the customer stating the reason for Cancellation.</Text>
                </View>}
            </View>
            )
    }

    function updateMessageToCustomer() {
        fetch(config.url + '/kitapi/appupdateMessageToCustomer', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "msgtocust": msgToCust,
                "orderid": order.id
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.response == "Message updated Successfully") {
                    fetchOrder(order.id)
                }
                alert(json.response)
            }).catch((error) => {
                if (error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")
                } else {
                    console.error(error)
                }
            });
    }

    function renderFooter() {
        return (
            <View style={{ borderStyle: 'solid', borderWidth: 50, borderColor: '#F5F5F6', width: width }}></View>
        )
    }

    const getButtonLabel = (order) => {
        if (order?.mode == "Delivery") {
            labels = ["Placed", "Preparing", "Ready", "Dispatched", "Delivered"]
        } else {
            labels = ["Placed", "Preparing", "Ready", "Picked"]
        }
        return labels[labels.indexOf(order?.status) + 1]
    }

    function renderButtons() {
        function validateCancelAction() {
            if (msgToCust.length == 0) {
                setShowErrorMessage(true)
                messagetocustomer.current.focus();
                scrollViewRef?.scrollToEnd()
            }
            else {
                setCancelOrderModal(true)
            }
        }

        return (
            order?.status == "Waiting" ?
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        alignItems: 'center',
                        borderColor: 'lightgray',
                        borderTopWidth: 0.5,
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={{
                            height: 40,
                            width: width * 0.4,
                            backgroundColor: 'red',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                            marginVertical: 10,
                            marginHorizontal: 10
                        }}
                        onPress={() => {
                            setAction("Reject")
                            setAcceptRejectModal(true)
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>REJECT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            height: 40,
                            width: width * 0.4,
                            backgroundColor: 'green',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                            marginVertical: 10,
                            marginHorizontal: 10
                        }}
                        onPress={() => {
                            setAction("Accept")
                            setAcceptRejectModal(true)
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>ACCEPT</Text>
                    </TouchableOpacity>
                </View>
                :
                order?.status == "Picked" || order?.status == "Delivered" || order?.status == "Rejected" || order?.status == "Cancelled" ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity
                            style={{
                                height: 40,
                                width: '40%',
                                borderColor: 'green',
                                borderWidth: 0.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 14
                            }}
                        // onPress={() => {
                        //     ratingsModal(item.kitchen.id)
                        // }}
                        >
                            <Text style={{ color: 'green', fontSize: 14 }}>Send Coupon</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                height: 40,
                                width: '40%',
                                borderColor: 'red',
                                borderWidth: 0.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 14
                            }}
                        // onPress={() => {
                        //     setHelpKitchenId(item.kitchen.id)
                        //     setHelpOrderId(item.id)
                        //     setHelpModal(true)
                        // }}
                        >
                            <Text style={{ color: 'red', fontSize: 14 }}>Report Customer</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        alignItems: 'center',
                        borderColor: 'lightgray',
                        borderTopWidth: 0.5,
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={{
                            height: 40,
                            width: width * 0.4,
                            backgroundColor: 'red',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                            marginVertical: 10,
                            marginHorizontal: 10,
                            ...styles.shadow,
                        }}
                        onPress={() => {
                            validateCancelAction()
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Cancel Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            height: 40,
                            width: width * 0.4,
                            backgroundColor: getButtonLabel(order) == "Delivered" || getButtonLabel(order) == "Picked" ? '#4BB543' : '#FFCC00',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                            marginVertical: 10,
                            marginHorizontal: 10,
                            ...styles.shadow,
                        }}
                        onPress={() => {
                            setChangeStatusModal(true)
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Mark {getButtonLabel(order)}</Text>
                    </TouchableOpacity>
                </View>
        )
    }

    function handleNewOrder() {
        AsyncStorage.getItem("kitAuthToken").then((token) => {
            if (token) {
                fetch(config.url + '/kitapi/apphandleNewOrder', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + token
                    },
                    body: JSON.stringify({
                        "action": action,
                        "orderid": order.id,
                        "msgtocust": msgToCust
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        console.log(json);
                        navigation.goBack()
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

    function renderConfirmAcceptOrRejectModal() {
        return (
            <Modal
                isVisible={acceptRejectModal}
                onBackdropPress={() => setAcceptRejectModal(!acceptRejectModal)}
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
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Are you sure you want to <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold' }}>"{action}"</Text> the Order?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => setAcceptRejectModal(!acceptRejectModal)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>NO</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setAcceptRejectModal(!acceptRejectModal)
                                handleNewOrder()
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
            setTempBalance(order?.total_amount - amount)
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
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Total Amount:  {'\u20B9'}{order?.total_amount}</Text>
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
                            editable={!order?.balance == 0}
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
                "orderid": order.id
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.response == "Payment updated Successfully") {
                    fetchOrder(order.id)
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
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Do you want to change the Order status to <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold' }}>"{getButtonLabel(order)}"</Text> ?</Text>
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
                                changeOrderStatus(getButtonLabel(order))
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>YES</Text>
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
                "orderid": order.id
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.response == "Status updated Successfully") {
                    fetchOrder(order.id)
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

    function renderCancelOrderModal() {
        return (
            <Modal
                isVisible={cancelOrderModal}
                onBackdropPress={() => setCancelOrderModal(!cancelOrderModal)}
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
                    {order?.amount_paid > 0 ?
                        <Text style={{ fontFamily: "System", fontSize: 18 }}>The Refund request will be initiated automatically if you <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold' }}>"Cancel"</Text> the Order. Do you want to proceed?</Text>
                        :
                        <Text style={{ fontFamily: "System", fontSize: 18 }}>Are you sure you want to <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold' }}>"Cancel"</Text> the Order?</Text>
                    }
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => setCancelOrderModal(!cancelOrderModal)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>NO</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setCancelOrderModal(!cancelOrderModal)
                                cancelOrder("Cancelled")
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>YES</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function cancelOrder(orderstatus) {
        fetch(config.url + '/kitapi/appchangeOrderStatus', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "status": orderstatus,
                "orderid": order.id,
                "msgtocust": msgToCust
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.response == "Status updated Successfully") {
                    navigation.goBack()
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
            {renderHeader()}
            {renderGap()}
            <ScrollView ref={(ref) => setScrollViewRef(ref)}>
                {renderCartItems()}
                {order?.message ? renderCustomerMessage() : null}
                {renderGap()}
                {renderDates()}
                {renderGap()}
                {renderAddress()}
                {renderContactInfo()}
                {renderGap()}
                {renderBillingDetails()}
                {renderGap()}
                {renderMessageTextbox()}
                {renderGap()}
                {renderFooter()}
            </ScrollView>
            {renderButtons()}
            {renderConfirmAcceptOrRejectModal()}
            {renderPaymentModal()}
            {renderStatusChangeModal()}
            {renderCancelOrderModal()}
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

export default OrderDetails;