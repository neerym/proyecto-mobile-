import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ImageBackground,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
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

    // Seleccionar imagen
    const pickImage = async (fromCamera = false) => {
        try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara o galería.');
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
        Alert.alert('Error', 'No se pudo seleccionar la imagen.');
        }
    };

    // Actualizar producto
    const handleUpdate = async () => {
        if (!name || !quantity || !price) {
        Alert.alert('Error', 'Nombre, cantidad y precio son obligatorios.');
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

        Alert.alert('✅ Éxito', `${name} fue actualizado correctamente.`);
        navigation.goBack();
        } catch (error) {
        console.log('Error al actualizar producto:', error);
        Alert.alert('Error', 'No se pudo actualizar el producto.');
        }
    };

    return (
        <ImageBackground source={require('../assets/fondoPistacho.jpg')} style={styles.background}>
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.overlay}>
                <Text style={styles.title}>Editar Producto</Text>

                {/* Imagen del producto */}
                <View style={styles.imageContainer}>
                <Image
                    source={{
                    uri: imageUrl || Image.resolveAssetSource(defaultImage).uri,
                    }}
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

                {/* Campos de formulario */}
                <Text style={styles.label}>Nombre del producto</Text>
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

                <Text style={styles.label}>Cantidad en stock</Text>
                <TextInput
                style={styles.input}
                placeholder="Stock"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholderTextColor="#ddd"
                />

                <Text style={styles.label}>Precio unitario</Text>
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
                    <Picker.Item label="Alimento" value="alimento" color="#333" />
                    <Picker.Item label="Bebida" value="bebida" color="#333" />
                    <Picker.Item label="Otros" value="otros" color="#333" />
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
        </ImageBackground>
    );
    }

    const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 15,
    },
    overlay: {
        width: '100%',
        maxWidth: 600,
        backgroundColor: 'rgba(29, 53, 19, 0.7)',
        padding: 20,
        borderRadius: 15,
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    imageContainer: { alignItems: 'center', marginBottom: 8 },
    imagePreview: {
        width: 90,
        height: 90,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 6,
        gap: 12,
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
        marginBottom: 3,
        marginTop: 4,
        alignSelf: 'flex-start',
        fontSize: 13,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 9,
        marginBottom: 5,
        color: '#fff',
        fontSize: 14,
    },
    pickerContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        marginBottom: 8,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    picker: {
        color: '#fff',
        height: 50,
        fontSize: 16,
        backgroundColor: 'transparent',
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
    cancelButton: {
        borderColor: '#fff',
        borderWidth: 1.5,
        paddingVertical: 10,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    cancelButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
