import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert 
    } from 'react-native';

    export default function AddProduct({ navigation }) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    const handleAdd = () => {
        if (!name || !quantity || !price) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
        }

        // 👇 después se conecta a Firebase
        Alert.alert("Producto agregado", `${name} agregado con éxito!`);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Agregar Producto</Text>

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

        <TouchableOpacity style={styles.button} onPress={handleAdd}>
            <Text style={styles.buttonText}>Guardar</Text>
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
