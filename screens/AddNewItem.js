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
    StatusBar,
    ActivityIndicator
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import { COLORS } from '../constants';
import { NewOrders } from '.';
import {Picker} from '@react-native-picker/picker';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

const AddNewItem = ({ route, navigation }) => {

    const [shutter, setShutter] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [allCategories, setAllCategories] = React.useState()
    const [selectedCategory, setSelectedCategory] = React.useState()
    const [newCategory, setNewCategory] = React.useState()
    const [itemName, setItemName] = React.useState()
    const [itemType, setItemType] = React.useState("veg")
    const [price, setPrice] = React.useState("0")
    const [condition, setCondition] = React.useState()
    const [description, setDescription] = React.useState()
    const [categoryModal, setCategoryModal] = React.useState(false)
    const [confirmDeleteModal, setConfirmDeleteModal] = React.useState(false)
    const [saveButton, setSaveButton] = React.useState(false)

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
            handleCategories("fetchCategories")
        });
        return unsubscribe;
    }, [navigation])

    function handleCategories(action) {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/appaddNewItem', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": action,
                        "newCategory": newCategory,
                        "selectedCategory": selectedCategory? selectedCategory.id : ""
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setAllCategories(json.categories)
                        setSelectedCategory(json.categories[0])
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
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>ADD NEW ITEM</Text>
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

    function renderForm() {
        function checkItemName(name) {
            if (name) {
                if (name.length > 0) {
                    setSaveButton(true)
                } else {
                    setSaveButton(false)
                }
            } else {
                setSaveButton(false)
            }
        }

        return (
            <ScrollView>
                <View style={{ alignItems: 'center', paddingBottom: 100 }}>
                    <View style={{ marginVertical: 10, width: width * 0.9 }}>
                        <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontFamily: "System", fontSize: 18, width: '50%' }}>Select Category</Text>
                            <Pressable
                                style={{ alignItems: 'flex-end', width: '50%' }}
                                onPress={() => {
                                    setCategoryModal(true)
                                }}
                            >
                                <Text style={{ fontFamily: "System", fontSize: 14, color: COLORS.orange }} >Add/Delete Category</Text>
                            </Pressable>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: 'lightgray', borderRadius: 6, ...styles.shadow, backgroundColor: 'white' }}>
                            <Picker
                                selectedValue={selectedCategory}
                                mode={'dropdown'}
                                onValueChange={(itemValue, itemIndex) => {
                                    setSelectedCategory(itemValue)
                                }}>
                                    {
                                        allCategories?.map(cat => {
                                            return (
                                                <Picker.Item key={cat.id} label={cat.category} value={cat} />
                                            )
                                        })
                                    }
                            </Picker>
                        </View>
                    </View>
                    <View style={{ marginVertical: 10, width: width * 0.9 }}>
                        <Text style={{ fontFamily: "System", fontSize: 18, marginVertical: 10 }}>Name</Text>
                        <View style={{ borderWidth: 1, borderColor: 'lightgray', borderRadius: 6, ...styles.shadow, backgroundColor: 'white' }}>
                            <TextInput
                                style={{ fontFamily: "System", fontSize: 16, paddingHorizontal: 10 }}
                                onChangeText={(text) => {
                                    setItemName(text)
                                    checkItemName(text)
                                }}
                                textAlignVertical={"top"}
                                maxLength={30}
                                value={itemName}
                            >
                            </TextInput>
                        </View>
                    </View>
                    <View style={{ marginVertical: 10, width: width * 0.9 }}>
                        <Text style={{ fontFamily: "System", fontSize: 18, marginVertical: 10 }}>Select Item Type</Text>
                        <View style={{ borderWidth: 1, borderColor: 'lightgray', borderRadius: 6, ...styles.shadow, backgroundColor: 'white' }}>
                            <Picker
                                selectedValue={itemType}
                                mode={'dropdown'}
                                onValueChange={(itemValue, itemIndex) =>
                                    setItemType(itemValue)
                                }>
                                <Picker.Item label="Veg" value="veg" />
                                <Picker.Item label="Non-Veg" value="nonveg" />
                            </Picker>
                        </View>
                    </View>
                    <View style={{ marginVertical: 10, width: width * 0.9 }}>
                        <Text style={{ fontFamily: "System", fontSize: 18, marginVertical: 10 }}>Price</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10, color: 'gray' }}>If you have Sub-Items of this Item, then you can use the lower once's Price.</Text>
                        <View style={{ borderWidth: 1, borderColor: 'lightgray', borderRadius: 6, ...styles.shadow, backgroundColor: 'white', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: "System", fontSize: 20, marginHorizontal: 10, alignSelf: 'center' }}>{'\u20B9'}</Text>
                            <TextInput
                                keyboardType={'number-pad'}
                                style={{ fontFamily: "System", fontSize: 16, paddingHorizontal: 10, width: '100%' }}
                                onChangeText={(text) => {
                                    setPrice(text)
                                }}
                                textAlignVertical={"top"}
                                maxLength={4}
                                value={price}
                            >
                            </TextInput>
                        </View>
                    </View>
                    <View style={{ marginVertical: 10, width: width * 0.9 }}>
                        <Text style={{ fontFamily: "System", fontSize: 18, marginTop: 10, marginBottom: 4 }}>Condition</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10, color: 'gray' }}>Mention if there is any Condition on this Item. E.g.: 'This Item requires 1 day prior Order.'</Text>
                        <View style={{ borderWidth: 1, borderColor: 'lightgray', borderRadius: 6, ...styles.shadow, backgroundColor: 'white' }}>
                            <TextInput
                                style={{ fontFamily: "System", fontSize: 16, paddingHorizontal: 10 }}
                                onChangeText={(text) => {
                                    setCondition(text)
                                }}
                                textAlignVertical={"top"}
                                maxLength={50}
                                multiline={true}
                                value={condition}
                            >
                            </TextInput>
                        </View>
                    </View>
                    <View style={{ marginVertical: 10, width: width * 0.9 }}>
                        <Text style={{ fontFamily: "System", fontSize: 18, marginTop: 10, marginBottom: 4 }}>Description</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10, color: 'gray' }}>If you want to Describe your Item stating the Ingredients, Qualities, etc.</Text>
                        <View style={{ borderWidth: 1, borderColor: 'lightgray', borderRadius: 6, ...styles.shadow, backgroundColor: 'white' }}>
                            <TextInput
                                style={{ fontFamily: "System", fontSize: 16, paddingHorizontal: 10 }}
                                onChangeText={(text) => {
                                    setDescription(text)
                                }}
                                textAlignVertical={"top"}
                                maxLength={100}
                                multiline={true}
                                value={description}
                            >
                            </TextInput>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }

    function renderSaveButton() {
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
                        backgroundColor: saveButton? COLORS.orange : 'lightgray',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        marginVertical: 10
                    }}
                    disabled={!saveButton}
                    onPress={() => {
                        setLoading(true)
                        saveItemDetails()
                    }}
                >
                    <Text style={{ color: saveButton? 'white' : 'gray', fontSize: 18  }}>Save and Next</Text>
                </TouchableOpacity>

            </View>
        )
    }

    function renderAddDeleteCategoryModal() {
        const renderItem = ({ item, index }) => (
            <View style={{flexDirection: 'row', marginVertical: 10}}>
                <Text style={{ fontFamily: "System", fontSize: 18, width: '80%', color: 'gray' }}>{item.category}</Text>
                <TouchableOpacity 
                    style={{width: '20%'}}
                    onPress={() => {
                        setCategoryModal(!categoryModal)
                        setSelectedCategory(item)
                        setConfirmDeleteModal(true)
                    }}
                >
                    <MaterialIcons name="delete-outline" size={28} color={'red'}/>
                </TouchableOpacity>
            </View>
        );

        return (
            <Modal
                isVisible={categoryModal}
                onBackdropPress={() => setCategoryModal(!categoryModal)}
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: width * 0.8,
                    alignSelf: 'center'
                }}
            >
                <View style={{backgroundColor: "white", borderRadius: 10, padding: 20}}>
                    <Text style={{ fontFamily: "System", fontSize: 18, marginVertical: 10 }}>Delete Category</Text>
                    <View style={{
                        width: '100%',
                        maxHeight: 200,
                        borderRadius: 6,
                        ...styles.shadow,
                        backgroundColor: 'white',
                        padding: 10,
                        marginBottom: 30
                    }}>
                        <FlatList
                            data={allCategories}
                            keyExtractor={item => `${item.id}`}
                            renderItem={renderItem}
                            // contentContainerStyle={{
                            //     paddingLeft: 10,
                                
                            // }}
                        />
                    </View>
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Add Category</Text>
                    <View style={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: '100%',
                        marginTop: 10,
                    }}>
                        <View
                            style={{
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <TextInput
                                autoFocus
                                maxLength={50}
                                style={{ fontFamily: "System", fontSize: 18, width: '100%', backgroundColor: '#F5F5F6', paddingHorizontal: 10 }}
                                onChangeText={(text) => setNewCategory(text)}
                                value={newCategory}
                            >
                            </TextInput>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <Pressable
                                style={{ width: '40%', alignItems: 'center' }}
                                onPress={() => setCategoryModal(!categoryModal)}
                            >
                                <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>CANCEL</Text>
                            </Pressable>
                            <Pressable
                                style={{ width: '40%', alignItems: 'center', marginLeft: 20 }}
                                onPress={() => {
                                    setCategoryModal(!categoryModal)
                                    handleCategories("addNewCategory")
                                    setLoading(true)
                                }}
                            >
                                <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>ADD</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    function renderConfirmDeleteModal() {
        return (
            <Modal
                isVisible={confirmDeleteModal}
                onBackdropPress={() => setConfirmDeleteModal(!confirmDeleteModal)}
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
                    <Text style={{ fontFamily: "System", fontSize: 18, marginBottom: 10 }}>Category: {selectedCategory?.category}</Text>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Are you sure you want to remove this Category?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setConfirmDeleteModal(!confirmDeleteModal)
                                setCategoryModal(true)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>NO</Text>
                        </Pressable>
                        <Pressable
                            style={{ width: '40%', alignItems: 'center' }}
                            onPress={() => {
                                setLoading(true)
                                setConfirmDeleteModal(!confirmDeleteModal)
                                handleCategories("deleteCategory")
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: COLORS.orange }}>YES</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function saveItemDetails() {
        AsyncStorage.getItem("kitAuthToken").then((value) => {
            if (value) {
                fetch(config.url + '/kitapi/appaddNewItem', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": "addNewItem",
                        "category": selectedCategory.id,
                        "itemName": itemName,
                        "itemType": itemType,
                        "price": price? price : 0,
                        "condition": condition,
                        "itemDesc": description
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setLoading(false)
                        if (json.response == "Item Added Successfully") {
                            navigation.goBack()
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
                    {renderForm()}
                    {renderSaveButton()}
                    {renderAddDeleteCategoryModal()}
                    {renderConfirmDeleteModal()}
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

export default AddNewItem;