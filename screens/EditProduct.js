import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert 
} from 'react-native';

// Importamos métodos para actualizar documentos en Firestore
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";

// 🛠️ Componente para editar un producto existente
export default function EditProduct({ route, navigation }) {
    // Recibimos el producto desde la pantalla anterior
    const { product } = route.params;

    // Estados iniciales con los valores actuales del producto
    const [name, setName] = useState(product.name || '');
    const [quantity, setQuantity] = useState(product.quantity?.toString() || '');
    const [price, setPrice] = useState(product.price?.toString() || '');
    const [description, setDescription] = useState(product.description || '');
    const [imageUrl, setImageUrl] = useState(product.imageUrl || '');

    // 🔑 Función para actualizar el producto en Firestore
    const handleUpdate = async () => {
        // Validación: todos los campos son obligatorios
        if (!name || !quantity || !price || !imageUrl) {
            Alert.alert("Error", "Todos los campos son obligatorios");
            return;
        }

        try {
            // Obtenemos referencia al documento en Firestore
            const productRef = doc(db, "productos", product.id);

            // Actualizamos con los nuevos valores
            await updateDoc(productRef, {
                name,
                quantity: parseInt(quantity),   // convertir cantidad a entero
                price: parseFloat(price),       // convertir precio a decimal
                description,
                imageUrl,
            });

            // ✅ Aviso de éxito
            Alert.alert("✅ Producto actualizado", `${name} se modificó con éxito`);

            // Volvemos a la pantalla anterior
            navigation.goBack();
        } catch (error) {
            // Manejo de errores
            console.log("❌ Error al actualizar producto:", error);
            Alert.alert("Error", "No se pudo actualizar el producto.");
        }
    };

    // 🖼️ Interfaz de usuario
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Producto</Text>

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

            {/* Campo para URL de la imagen */}
            <TextInput 
                style={styles.input} 
                placeholder="URL de la imagen" 
                value={imageUrl} 
                onChangeText={setImageUrl} 
            />

            {/* Botón para guardar cambios */}
            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
        </View>
    );
}

// 🎨 Estilos de la pantalla
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
