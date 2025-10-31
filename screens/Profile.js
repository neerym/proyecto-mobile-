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
    ScrollView,
    KeyboardAvoidingView,
    Platform,
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
    const [showSecurity, setShowSecurity] = useState(false);
    const [avatar, setAvatar] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);

    // Modales
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalSuccess, setModalSuccess] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const showModal = (isSuccess, message) => {
        setModalSuccess(isSuccess);
        setModalMessage(message);
        setModalVisible(true);
    };

    const onlyText = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
    const validatePassword = (value) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);

    const pickImage = async (fromCamera = false) => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                showModal(false, 'Se necesita acceso a la cámara o galería.');
                return;
            }

            const result = fromCamera
                ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
                : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });

            if (!result.canceled) {
                setAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Error al seleccionar imagen:', error);
            showModal(false, 'No se pudo seleccionar la imagen.');
        }
    };

    const handleUpdateProfile = async () => {
        if (!name && !password && !avatar) {
            showModal(false, 'No hay cambios para guardar.');
            return;
        }

        if (name && !onlyText(name)) {
            showModal(false, 'El nombre solo puede contener letras y espacios.');
            return;
        }

        if (password && !validatePassword(password)) {
            showModal(false, 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.');
            return;
        }

        if (password && password !== confirmPassword) {
            showModal(false, 'Las contraseñas no coinciden.');
            return;
        }

        setConfirmVisible(true);
    };

    const confirmUpdate = async () => {
        try {
            setConfirmVisible(false);
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
            showModal(true, 'Perfil actualizado correctamente.');
        } catch (error) {
            setLoading(false);
            console.log('Error al actualizar perfil:', error);
            showModal(false, 'No se pudo actualizar el perfil.');
        }
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
        <ImageBackground source={require('../assets/fondoPistacho.jpg')} style={styles.backgroundImage}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
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

                        {/* SECCIÓN DE SEGURIDAD/contraseñas */}
                        <TouchableOpacity
                            style={styles.securityToggle}
                            onPress={() => setShowSecurity(!showSecurity)}
                        >
                            <FontAwesome name="lock" size={18} color="#fff" />
                            <Text style={styles.securityToggleText}>
                                {showSecurity ? 'Ocultar opciones de seguridad' : 'Mostrar opciones de seguridad'}
                            </Text>
                        </TouchableOpacity>

                        {showSecurity && (
                            <View style={styles.securitySection}>
                                <Text style={styles.securityLabel}>Nueva contraseña</Text>
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
                                        <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.securityLabel}>Confirmar nueva contraseña</Text>
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
                                        <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

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
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de confirmación */}
            <Modal visible={confirmVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: '#d3733bff' }]}>
                        <FontAwesome name="exclamation-circle" size={50} color="#fff" />
                        <Text style={styles.modalText}>¿Desea guardar los cambios en su perfil?</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#ad4343ff' }]}
                                onPress={confirmUpdate}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Sí, guardar</Text>
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
                    <View style={[styles.modalContainer, modalSuccess ? styles.modalSuccess : styles.modalError]}>
                        <FontAwesome
                            name={modalSuccess ? 'check-circle' : 'exclamation-circle'}
                            size={50}
                            color="#fff"
                        />
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 40,
        paddingHorizontal: 15,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 900,
        alignSelf: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 8,
    },
    overlay: {
        width: '100%',
        maxWidth: 600,
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(29, 53, 19, 0.7)',
        borderRadius: 15,
        marginBottom: 20,
    },
    avatarContainer: {
        marginTop: 10,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: '#fff',
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 6,
        gap: 12,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    iconText: { color: '#fff', marginLeft: 5 },
    label: {
        alignSelf: 'flex-start',
        color: '#fff',
        fontWeight: '600',
        marginBottom: 3,
        marginTop: 3,
        marginLeft: 5,
        fontSize: 12,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 9,
        marginBottom: 6,
        width: '100%',
        color: '#fff',
        fontSize: 14,
    },
    disabledInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6e6e6',
        borderRadius: 10,
        padding: 9,
        marginBottom: 6,
        width: '100%',
    },
    disabledText: { color: '#666', fontSize: 14 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 6,
        width: '100%',
        height: 42,
    },
    inputPassword: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 6,
    },
    saveButtonText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
    logoutButton: {
        borderColor: '#fff',
        borderWidth: 1.5,
        paddingVertical: 10,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#789C3B',
    },
    securityToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 10,
        marginTop: 15,
        marginBottom: 10,
        width: '100%',
    },
    securityToggleText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
    securitySection: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
        padding: 10,
        width: '100%',
        marginBottom: 15,
    },
    securityLabel: {
        color: '#fff',
        fontWeight: '500',
        marginBottom: 5,
        fontSize: 12,
    },
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
        color: '#534a4aff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
