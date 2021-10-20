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


const Menu = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [categories, setCategories] = React.useState(null);
    const [menuItems, setMenuItems] = React.useState()
    const [sectionListData, setSectionListData] = React.useState();
    const [selectedItem, setSelectedItem] = React.useState()
    const [openOptionsModal, setOpenOptionsModal] = React.useState(false)
    const [minModal, setMinModal] = React.useState(false)
    const [discModal, setDiscModal] = React.useState(false)
    const [removeModal, setRemoveModal] = React.useState(false)

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
            fetchMenuItems()
        });
        return unsubscribe;
    }, [navigation])

    function fetchMenuItems() {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/apphandleMenu', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": "fetch"
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setMenuItems(json.menu)
                        setCategories(json.categories)
                        makeSectionList(json.menu, json.categories)
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

    function makeSectionList(items, cats) {
        let sections = []
        cats.map(cat => {
            items.map(item => {
                if (cat.id == item.item.category) {
                    let section = sections.find(section => section.category === cat.category);

                    if (!section) {
                        section = { category: cat.category, data: [] };
                        sections.push(section);
                    }
                    section.data.push(item);
                }

            })
        })
        setSectionListData(sections)
        setLoading(false)
    }

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
                    <Text style={{ fontFamily: "System", fontSize: 24 }}>MENU</Text>
                </View>
            </View>
        )
    }
    
    function renderMenu() {
        const renderCategories = (data) => (
            <View style={{ backgroundColor: 'white', paddingVertical: 10 }}>
                <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 10 }}>{data.section.category}</Text>
            </View>
        )

        const renderItem = ({ item }) => (
            <View
                style={{paddingHorizontal: 20, marginVertical: 10, height: 80, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'white' }}
            >
                <View style={{ width: '65%' }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {item.item.itemType == "veg" ?
                            <Image
                                source={veg}
                                style={{
                                    width: 16,
                                    height: 16,
                                }}
                            /> :
                            <Image
                                source={nonveg}
                                style={{
                                    width: 17,
                                    height: 17,
                                }}
                            />
                        }
                        <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 5 }}>{item.item.itemName}</Text>
                    </View>
                    {item.minOrder > 0 || item.offer > 0 ?
                        <View style={{ flexDirection: 'row' }}>
                            {item.offer > 0 && <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray', marginRight: 10 }}>Discount : {item.offer}%</Text>}
                            {item.minOrder > 0 && <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}>Min Qty : {item.minOrder}</Text>}
                        </View>
                        :
                        null
                    }
                    <Text style={{ fontFamily: "System", fontSize: 14, marginTop: 5 }}>{'\u20B9'} {item.item.price}</Text>
                </View>
                <View
                    style={{
                        width: '20%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: '5%',
                    }}
                >
                    <Switch
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => {
                            setLoading(true)
                            item.out_of_stock = !item.out_of_stock
                            updateItem(item)
                        }}
                        value={!item.out_of_stock}
                        style={Platform.OS == "ios" ?
                            { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }
                            :
                            { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
                    />
                    <Text style={{ fontFamily: "System", fontSize: 10, color: 'gray' }}>{item.out_of_stock? 'Out-of-stock' : 'Available'}</Text>
                </View>
                <TouchableOpacity
                    style={{
                        width: '10%',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        height: '100%',
                    }}
                    onPress={() => {
                        setOpenOptionsModal(true)
                        setSelectedItem(item)
                    }}
                >
                    <SimpleLineIcons name="options-vertical" size={20} color={'gray'} />
                </TouchableOpacity>
            </View>
        )

        return (
            <SectionList
                sections={sectionListData}
                renderSectionHeader={
                    renderCategories
                }
                renderItem={
                    renderItem
                }
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingTop: 10,
                    paddingBottom: 140,
                    backgroundColor: 'white',
                    width: width,
                }}
            />
        )
    }

    function optionsModal() {
        return (
            <Modal
                isVisible={openOptionsModal}
                onBackdropPress={() => setOpenOptionsModal(!openOptionsModal)}
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
                    borderRadius: 10,
                    padding: 20,
                }}>
                    <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                        {selectedItem?.item.itemType == "veg" ?
                            <Image
                                source={veg}
                                style={{
                                    width: 18,
                                    height: 18,
                                }}
                            /> :
                            <Image
                                source={nonveg}
                                style={{
                                    width: 19,
                                    height: 19,
                                }}
                            />}
                        <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{selectedItem?.item.itemName}</Text>
                    </View>
                    <View>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                            onPress={() => {
                                setDiscModal(true)
                                setOpenOptionsModal(false)
                            }}
                        >
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: "System", fontSize: 16 }}>Set Discount</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="keyboard-arrow-right" size={30} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                            onPress={() => {
                                setMinModal(true)
                                setOpenOptionsModal(false)
                            }}
                        >
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: "System", fontSize: 16 }}>Set Minimum Qty.</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="keyboard-arrow-right" size={30} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                            onPress={() => {
                                setRemoveModal(true)
                                setOpenOptionsModal(false)
                            }}
                        >
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: "System", fontSize: 16 }}>Remove Item</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="remove-circle-outline" size={30} color={'red'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    function setMinQtyModal() {
        return (
            <Modal
                isVisible={minModal}
                onBackdropPress={() => setMinModal(!minModal)}
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
                    borderRadius: 10,
                    padding: 20,
                }}>
                    <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                        {selectedItem?.item.itemType == "veg" ?
                            <Image
                                source={veg}
                                style={{
                                    width: 18,
                                    height: 18,
                                }}
                            /> :
                            <Image
                                source={nonveg}
                                style={{
                                    width: 19,
                                    height: 19,
                                }}
                            />}
                        <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{selectedItem?.item.itemName}</Text>
                    </View>
                    <View
                        style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ fontFamily: "System", fontSize: 16 }}>Min. Qty. :</Text>
                        <TextInput
                            autoFocus
                            keyboardType={'number-pad'}
                            maxLength={3}
                            style={{ fontFamily: "System", fontSize: 16, width: '20%', backgroundColor: '#F5F5F6', paddingHorizontal: 10, marginLeft: 10 }}
                            onChangeText={(text) => {
                                const obj = {
                                    "id": selectedItem?.id,
                                    "item": selectedItem?.item,
                                    "offer": selectedItem?.offer,
                                    "out_of_stock": selectedItem?.out_of_stock,
                                    "minOrder": text,
                                    "kit": selectedItem?.kit
                                }
                                setSelectedItem(obj)
                            }}
                            value={'' + selectedItem?.minOrder}
                        >
                        </TextInput>
                    </View>
                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', marginVertical: 10 }}>Set the Minimum quantity of this Item which the customer has to buy.</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setMinModal(!minModal)
                                setOpenOptionsModal(true)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>BACK</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center', marginLeft: 20 }}
                            onPress={() => {
                                setMinModal(!minModal)
                                setLoading(true)
                                updateItem(selectedItem)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>SAVE</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function setDiscountModal() {
        return (
            <Modal
                isVisible={discModal}
                onBackdropPress={() => setDiscModal(!discModal)}
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: width * 0.8,
                    alignSelf: 'center'
                }}
            >
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 20,
                }}>
                    <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                        {selectedItem?.item.itemType == "veg" ?
                            <Image
                                source={veg}
                                style={{
                                    width: 18,
                                    height: 18,
                                }}
                            /> :
                            <Image
                                source={nonveg}
                                style={{
                                    width: 19,
                                    height: 19,
                                }}
                            />}
                        <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{selectedItem?.item.itemName}</Text>
                    </View>
                    <View
                        style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ fontFamily: "System", fontSize: 16 }}>Discount :</Text>
                        <TextInput
                            autoFocus
                            keyboardType={'number-pad'}
                            maxLength={3}
                            style={{ fontFamily: "System", fontSize: 16, width: '20%', backgroundColor: '#F5F5F6', paddingHorizontal: 10, marginLeft: 10 }}
                            onChangeText={(text) => {
                                const obj = {
                                    "id": selectedItem?.id,
                                    "item": selectedItem?.item,
                                    "offer": text,
                                    "out_of_stock": selectedItem?.out_of_stock,
                                    "minOrder": selectedItem?.minOrder,
                                    "kit": selectedItem?.kit
                                }
                                setSelectedItem(obj)
                            }}
                            value={'' + selectedItem?.offer}
                        >
                        </TextInput>
                        <Text style={{ fontFamily: "System", fontSize: 20, marginLeft: 5 }}>%</Text>
                    </View>
                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', marginVertical: 10 }}>Set the Discount which you want to offer on this particular Item.</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setDiscModal(!discModal)
                                setOpenOptionsModal(true)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>BACK</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center', marginLeft: 20 }}
                            onPress={() => {
                                setDiscModal(!discModal)
                                setLoading(true)
                                updateItem(selectedItem)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>SAVE</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function removeItemModal() {
        return (
            <Modal
                isVisible={removeModal}
                onBackdropPress={() => setRemoveModal(!removeModal)}
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
                    borderRadius: 10,
                    padding: 30,
                }}>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        {selectedItem?.item.itemType == "veg" ?
                            <Image
                                source={veg}
                                style={{
                                    width: 18,
                                    height: 18,
                                }}
                            /> :
                            <Image
                                source={nonveg}
                                style={{
                                    width: 19,
                                    height: 19,
                                }}
                            />}
                        <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{selectedItem?.item.itemName}</Text>
                    </View>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Are you sure you want to remove this Item from your Menu?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setRemoveModal(!removeModal)
                                setOpenOptionsModal(true)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>NO</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setLoading(true)
                                setRemoveModal(!removeModal)
                                removeItem(selectedItem)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>YES</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function removeItem(item) {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/apphandleMenu', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": "removeitem",
                        "itemid": item.id
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setMenuItems(json.menu)
                        setCategories(json.categories)
                        makeSectionList(json.menu, json.categories)
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

    function updateItem(item) {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/apphandleMenu', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": "updateitem",
                        "itemid": item.id,
                        "itemstatus": item.out_of_stock,
                        "offer": item.offer? item.offer : 0,
                        "minOrder": item.minOrder? item.minOrder : 0
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setMenuItems(json.menu)
                        setCategories(json.categories)
                        makeSectionList(json.menu, json.categories)
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

    function renderAddItemButton() {
        return (
            <View
                style={{
                    position: 'absolute',
                    height: 110,
                    bottom: 10,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    borderColor: 'lightgray',
                    borderTopWidth: 0.5,
                    backgroundColor: 'white'
                }}
            >
                <TouchableOpacity
                    style={{
                        height: 50,
                        width: width * 0.9,
                        backgroundColor: COLORS.orange,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        marginVertical: 10
                    }}
                    onPress={() => navigation.navigate("AddMenuItems")}
                >
                    <Text style={{ color: 'white', fontSize: 18 }}>Add Items</Text>
                </TouchableOpacity>

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
                    {renderMenu()}
                    {renderAddItemButton()}
                </View>
            }
            <NewOrders navigation={navigation}/>
            {optionsModal()}
            {setMinQtyModal()}
            {setDiscountModal()}
            {removeItemModal()}
        </SafeAreaView>
    )

}

export default Menu;

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