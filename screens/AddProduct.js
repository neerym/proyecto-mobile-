import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert,
    Image
} from 'react-native';

// Importamos funciones de Firebase para trabajar con Firestore
import { collection, addDoc } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";
import defaultImage from '../assets/default.png'; 

//  Componente principal para agregar productos
export default function AddProduct({ navigation }) {
    // Estados locales para los campos del formulario
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    // 🔑 Función que guarda un nuevo producto en Firestore
    const handleAdd = async () => {
        // Validación: algunos campos son obligatorios
        if (!name || !quantity || !price) {
            Alert.alert("Error", "Nombre, cantidad y precio son obligatorios");
            return;
        }

        try {
            // Guardamos en la colección "productos"
            await addDoc(collection(db, "productos"), {
                name,
                quantity: parseInt(quantity),   // convierte cantidad a número entero
                price: parseFloat(price),       // convierte precio a decimal
                description,
                 imageUrl: imageUrl ? imageUrl : Image.resolveAssetSource(defaultImage).uri,
                createdAt: new Date(),          // fecha de creación
            });

            //  Mensaje de éxito
            Alert.alert("✅ Producto agregado", `${name} se guardó con éxito`);

            // ⏳ Regresa a la pantalla anterior después de 1 segundo
            setTimeout(() => navigation.goBack(), 1000);
        } catch (error) {
            // Manejo de errores
            console.log("❌ Error al agregar producto:", error);
            Alert.alert("Error", "No se pudo guardar el producto.");
        }
    };

    //  Renderizado de la interfaz de usuario
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Agregar Producto</Text>

            {/* Campo para Nombre */}
            <TextInput 
                style={styles.input} 
                placeholder="Nombre" 
                value={name} 
                onChangeText={setName} 
            />

            {/* Campo para Cantidad */}
            <TextInput 
                style={styles.input} 
                placeholder="Cantidad" 
                value={quantity} 
                onChangeText={setQuantity} 
                keyboardType="numeric"
            />

            {/* Campo para Precio */}
            <TextInput 
                style={styles.input} 
                placeholder="Precio" 
                value={price} 
                onChangeText={setPrice} 
                keyboardType="numeric"
            />

            {/* Campo para Descripción */}
            <TextInput 
                style={styles.input} 
                placeholder="Descripción" 
                value={description} 
                onChangeText={setDescription} 
            />

            {/* Campo opcional para URL de imagen */}
            <TextInput 
                style={styles.input} 
                placeholder="URL de la imagen (opcional)" 
                value={imageUrl} 
                onChangeText={setImageUrl} 
            />

            {/* Botón para guardar el producto */}
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
        </View>
    );
}

//Estiloss de la pantalla
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
