import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Image 
    } from 'react-native';
    import { FontAwesome } from '@expo/vector-icons';
    import { auth } from '../src/config/firebaseConfig';
    import { signOut, updatePassword } from 'firebase/auth';

    export default function Profile({ navigation }) {
    const user = auth.currentUser; // Usuario logueado
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdateProfile = async () => {
        try {
        if (password) {
            await updatePassword(user, password);
            alert('Contraseña actualizada con éxito');
        } else {
            alert('No hay cambios para guardar (solo contraseña editable por ahora)');
        }
        } catch (error) {
        console.log(error);
        alert('Error al actualizar perfil');
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={100} color="#a78bfa" />
        </View>

        {/* Nombre */}
        <Text style={styles.name}>{user?.displayName || 'Usuario'}</Text>

        {/* Email */}
        <TextInput
            style={styles.input}
            value={email}
            editable={false} // el email no lo editamos en Firebase desde acá
        />

        {/* Contraseña */}
        <View style={styles.passwordContainer}>
            <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome 
                name={showPassword ? "eye-slash" : "eye"} 
                size={20} 
                color="#555" 
            />
            </TouchableOpacity>
        </View>

        {/* Botón editar perfil */}
        <TouchableOpacity style={styles.editButton} onPress={handleUpdateProfile}>
            <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f6fa',
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        width: '100%',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    editButton: {
        backgroundColor: '#789C3B',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    logoutButton: {
        borderColor: '#789C3B',
        borderWidth: 1,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#789C3B',
        fontWeight: 'bold',
    },
});
