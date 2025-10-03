import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Firestore: lectura en tiempo real y borrado
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';

// 📦 Pantalla de listado de productos
export default function Items({ navigation }) {
    // Estados
    const [search, setSearch] = useState('');     // filtro de búsqueda
    const [products, setProducts] = useState([]); // lista de productos
    const [loading, setLoading] = useState(true); // indicador de carga inicial

    // 🔄 Cargar productos en tiempo real con onSnapshot
    useEffect(() => {
        const ref = collection(db, 'productos');

        // Suscripción a cambios en la colección "productos"
        const unsubscribe = onSnapshot(
            ref,
            (snapshot) => {
                const items = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));

                // Ordena los productos por fecha de creación (si existe)
                const ts = (x) =>
                    x?.seconds
                        ? x.seconds
                        : typeof x === 'number'
                        ? x
                        : 0;

                items.sort((a, b) => ts(b.createdAt) - ts(a.createdAt));

                setProducts(items);
                setLoading(false);
            },
            (error) => {
                console.log('❌ Error onSnapshot:', error);
                Alert.alert('Error', 'No se pudieron cargar los productos.');
                setLoading(false);
            }
        );

        // Limpia la suscripción cuando el componente se desmonta
        return () => unsubscribe();
    }, []);

    // 🗑️ Eliminar producto con confirmación
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
                            Alert.alert('✅ Eliminado', `${name} fue borrado.`);
                        } catch (error) {
                            console.log('❌ Error al eliminar:', error);
                            Alert.alert('Error', 'No se pudo eliminar el producto.');
                        }
                    },
                },
            ]
        );
    };

    // 🔎 Filtrar productos según búsqueda
    const filteredProducts = products.filter((p) =>
        (p.name || '').toLowerCase().includes(search.toLowerCase())
    );

    // 🎨 Renderizado de cada tarjeta de producto
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Imagen del producto */}
            <Image
                source={{
                    uri: item.imageUrl || 'https://via.placeholder.com/80',
                }}
                style={styles.image}
            />

            {/* Información principal */}
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>Cantidad: {item.quantity} u</Text>
                <Text>Precio: ${item.price} c/u</Text>
                {item.description ? <Text>Descripción: {item.description}</Text> : null}
            </View>

            {/* Botón de edición */}
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('EditProduct', { product: item })}
            >
                <FontAwesome name="pencil" size={20} color="#555" />
            </TouchableOpacity>

            {/* Botón de eliminación */}
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDelete(item.id, item.name)}
            >
                <FontAwesome name="trash" size={20} color="red" />
            </TouchableOpacity>
        </View>
    );

    // 🔄 Muestra loader mientras carga
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Cargando productos...</Text>
            </View>
        );
    }

    // 🖼️ Interfaz principal
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

            {/* Botón para ir a agregar producto */}
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
                ListEmptyComponent={<Text>No hay productos para mostrar.</Text>}
            />
        </View>
    );
}

// 🎨 Estilos
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
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
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
