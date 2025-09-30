import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    StyleSheet 
    } from 'react-native';
    import { FontAwesome } from '@expo/vector-icons';

    export default function Items({ navigation }) {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([
        { id: '1', name: 'Yogur Griego', quantity: 15, price: 3200, description: 'Delicioso y cremoso' },
        { id: '2', name: 'Miel', quantity: 1, price: 8200, description: 'Pura y natural' },
        { id: '3', name: 'Granola x 500gr', quantity: 20, price: 7000, description: 'Con frutas y semillas' },
    ]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={styles.card}>
        <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Cantidad: {item.quantity} u</Text>
            <Text>Precio: ${item.price} c/u</Text>
            <Text>Descripción: {item.description}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="pencil" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="trash" size={20} color="red" />
        </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
            <FontAwesome name="search" size={20} color="#555" />
            <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            value={search}
            onChangeText={setSearch}
            />
        </View>

        {/* Botón agregar producto */}
        <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('AddProduct')}
        >
            <Text style={styles.addButtonText}>+ Agregar producto</Text>
        </TouchableOpacity>

        {/* Lista de productos */}
        <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f6fa',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    searchInput: {
        flex: 1,
        padding: 10,
        marginLeft: 5,
    },
    addButton: {
        backgroundColor: '#789C3B',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    iconButton: {
        marginLeft: 10,
    },
});
