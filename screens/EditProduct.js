import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert 
    } from 'react-native';
    import { doc, updateDoc } from "firebase/firestore";
    import { db } from "../src/config/firebaseConfig";

    export default function EditProduct({ route, navigation }) {
    const { product } = route.params;

    const [name, setName] = useState(product.name || '');
    const [quantity, setQuantity] = useState(product.quantity?.toString() || '');
    const [price, setPrice] = useState(product.price?.toString() || '');
    const [description, setDescription] = useState(product.description || '');
    const [imageUrl, setImageUrl] = useState(product.imageUrl || '');

    const handleUpdate = async () => {
        if (!name || !quantity || !price || !imageUrl) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
        }

        try {
        const productRef = doc(db, "productos", product.id);
        await updateDoc(productRef, {
            name,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            description,
            imageUrl,
        });

        Alert.alert("✅ Producto actualizado", `${name} se modificó con éxito`);
        navigation.goBack();
        } catch (error) {
        console.log("❌ Error al actualizar producto:", error);
        Alert.alert("Error", "No se pudo actualizar el producto.");
        }
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Editar Producto</Text>

        <TextInput 
            style={styles.input} 
            placeholder="Nombre" 
            value={name} 
            onChangeText={setName} 
        />
        <TextInput 
            style={styles.input} 
            placeholder="Cantidad" 
            value={quantity} 
            onChangeText={setQuantity} 
            keyboardType="numeric"
        />
        <TextInput 
            style={styles.input} 
            placeholder="Precio" 
            value={price} 
            onChangeText={setPrice} 
            keyboardType="numeric"
        />
        <TextInput 
            style={styles.input} 
            placeholder="Descripción" 
            value={description} 
            onChangeText={setDescription} 
        />
        <TextInput 
            style={styles.input} 
            placeholder="URL de la imagen" 
            value={imageUrl} 
            onChangeText={setImageUrl} 
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Guardar Cambios</Text>
        </TouchableOpacity>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f6fa',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2e7d32',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#789C3B',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
