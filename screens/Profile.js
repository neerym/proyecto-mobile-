import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    Alert, 
    ActivityIndicator 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';

export default function Profile({ navigation }) {
    const user = auth.currentUser;

    const [name, setName] = useState(user?.displayName || '');
    const [email] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [avatar, setAvatar] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        try {
            if (!name && !password && !avatar) {
                Alert.alert("Aviso", "No hay cambios para guardar");
                return;
            }

            setLoading(true);

            if (name || avatar) {
                await updateProfile(user, {
                    displayName: name,
                    photoURL: avatar || null,
                });
            }

            if (password) {
                if (password.length < 6) {
                    Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
                    setLoading(false);
                    return;
                }
                await updatePassword(user, password);
            }

            setLoading(false);
            Alert.alert("Éxito", "Perfil actualizado correctamente");
        } catch (error) {
            setLoading(false);
            console.log("Error al actualizar perfil:", error);
            Alert.alert("Error", "No se pudo actualizar el perfil");
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
        <View style={styles.container}>
            {/*usuario */}
            <View style={styles.avatarContainer}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                    <FontAwesome name="user-circle" size={100} color="#fff" />
                )}
            </View>

            {/* Nombre */}
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#ddd"
            />

            {/* Email */}
            <TextInput
                style={[styles.input, { backgroundColor: '#e6e6e6', color: '#666' }]}
                value={email}
                editable={false}
            />

            {/* Contraseña */}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Nueva contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#ddd"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <FontAwesome 
                        name={showPassword ? "eye-slash" : "eye"} 
                        size={20} 
                        color="#fff" 
                    />
                </TouchableOpacity>
            </View>

            {/* URL avatar */}
            <TextInput
                style={styles.input}
                placeholder="URL de tu foto de perfil"
                value={avatar}
                onChangeText={setAvatar}
                placeholderTextColor="#ddd"
            />

            {/* Guardar cambios */}
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </TouchableOpacity>

            {/* Volver a Home */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.backButtonText}>Volver al inicio</Text>
            </TouchableOpacity>

            {/* Cerrar sesión */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
        backgroundColor: '#789C3B',
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#fff',
    },
    input: {
        backgroundColor: '#90B25D',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        width: '100%',
        color: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#2e7d32',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    logoutButton: {
        borderColor: '#fff',
        borderWidth: 1.5,
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#789C3B'
    },
});
