import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    ActivityIndicator,
    ImageBackground,
    Modal
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';

export default function Profile({ navigation }) {
    const user = auth.currentUser;

    const [name, setName] = useState(user?.displayName || '');
    const [email] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [avatar, setAvatar] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);

    // Estados para el modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('info'); // info | error | success | confirm
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);

    // Validaciones
    const onlyText = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
    const validatePassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);

    const showModal = (type, message, onConfirm = null) => {
        setModalType(type);
        setModalMessage(message);
        setModalAction(() => onConfirm);
        setModalVisible(true);
    };

    const pickImage = async (fromCamera = false) => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                showModal("error", "Se necesita acceso a la cámara o galería.");
                return;
            }

            const result = fromCamera
                ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
                : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });

            if (!result.canceled) {
                setAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.log("Error al seleccionar imagen:", error);
            showModal("error", "No se pudo seleccionar la imagen.");
        }
    };

    const handleUpdateProfile = async () => {
        if (!name && !password && !avatar) {
            showModal("info", "No hay cambios para guardar");
            return;
        }

        if (name && !onlyText(name)) {
            showModal("error", "El nombre solo puede contener letras y espacios.");
            return;
        }

        if (password && !validatePassword(password)) {
            showModal("error", "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.");
            return;
        }

        if (password && password !== confirmPassword) {
            showModal("error", "Las contraseñas no coinciden.");
            return;
        }

        showModal("confirm", "¿Desea guardar los cambios en su perfil?", async () => {
            try {
                setLoading(true);

                if (name || avatar) {
                    await updateProfile(user, {
                        displayName: name,
                        photoURL: avatar || null,
                    });
                }

                if (password) {
                    await updatePassword(user, password);
                }

                setLoading(false);
                showModal("success", "Perfil actualizado correctamente");
            } catch (error) {
                setLoading(false);
                console.log("Error al actualizar perfil:", error);
                showModal("error", "No se pudo actualizar el perfil.");
            }
        });
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ marginTop: 15, fontSize: 16, color: '#fff' }}>
                    Cargando perfil...
                </Text>
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('../assets/fondoPistacho.jpg')}
            style={styles.backgroundImage}
        >
            <View style={styles.overlay}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <FontAwesome name="user-circle" size={100} color="#fff" />
                    )}

                    <Text style={[styles.label, { alignSelf: 'center', textAlign: 'center' }]}>
                        Editar foto de perfil
                    </Text>

                    <View style={styles.photoButtons}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(false)}>
                            <FontAwesome name="image" size={20} color="#fff" />
                            <Text style={styles.iconText}>Galería</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(true)}>
                            <FontAwesome name="camera" size={20} color="#fff" />
                            <Text style={styles.iconText}>Cámara</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Nombre */}
                <Text style={styles.label}>Usuario</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#ddd"
                />

                {/* Email */}
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={styles.disabledInput}>
                    <FontAwesome name="envelope" size={18} color="#666" style={{ marginRight: 8 }} />
                    <Text style={styles.disabledText}>{email}</Text>
                </View>

                {/* Contraseña */}
                <Text style={styles.label}>¿Querés cambiar tu contraseña?</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Nueva contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#ddd"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#ddd"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Botones */}
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.backButtonText}>Volver al Panel Principal</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>

            {/* Modal*/}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox,
                        modalType === "error" ? { borderColor: "#ff5252" } :
                        modalType === "success" ? { borderColor: "#4caf50" } :
                        { borderColor: "#285218ff"}
                    ]}>
                        <FontAwesome 
                            name={
                                modalType === "error" ? "times-circle" :
                                modalType === "success" ? "check-circle" :
                                modalType === "info" ? "info-circle" :
                                "question-circle"
                            } 
                            size={50} 
                            color={
                                modalType === "error" ? "#ff5252" :
                                modalType === "success" ? "#4caf50" :
                                "#285218ff"
                            } 
                            style={{ marginBottom: 10 }}
                        />
                        <Text style={styles.modalText}>{modalMessage}</Text>

                        <View style={styles.modalButtons}>
                            {modalType === "confirm" ? (
                                <>
                                    <TouchableOpacity 
                                        style={[styles.modalBtn, { backgroundColor: '#285218ff' }]}
                                        onPress={() => {
                                            setModalVisible(false);
                                            modalAction && modalAction();
                                        }}
                                    >
                                        <Text style={styles.modalBtnTextConf}>Confirmar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.modalBtn, { backgroundColor: '#ffffffff' }]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.modalBtnText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity 
                                    style={[styles.modalBtn, { backgroundColor: '#2e7d32' }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalBtnText}>Aceptar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

// Estilos
const styles = StyleSheet.create({
    backgroundImage: { 
        flex: 1, 
        resizeMode: 'cover', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%' 
    },
    overlay: { 
        flex: 1, 
        width: '100%', 
        alignItems: 'center', 
        padding: 25, 
        backgroundColor: 'rgba(29, 53, 19, 0.65)' 
    },
    avatarContainer: { 
        marginTop: 40, 
        marginBottom: 15, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    avatar: { 
        width: 110, 
        height: 110, 
        borderRadius: 55, 
        borderWidth: 2, 
        borderColor: '#fff' 
    },
    photoButtons: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 10, 
        gap: 15 
    },
    iconButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 10 
    },
    iconText: { 
        color: '#fff', 
        marginLeft: 5 
    },
    label: { 
        alignSelf: 'flex-start', 
        color: '#fff', 
        fontWeight: '600', 
        marginBottom: 6, 
        marginLeft: 5, 
        fontSize: 15 
    },
    input: { 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        borderRadius: 10, 
        padding: 12, 
        marginBottom: 15, 
        width: '100%', 
        color: '#fff', 
        fontSize: 15 
    },
    disabledInput: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#e6e6e6', 
        borderRadius: 10, 
        padding: 12, 
        marginBottom: 15, 
        width: '100%' 
    },
    disabledText: { 
        color: '#666', 
        fontSize: 15 
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        borderRadius: 10, 
        paddingHorizontal: 12, 
        marginBottom: 15, 
        width: '100%', 
        height: 50 
    },
    inputPassword: { 
        flex: 1, 
        color: '#fff', 
        fontSize: 15 
    },
    saveButton: { 
        backgroundColor: '#fff', 
        paddingVertical: 15, 
        borderRadius: 10, 
        width: '100%', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    saveButtonText: { 
        color: '#789C3B',
        fontWeight: 'bold', 
        fontSize: 16 
    },
    backButton: { 
        backgroundColor: '#789C3B',
        paddingVertical: 15, 
        borderRadius: 10, 
        width: '100%', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    backButtonText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    logoutButton: { 
        borderColor: '#fff', 
        borderWidth: 1.5, 
        paddingVertical: 15, 
        borderRadius: 10, 
        width: '100%', 
        alignItems: 'center' 
    },
    logoutButtonText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#789C3B' 
    },

    // MODAL BONITO
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25, 
        width: '80%', 
        alignItems: 'center',
        borderWidth: 2,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        color:' #103900',
        marginBottom: 20
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderColor: '#103900ff',
        borderWidth: 0.5,
    },
    modalBtnText: {
        color: '#103900ff',
        fontWeight: 'bold',
        fontSize: 15
    },
    modalBtnTextConf: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15
    },
});


