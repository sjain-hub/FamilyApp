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

const MyItems = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [allItems, setAllItems] = React.useState()
    const [categories, setCategories] = React.useState()
    const [sectionListData, setSectionListData] = React.useState();
    const [selectedItem, setSelectedItem] = React.useState()
    const [openOptionsModal, setOpenOptionsModal] = React.useState(false)
    const [deleteModal, setDeleteModal] = React.useState(false)

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
            fetchItems()
        });
        return unsubscribe;
    }, [navigation])

    function fetchItems() {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/apphandleAllItems', {
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
                        setAllItems(json.allItems)
                        setCategories(json.categories)
                        makeSectionList(json.allItems, json.categories)
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
                if (cat.id == item.category) {
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
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>MY ITEMS</Text>
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

    function renderItems() {
        const renderCategories = (data) => (
            <View style={{ backgroundColor: 'white', paddingVertical: 10 }}>
                <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 10 }}>{data.section.category}</Text>
            </View>
        )

        const renderItem = ({ item }) => (
            <View style={{ marginVertical: 20, flexDirection: 'row', width: width, paddingHorizontal: 20 }}>
                <View style={{ width: width * 0.5, justifyContent: 'center', marginRight: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        {item.itemType == "veg" ?
                            <Image
                                source={veg}
                                style={{
                                    width: 17,
                                    height: 17,
                                }}
                            /> :
                            <Image
                                source={nonveg}
                                style={{
                                    width: 18,
                                    height: 18,
                                }}
                            />}
                        <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 5 }}>{item.itemName}</Text>
                    </View>

                    {item.itemDesc ? <Text style={{ fontFamily: "System", fontSize: 14, color: "gray" }}>{item.itemDesc}</Text> : null}

                    {item.condition ?
                        <Text style={{ fontFamily: "System", fontSize: 14, color: "red" }}>{item.condition}</Text>
                        : null}

                    <Text style={{ fontFamily: "System", fontSize: 16, marginTop: 10 }}>{'\u20B9'} {item.price}</Text>
                </View>
                <TouchableOpacity 
                    style={{ height: 120, alignItems: 'flex-end', justifyContent: 'center' }}
                    onPress={() => navigation.navigate("UploadItemImage", {
                        itemid: item.id
                    })}
                >
                    <Image
                        source={{ uri: config.url + item.image }}
                        resizeMode="cover"
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 100,
                        }}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 6,
                            width: 35,
                            height: 35,
                            justifyContent: 'flex-end',
                            borderRadius: 50,
                            backgroundColor: COLORS.orange,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...styles.shadow
                        }}
                    >
                        <MaterialIcons name="photo-camera" size={18} color={'white'}/>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        width: width*0.1,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                    }}
                    onPress={() => {
                        setOpenOptionsModal(true)
                        setSelectedItem(item)
                    }}
                >
                    <SimpleLineIcons name="options-vertical" size={24} color={'gray'} />
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
                    paddingBottom: 80,
                    borderRadius: 10,
                    backgroundColor: 'white',
                    width: width
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
                        {selectedItem?.itemType == "veg" ?
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
                        <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{selectedItem?.itemName}</Text>
                    </View>
                    <View>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                            // onPress={() => {
                            //     setDiscModal(true)
                            //     setOpenOptionsModal(false)
                            // }}
                        >
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: "System", fontSize: 16 }}>Edit Details</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="keyboard-arrow-right" size={30} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                            // onPress={() => {
                            //     setDiscModal(true)
                            //     setOpenOptionsModal(false)
                            // }}
                        >
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: "System", fontSize: 16 }}>Add SubItems</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="keyboard-arrow-right" size={30} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                            onPress={() => {
                                setDeleteModal(true)
                                setOpenOptionsModal(false)
                            }}
                        >
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: "System", fontSize: 16 }}>Delete Item</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="delete-outline" size={28} color={'red'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    function deleteItemModal() {
        return (
            <Modal
                isVisible={deleteModal}
                onBackdropPress={() => setDeleteModal(!deleteModal)}
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
                        {selectedItem?.itemType == "veg" ?
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
                        <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{selectedItem?.itemName}</Text>
                    </View>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Are you sure you want to Delete this Item?</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray' }}>(This Item will be Deleted permanently from your Kitchen)</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setDeleteModal(!deleteModal)
                                setOpenOptionsModal(true)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>NO</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setLoading(true)
                                setDeleteModal(!deleteModal)
                                deleteItem(selectedItem)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>YES</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function deleteItem(item) {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/apphandleAllItems', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": "deleteItem",
                        "itemid": item.id
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setAllItems(json.allItems)
                        setCategories(json.categories)
                        makeSectionList(json.allItems, json.categories)
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

    function renderAddItemsButton() {
        return (
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    onPress={() => {
                        navigation.navigate("AddNewItem")
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18 }}>Add New Item</Text>
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
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ shutter? COLORS.blue : COLORS.gray} barStyle="light-content" />
            {loading?
                renderLoader()
                :
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    {renderGap()}
                    {renderItems()}
                    {renderAddItemsButton()}
                    {optionsModal()}
                    {deleteItemModal()}
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

export default MyItems;