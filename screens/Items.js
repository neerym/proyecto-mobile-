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
    ImageBackground,
    } from 'react-native';
    import { FontAwesome } from '@expo/vector-icons';
    import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
    import { db } from '../src/config/firebaseConfig';

    export default function Items({ navigation }) {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('Todos');

    useEffect(() => {
        const ref = collection(db, 'productos');
        const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
            const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            }));

            const ts = (x) =>
            x?.seconds ? x.seconds : typeof x === 'number' ? x : 0;
            items.sort((a, b) => ts(b.createdAt) - ts(a.createdAt));

            setProducts(items);
            setLoading(false);
        },
        (error) => {
            console.log('Error onSnapshot:', error);
            Alert.alert('Error', 'No se pudieron cargar los productos.');
            setLoading(false);
        }
        );
        return () => unsubscribe();
    }, []);

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
                } catch (error) {
                console.log('Error al eliminar:', error);
                Alert.alert('Error', 'No se pudo eliminar el producto.');
                }
            },
            },
        ]
        );
    };

    const filteredProducts = products.filter((p) => {
        const matchName = (p.name || '')
        .toLowerCase()
        .includes(search.toLowerCase());
        const matchType =
        selectedType === 'Todos' ||
        (p.tipo && p.tipo.toLowerCase() === selectedType.toLowerCase());
        return matchName && matchType;
    });

    const renderItem = ({ item }) => (
        <View style={styles.card}>
        <Image
            source={
            item.imageUrl
                ? { uri: String(item.imageUrl) }
                : require('../assets/default.png')
            }
            style={styles.image}
        />
        <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.tipo && <Text style={styles.type}>Tipo: {item.tipo}</Text>}
            <Text style={styles.detail}>Cantidad: {item.quantity} u</Text>
            <Text style={styles.detail}>Precio: ${item.price} c/u</Text>
            {item.description ? (
            <Text style={styles.detail}>Descripción: {item.description}</Text>
            ) : null}
        </View>
        <View style={styles.actions}>
            <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('EditProduct', { product: item })}
            >
            <FontAwesome name="pencil" size={20} color="#2e7d32" />
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDelete(item.id, item.name)}
            >
            <FontAwesome name="trash" size={20} color="red" />
            </TouchableOpacity>
        </View>
        </View>
    );

    if (loading) {
        return (
        <View
            style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
            ]}
        >
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={{ marginTop: 10, color: '#555' }}>
            Cargando productos...
            </Text>
        </View>
        );
    }

    return (
        <ImageBackground
        source={require('../assets/fondoPistacho.jpg')}
        style={styles.background}
        >
        <View style={styles.overlay}>
            <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Home')}
            >
                <FontAwesome name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={18} color="#555" />
                <TextInput
                style={styles.searchInput}
                placeholder="Buscar producto..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#888"
                />
            </View>

            {/* Filtro por tipo */}
            <View style={styles.filterContainer}>
                {['Todos', 'Alimento', 'Bebida', 'Otros'].map((tipo) => (
                <TouchableOpacity
                    key={tipo}
                    style={[
                    styles.filterButton,
                    selectedType === tipo && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedType(tipo)}
                >
                    <Text
                    style={[
                        styles.filterText,
                        selectedType === tipo && styles.filterTextActive,
                    ]}
                    >
                    {tipo}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <FontAwesome name="plus" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Agregar producto</Text>
            </TouchableOpacity>
            </View>

            <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
                <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                No hay productos para mostrar.
                </Text>
            }
            />
        </View>
        </ImageBackground>
    );
    }

    const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: 'cover' },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(29, 53, 19, 0.6)',
        paddingTop: 60,
        paddingHorizontal: 15,
    },
    header: { marginBottom: 20 },
    backButton: { alignSelf: 'flex-start', marginBottom: 10 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        marginLeft: 5,
        color: '#333',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 5,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    filterButtonActive: {
        backgroundColor: '#fff',
    },
    filterText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    filterTextActive: {
        color: '#2e7d32',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#789C3B',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 5,
        borderColor: '#fff',
        borderWidth: 1,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 15,
    },
    card: {
        backgroundColor: '#e6f7ca',
        borderColor: '#789C3B',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
    },
    image: { width: 75, height: 75, borderRadius: 10, marginRight: 10 },
    name: { fontSize: 17, fontWeight: 'bold', color: '#2e7d32' },
    type: { color: '#555', fontStyle: 'italic', marginBottom: 3 },
    detail: { color: '#333', fontSize: 14 },
    actions: {
        flexDirection: 'column',
        marginLeft: 8,
        justifyContent: 'space-between',
        height: 70,
    },
    iconButton: { alignSelf: 'center' },
});
