import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    StyleSheet,
    Image,
    Alert
    } from 'react-native';
    import { FontAwesome } from '@expo/vector-icons';
    import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
    import { db } from "../src/config/firebaseConfig";

    export default function Items({ navigation }) {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "productos"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setProducts(items);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = (id, name) => {
        Alert.alert(
        "Eliminar producto",
        `¿Seguro que deseas eliminar "${name}"?`,
        [
            { text: "Cancelar", style: "cancel" },
            { 
            text: "Eliminar", 
            style: "destructive", 
            onPress: async () => {
                try {
                await deleteDoc(doc(db, "productos", id));
                Alert.alert("✅ Eliminado", `${name} fue borrado.`);
                } catch (error) {
                console.log("❌ Error al eliminar:", error);
                Alert.alert("Error", "No se pudo eliminar el producto.");
                }
            } 
            }
        ]
        );
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={styles.card}>
        {/* Imagen */}
        <Image 
            source={{ uri: item.imageUrl || "https://via.placeholder.com/80" }} 
            style={styles.image} 
        />

        {/* Info */}
        <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Cantidad: {item.quantity} u</Text>
            <Text>Precio: ${item.price} c/u</Text>
            <Text>Descripción: {item.description}</Text>
        </View>

        {/* Botones acción */}
        <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate("EditProduct", { product: item })}
        >
            <FontAwesome name="pencil" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => handleDelete(item.id, item.name)}
        >
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
