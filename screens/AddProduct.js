import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ImageBackground,
    ActivityIndicator,
    } from 'react-native';
    import { FontAwesome } from '@expo/vector-icons';
    import * as ImagePicker from 'expo-image-picker';
    import { collection, addDoc } from 'firebase/firestore';
    import { db } from '../src/config/firebaseConfig';

    export default function AddProduct({ navigation }) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // 📸 Elegir o sacar foto
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
            setImage(result.assets[0].uri);
        }
        } catch (error) {
        console.log('Error al seleccionar imagen:', error);
        Alert.alert('Error', 'No se pudo seleccionar la imagen.');
        }
    };

    // 💾 Guardar producto (sin subir a Storage)
    const handleAdd = async () => {
        if (!name || !quantity || !price) {
        Alert.alert('Error', 'Nombre, cantidad y precio son obligatorios');
        return;
        }

        try {
        setLoading(true);

        await addDoc(collection(db, 'productos'), {
            name,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            description,
            imageUrl: image || null, // Guarda el URI local
            createdAt: new Date(),
        });

        Alert.alert('✅ Producto agregado', `${name} se guardó con éxito`);
        navigation.goBack();
        } catch (error) {
        console.log('Error al agregar producto:', error);
        Alert.alert('Error', 'No se pudo guardar el producto.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('../assets/fondoPistacho.jpg')} style={styles.background}>
        <View style={styles.overlay}>
            <Text style={styles.title}>Agregar Producto</Text>

            {loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Guardando producto...</Text>
            </View>
            ) : (
            <>
                {/* Imagen seleccionada */}
                <View style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                    <FontAwesome name="image" size={100} color="#fff" />
                )}

                <View style={styles.photoButtons}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(false)}>
                    <FontAwesome name="image" size={20} color="#fff" />
                    <Text style={styles.iconText}>Galería</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(true)}>
                    <FontAwesome name="camera" size={20} color="#fff" />
                    <Text style={styles.iconText}>Cámara</Text>
                    </TouchableOpacity>
                </View>
                </View>

                {/* Campos */}
                <Text style={styles.label}>Nombre del producto</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej: Yerba orgánica"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#ddd"
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                style={styles.input}
                placeholder="Breve descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#ddd"
                />

                <Text style={styles.label}>Cantidad en stock</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej: 10"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholderTextColor="#ddd"
                />

                <Text style={styles.label}>Precio unitario</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej: 1500"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor="#ddd"
                />

                {/* Botones */}
                <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </>
            )}
        </View>
        </ImageBackground>
    );
    }

    const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(29, 53, 19, 0.65)',
        padding: 25,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        color: '#fff',
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        color: '#fff',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
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
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButtonText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },
    cancelButton: {
        borderColor: '#fff',
        borderWidth: 1.5,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: { color: '#fff', marginTop: 10 },
});
