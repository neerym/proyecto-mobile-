import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import defaultImage from '../assets/default.png';

export default function EditProduct({ route, navigation }) {
    const { product } = route.params;

    const [name, setName] = useState(product.name || '');
    const [quantity, setQuantity] = useState(product.quantity?.toString() || '');
    const [price, setPrice] = useState(product.price?.toString() || '');
    const [description, setDescription] = useState(product.description || '');
    const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
    const [type, setType] = useState(product.tipo || 'otros');

    // --- Modal state ---
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalSuccess, setModalSuccess] = useState(false);

    // Seleccionar imagen
    const pickImage = async (fromCamera = false) => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                setModalMessage('Se necesita acceso a la cámara o galería.');
                setModalSuccess(false);
                setModalVisible(true);
                return;
            }

            const result = fromCamera
                ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
                : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });

            if (!result.canceled) {
                setImageUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Error al seleccionar imagen:', error);
            setModalMessage('No se pudo seleccionar la imagen.');
            setModalSuccess(false);
            setModalVisible(true);
        }
    };

    // Actualizar producto
    const handleUpdate = async () => {
        if (!name || !quantity || !price) {
            setModalMessage('Nombre, cantidad y precio son obligatorios.');
            setModalSuccess(false);
            setModalVisible(true);
            return;
        }

        try {
            const productRef = doc(db, 'productos', product.id);
            await updateDoc(productRef, {
                name,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                description,
                imageUrl: imageUrl || Image.resolveAssetSource(defaultImage).uri,
                tipo: type,
            });

            setModalMessage(`${name} fue actualizado correctamente.`);
            setModalSuccess(true);
            setModalVisible(true);
        } catch (error) {
            console.log('Error al actualizar producto:', error);
            setModalMessage('No se pudo actualizar el producto.');
            setModalSuccess(false);
            setModalVisible(true);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        if (modalSuccess) navigation.goBack();
    };

    return (
        <ImageBackground source={require('../assets/fondoPistacho.jpg')} style={styles.background}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.overlay}>
                        <Text style={styles.title}>Editar Producto</Text>

                        {/* Imagen del producto */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: imageUrl || Image.resolveAssetSource(defaultImage).uri }}
                                style={styles.imagePreview}
                            />
                            <View style={styles.photoButtons}>
                                <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(false)}>
                                    <FontAwesome name="image" size={18} color="#fff" />
                                    <Text style={styles.iconText}>Galería</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(true)}>
                                    <FontAwesome name="camera" size={18} color="#fff" />
                                    <Text style={styles.iconText}>Cámara</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* formulario */}
                        <Text style={styles.label}>Nombre del producto*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#ddd"
                        />

                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Descripción (opcional)"
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor="#ddd"
                        />

                        <Text style={styles.label}>Cantidad en stock*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Stock"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            placeholderTextColor="#ddd"
                        />

                        <Text style={styles.label}>Precio unitario*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Precio"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            placeholderTextColor="#ddd"
                        />

                        <Text style={styles.label}>Tipo de producto</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={type}
                                onValueChange={(value) => setType(value)}
                                style={styles.picker}
                                dropdownIconColor="#fff"
                            >
                                <Picker.Item label="Alimento" value="alimento" />
                                <Picker.Item label="Bebida" value="bebida" />
                                <Picker.Item label="Otros" value="otros" />
                            </Picker>
                        </View>

                        {/* Botones */}
                        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                            <Text style={styles.saveButtonText}>Guardar cambios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* mdal personalizado */}
            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { borderColor: modalSuccess ? '#2e7d32' : '#b00020' }]}>
                        <FontAwesome
                            name={modalSuccess ? 'check-circle' : 'exclamation-triangle'}
                            size={40}
                            color={modalSuccess ? '#2e7d32' : '#b00020'}
                            style={{ marginBottom: 15 }}
                        />
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: modalSuccess ? '#2e7d32' : '#b00020' }]}
                            onPress={closeModal}
                        >
                            <Text style={styles.modalBtnText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: 'cover', width: '100%' },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(29, 53, 19, 0.7)',
        padding: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    imageContainer: { alignItems: 'center', marginBottom: 15 },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 15,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    iconText: { color: '#fff', marginLeft: 5 },
    label: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        color: '#fff',
        fontSize: 15,
    },
    pickerContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        marginBottom: 15,
    },
    picker: { color: '#fff', height: 45 },
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },
    cancelButton: {
        borderColor: '#fff',
        borderWidth: 1.5,
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    //modal 
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        width: '80%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2e7d32',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        marginBottom: 20,
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    modalBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
