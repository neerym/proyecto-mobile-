import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    Alert, 
    ActivityIndicator,
    ImageBackground
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

    // Validaciones
    const onlyText = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
    const validatePassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);

    // Seleccionar imagen (galería o cámara)
    const pickImage = async (fromCamera = false) => {
        try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permiso requerido", "Se necesita acceso a la cámara o galería.");
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
        Alert.alert("Error", "No se pudo seleccionar la imagen.");
        }
    };

    const handleUpdateProfile = async () => {
        if (!name && !password && !avatar) {
        Alert.alert("Aviso", "No hay cambios para guardar");
        return;
        }

        if (name && !onlyText(name)) {
        Alert.alert("Error", "El nombre solo puede contener letras y espacios.");
        return;
        }

        if (password && !validatePassword(password)) {
        Alert.alert(
            "Contraseña no válida",
            "Debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número."
        );
        return;
        }

        if (password && password !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden.");
        return;
        }

        Alert.alert(
        "Confirmar cambios",
        "¿Desea guardar los cambios en su perfil?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
            text: "Guardar", 
            onPress: async () => {
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
                Alert.alert("Éxito", "Perfil actualizado correctamente");
                } catch (error) {
                setLoading(false);
                console.log("Error al actualizar perfil:", error);
                Alert.alert("Error", "No se pudo actualizar el perfil.");
                }
            }
            }
        ]
        );
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

            {/* Email (solo lectura) */}
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.disabledInput}>
            <FontAwesome name="envelope" size={18} color="#666" style={{ marginRight: 8 }} />
            <Text style={styles.disabledText}>{email}</Text>
            </View>

            {/* Contraseñas */}
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
            <Text style={styles.backButtonText}>Volver al inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
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
        width: '100%',
    },
    overlay: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        padding: 25,
        backgroundColor: 'rgba(29, 53, 19, 0.65)',
    },
    avatarContainer: {
        marginTop: 40,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: '#fff',
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 15,
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
        marginBottom: 6,
        marginLeft: 5,
        fontSize: 15,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        width: '100%',
        color: '#fff',
        fontSize: 15,
    },
    disabledInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6e6e6',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        width: '100%',
    },
    disabledText: { color: '#666', fontSize: 15 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 15,
        width: '100%',
        height: 50,
    },
    inputPassword: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButtonText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },
    backButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    logoutButton: {
        borderColor: '#fff',
        borderWidth: 1.5,
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#789C3B'
    },
});
