import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig'; // Asegúrate de que esta ruta sea correcta

export default function ProductDetailScreen({ route, navigation }) {
    // 1. Obtener el producto de los parámetros de la ruta
    const { product } = route.params;

    const handleDelete = (id, name) => {
        Alert.alert(
            'Eliminar producto',
            `¿Seguro que deseas eliminar "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'productos', id));
                            Alert.alert('Eliminado', `${name} fue borrado.`);
                            navigation.goBack(); // Vuelve a la lista después de eliminar
                        } catch (error) {
                            console.log('Error al eliminar:', error);
                            Alert.alert('Error', 'No se pudo eliminar el producto.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Image
                source={
                    product.imageUrl
                        ? { uri: String(product.imageUrl) }
                        : require('../assets/default.png')
                }
                style={styles.image}
            />
            
            <View style={styles.header}>
                <Text style={styles.name}>{product.name}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('EditProduct', { product })}
                    >
                        <FontAwesome name="pencil" size={24} color="#2e7d32" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconButton, { marginLeft: 15 }]}
                        onPress={() => handleDelete(product.id, product.name)}
                    >
                        <FontAwesome name="trash" size={24} color="red" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.detailTitle}>Información del Producto</Text>
                
                {product.tipo && <Text style={styles.detail}>Tipo: <Text style={styles.detailValue}>{product.tipo}</Text></Text>}
                <Text style={styles.detail}>Cantidad: <Text style={styles.detailValue}>{product.quantity} u</Text></Text>
                <Text style={styles.detail}>Precio Unitario: <Text style={styles.detailValue}>${product.price}</Text></Text>
                
                {product.description ? (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>Descripción:</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                ) : null}
            </View>
            
            {/* Puedes añadir más detalles aquí si los tienes, como fecha de creación, etc. */}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2e7d32',
        flex: 1,
        marginRight: 10,
    },
    actions: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 5,
    },
    detailsCard: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    detail: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    detailValue: {
        fontWeight: '600',
        color: '#2e7d32',
    },
    descriptionContainer: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    }
});