import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ImageBackground,
    ActivityIndicator,
    } from "react-native";
    import { FontAwesome } from "@expo/vector-icons";
    import * as ImagePicker from "expo-image-picker";
    import { doc, updateDoc } from "firebase/firestore";
    import { db } from "../src/config/firebaseConfig";

    export default function EditProduct({ route, navigation }) {
    const { product } = route.params;

    const [name, setName] = useState(product.name || "");
    const [quantity, setQuantity] = useState(product.quantity?.toString() || "");
    const [price, setPrice] = useState(product.price?.toString() || "");
    const [description, setDescription] = useState(product.description || "");
    const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
    const [loading, setLoading] = useState(false);

    //  Seleccionar imagen desde cámara o galería
    const pickImage = async (fromCamera = false) => {
        try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permiso requerido", "Se necesita acceso a la cámara o galería.");
            return;
        }

        const result = fromCamera
            ? await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            })
            : await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
        } catch (error) {
        console.log("Error al seleccionar imagen:", error);
        Alert.alert("Error", "No se pudo seleccionar la imagen.");
        }
    };

    //  Actualizar producto (sin subir imagen a Storage)
    const handleUpdate = async () => {
        if (!name || !quantity || !price) {
        Alert.alert("Error", "Nombre, cantidad y precio son obligatorios.");
        return;
        }

        try {
        setLoading(true);
        const productRef = doc(db, "productos", product.id);

        await updateDoc(productRef, {
            name,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            description,
            imageUrl, // Guarda la URI local
        });

        setLoading(false);
        Alert.alert("✅ Éxito", "Producto actualizado correctamente.");
        navigation.goBack();
        } catch (error) {
        console.log("Error al actualizar producto:", error);
        setLoading(false);
        Alert.alert("Error", "No se pudo actualizar el producto.");
        }
    };

    return (
        <ImageBackground
        source={require("../assets/fondoPistacho.jpg")}
        style={styles.backgroundImage}
        >
        <View style={styles.overlay}>
            <Text style={styles.title}>Editar Producto</Text>

            {/* Imagen del producto */}
            <View style={styles.avatarContainer}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.avatar} />
            ) : (
                <View style={styles.placeholder}>
                <FontAwesome name="image" size={40} color="#fff" />
                </View>
            )}

            <View style={styles.photoButtons}>
                <TouchableOpacity
                style={styles.iconButton}
                onPress={() => pickImage(false)}
                >
                <FontAwesome name="image" size={18} color="#fff" />
                <Text style={styles.iconText}>Galería</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={styles.iconButton}
                onPress={() => pickImage(true)}
                >
                <FontAwesome name="camera" size={18} color="#fff" />
                <Text style={styles.iconText}>Cámara</Text>
                </TouchableOpacity>
            </View>
            </View>

            {/* Campos */}
            <Text style={styles.label}>Nombre del producto</Text>
            <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
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

            <Text style={styles.label}>Descripción</Text>
            <TextInput
            style={styles.input}
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#ddd"
            />

            {/* Botones */}
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            {loading && (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 15 }} />
            )}
        </View>
        </ImageBackground>
    );
    }

    //  Estilos
    const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    overlay: {
        flex: 1,
        width: "100%",
        padding: 25,
        backgroundColor: "rgba(29, 53, 19, 0.7)",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 20,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 15,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#fff",
    },
    placeholder: {
        width: 120,
        height: 120,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    photoButtons: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
        gap: 15,
    },
    iconButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    iconText: {
        color: "#fff",
        marginLeft: 5,
    },
    label: {
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 5,
        marginTop: 10,
        alignSelf: "flex-start",
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        color: "#fff",
        fontSize: 15,
    },
    saveButton: {
        backgroundColor: "#fff",
        paddingVertical: 15,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        color: "#2e7d32",
        fontWeight: "bold",
        fontSize: 16,
    },
    cancelButton: {
        borderColor: "#fff",
        borderWidth: 1.5,
        paddingVertical: 15,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
