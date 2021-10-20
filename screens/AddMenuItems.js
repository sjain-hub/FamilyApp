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
import { NewOrders } from './';
import veg from "../assets/icons/veg.png";
import nonveg from "../assets/icons/nonveg.png";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const AddMenuItems = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [allItems, setAllItems] = React.useState()
    const [menuItems, setMenuItems] = React.useState()
    const [categories, setCategories] = React.useState()
    const [sectionListData, setSectionListData] = React.useState();
    const [selectedItemIds, setSelectedItemIds] = React.useState([])

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
                fetch(config.url + '/kitapi/appaddMenuItems', {
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
                        setMenuItems(json.menuItems)
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
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>SELECT ITEMS</Text>
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

        function checkItemPresence(itemid) {
            let index = selectedItemIds.findIndex(id => id == itemid)
            return index
        }

        function handleTick(itemid) {
            let index = checkItemPresence(itemid)
            if (index < 0) {
                selectedItemIds.push(itemid)
            } else {
                selectedItemIds.splice(index, 1);
            }
        }

        const renderItem = ({ item }) => {
            let foundInMenu = menuItems.find(menuitem => menuitem.item.id == item.id);
            if (foundInMenu) {
                return (
                    <View
                        style={{ paddingHorizontal: 20, marginVertical: 4, height: 80, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'white' }}
                    >
                        <View style={{ width: '85%', }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {item.itemType == "veg" ?
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
                                <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 5 }}>{item.itemName}</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                width: '10%',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                height: '100%',
                            }}
                        >
                            <BouncyCheckbox
                                size={25}
                                fillColor="lightgray"
                                unfillColor="#FFFFFF"
                                iconStyle={{ borderColor: "lightgray" }}
                                disabled
                                isChecked={true}
                            />
                        </View>
                    </View>
                )
            } else {
                return (
                    <View
                        style={{ paddingHorizontal: 20, marginVertical: 4, height: 80, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'white' }}
                    >
                        <View style={{ width: '85%', }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {item.itemType == "veg" ?
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
                                <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 5 }}>{item.itemName}</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                width: '10%',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                height: '100%',
                            }}
                        >
                            <BouncyCheckbox
                                size={25}
                                fillColor="green"
                                unfillColor="#FFFFFF"
                                iconStyle={{ borderColor: "green" }}
                                // isChecked={checkItemPresence(item.id) < 0 ? false : true}
                                onPress={() => handleTick(item.id)}
                            />
                        </View>
                    </View>
                )
            }
            
        }

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
                        addSelectedItemsToMenu()
                        setLoading(true)
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18 }}>Add Selected Items to Menu</Text>
                </TouchableOpacity>

            </View>
        )
    }

    function addSelectedItemsToMenu() {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/appaddMenuItems', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": "add",
                        "itemsIds": selectedItemIds
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        if (json.response == "Successfully added") {
                            navigation.goBack()
                        }
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

export default AddMenuItems;