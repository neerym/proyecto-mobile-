import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    ActivityIndicator,
    ImageBackground,
    Platform,
    Modal,
    ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';

export default function Items({ navigation }) {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('Todos');

    // Modales
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalSuccess, setModalSuccess] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [deleteData, setDeleteData] = useState({ id: '', name: '' });
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const showModal = (isSuccess, message) => {
        setModalSuccess(isSuccess);
        setModalMessage(message);
        setModalVisible(true);
    };

    useEffect(() => {
        const ref = collection(db, 'productos');
        const unsubscribe = onSnapshot(
            ref,
            (snapshot) => {
                const items = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                const ts = (x) => x?.seconds ? x.seconds : typeof x === 'number' ? x : 0;
                items.sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
                setProducts(items);
                setLoading(false);
            },
            (error) => {
                console.log('Error onSnapshot:', error);
                showModal(false, 'No se pudieron cargar los productos.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const confirmDelete = (id, name) => {
        setDeleteData({ id, name });
        setConfirmVisible(true);
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'productos', deleteData.id));
            setConfirmVisible(false);
            showModal(true, `${deleteData.name} fue eliminado correctamente.`);
        } catch (error) {
            console.log('Error al eliminar:', error);
            showModal(false, 'No se pudo eliminar el producto.');
        }
    };

    const showProductDetail = (product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };

    const filteredProducts = products.filter((p) => {
        const matchName = (p.name || '').toLowerCase().includes(search.toLowerCase());
        const matchType =
            selectedType === 'Todos' ||
            (p.tipo && p.tipo.toLowerCase() === selectedType.toLowerCase());
        return matchName && matchType;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => showProductDetail(item)}
            activeOpacity={0.8}
        >
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
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('EditProduct', { product: item });
                    }}
                >
                    <FontAwesome name="pencil" size={20} color="#2e7d32" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        confirmDelete(item.id, item.name);
                    }}
                >
                    <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={{ marginTop: 10, color: '#555' }}>Cargando productos...</Text>
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('../assets/fondoPistacho.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                        <FontAwesome name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Productos</Text>

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
                    style={[
                        { width: '100%', maxWidth: 800 },
                        Platform.OS === 'web' && { maxHeight: '60vh', overflow: 'auto' }
                    ]}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                            No hay productos para mostrar.
                        </Text>
                    }
                />
            </View>

            {/* Modal de confirmación */}
            <Modal visible={confirmVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: '#fc8b4aff' }]}>
                        <FontAwesome name="exclamation-circle" size={50} color="#fff" />
                        <Text style={styles.modalText}>
                            ¿Seguro que deseas eliminar "{deleteData.name}"?
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#ad4343ff' }]}
                                onPress={handleDelete}
                            >
                                <Text style={[styles.modalButtonText, { color: '#ffffffff' }]}>
                                    Eliminar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#fff' }]}
                                onPress={() => setConfirmVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de resultado */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContainer,
                            modalSuccess ? styles.modalSuccess : styles.modalError,
                        ]}
                    >
                        <FontAwesome
                            name={modalSuccess ? 'check-circle' : 'exclamation-circle'}
                            size={50}
                            color="#fff"
                        />
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de detalle del producto */}
            <Modal visible={detailVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.detailModalContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.detailHeader}>
                                <Text style={styles.detailTitle}>Detalle del Producto</Text>
                                <TouchableOpacity onPress={() => setDetailVisible(false)}>
                                    <FontAwesome name="times" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {selectedProduct && (
                                <View style={styles.detailContent}>
                                    <Image
                                        source={
                                            selectedProduct.imageUrl
                                                ? { uri: String(selectedProduct.imageUrl) }
                                                : require('../assets/default.png')
                                        }
                                        style={styles.detailImage}
                                    />

                                    <View style={styles.detailInfoSection}>
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="tag" size={18} color="#2e7d32" />
                                            <Text style={styles.detailLabel}>Nombre:</Text>
                                        </View>
                                        <Text style={styles.detailValue}>{selectedProduct.name}</Text>
                                    </View>

                                    <View style={styles.detailInfoSection}>
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="list" size={18} color="#2e7d32" />
                                            <Text style={styles.detailLabel}>Tipo:</Text>
                                        </View>
                                        <Text style={styles.detailValue}>{selectedProduct.tipo || 'No especificado'}</Text>
                                    </View>

                                    <View style={styles.detailInfoSection}>
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="cubes" size={18} color="#2e7d32" />
                                            <Text style={styles.detailLabel}>Cantidad:</Text>
                                        </View>
                                        <Text style={styles.detailValue}>{selectedProduct.quantity} unidades</Text>
                                    </View>

                                    <View style={styles.detailInfoSection}>
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="dollar" size={18} color="#2e7d32" />
                                            <Text style={styles.detailLabel}>Precio:</Text>
                                        </View>
                                        <Text style={styles.detailValue}>${selectedProduct.price} c/u</Text>
                                    </View>

                                    {selectedProduct.description && (
                                        <View style={styles.detailInfoSection}>
                                            <View style={styles.detailRow}>
                                                <FontAwesome name="align-left" size={18} color="#2e7d32" />
                                                <Text style={styles.detailLabel}>Descripción:</Text>
                                            </View>
                                            <Text style={styles.detailValue}>{selectedProduct.description}</Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.detailCloseButton}
                                        onPress={() => setDetailVisible(false)}
                                    >
                                        <Text style={styles.detailCloseButtonText}>Cerrar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(29, 53, 19, 0.7)',
        paddingTop: Platform.OS === 'web' ? 40 : 60,
        paddingHorizontal: Platform.OS === 'web' ? 30 : 15,
        alignItems: 'center',
    },
    header: {
        marginBottom: Platform.OS === 'web' ? 25 : 20,
        width: '100%',
        maxWidth: 900,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 8,
    },
    title: {
        fontSize: Platform.OS === 'web' ? 32 : 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
        height: Platform.OS === 'web' ? 50 : 45,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        marginLeft: 8,
        color: '#333',
        fontSize: Platform.OS === 'web' ? 15 : 14,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 0,
        gap: 10,
    },
    filterButton: {
        paddingVertical: Platform.OS === 'web' ? 10 : 8,
        paddingHorizontal: Platform.OS === 'web' ? 20 : 15,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    filterButtonActive: {
        backgroundColor: '#fff',
    },
    filterText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Platform.OS === 'web' ? 14 : 13,
    },
    filterTextActive: {
        color: '#2e7d32',
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#789C3B',
        paddingVertical: Platform.OS === 'web' ? 14 : 12,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 8,
        borderColor: '#fff',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: Platform.OS === 'web' ? 16 : 15,
    },
    card: {
        backgroundColor: '#e6f7ca',
        borderColor: '#789C3B',
        borderWidth: 1,
        padding: Platform.OS === 'web' ? 18 : 15,
        borderRadius: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
    },
    image: {
        width: Platform.OS === 'web' ? 85 : 75,
        height: Platform.OS === 'web' ? 85 : 75,
        borderRadius: 12,
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#789C3B',
    },
    name: {
        fontSize: Platform.OS === 'web' ? 18 : 17,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
    },
    type: {
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 5,
        fontSize: Platform.OS === 'web' ? 14 : 13,
    },
    detail: {
        color: '#333',
        fontSize: Platform.OS === 'web' ? 15 : 14,
        marginBottom: 2,
    },
    actions: {
        flexDirection: 'column',
        marginLeft: 12,
        justifyContent: 'space-around',
        height: Platform.OS === 'web' ? 85 : 75,
    },
    iconButton: {
        alignSelf: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    // Modales
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        maxWidth: 400,
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 10,
    },
    modalSuccess: { backgroundColor: '#4CAF50' },
    modalError: { backgroundColor: '#d9534f' },
    modalText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 15,
        fontWeight: '500',
    },
    modalButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 10,
    },
    modalButtonText: {
        color: '#554444ff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    // Modal de detalle
    detailModalContainer: {
        width: '90%',
        maxWidth: 500,
        maxHeight: '90%',
        backgroundColor: '#e6f7ca',
        borderRadius: 18,
        padding: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        borderWidth: 2,
        borderColor: '#789C3B',
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: '#789C3B',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    detailTitle: {
        fontSize: Platform.OS === 'web' ? 20 : 18,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    detailContent: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
    },
    detailImage: {
        width: Platform.OS === 'web' ? 140 : 120,
        height: Platform.OS === 'web' ? 140 : 120,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#789C3B',
        backgroundColor: '#fff',
    },
    detailInfoSection: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#789C3B',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: Platform.OS === 'web' ? 13 : 12,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginLeft: 8,
    },
    detailValue: {
        fontSize: Platform.OS === 'web' ? 14 : 13,
        color: '#333',
        marginLeft: 22,
        lineHeight: 18,
    },
    detailCloseButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 10,
        paddingHorizontal: 35,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#fff',
    },
    detailCloseButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Platform.OS === 'web' ? 14 : 13,
        textTransform: 'uppercase',
    },
});
