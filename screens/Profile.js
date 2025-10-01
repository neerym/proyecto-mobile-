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
  const user = auth.currentUser; // Usuario logueado

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

      // Actualizar nombre y avatar
      if (name || avatar) {
        await updateProfile(user, {
          displayName: name,
          photoURL: avatar || null,
        });
      }

      // Actualizar contraseña
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
      console.log("❌ Error al actualizar perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // 🔄 Spinner mientras se guarda o actualiza
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#789C3B" />
        <Text style={{ marginTop: 15, fontSize: 16, color: '#555' }}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <FontAwesome name="user-circle" size={100} color="#a78bfa" />
        )}
      </View>

      {/* Nombre */}
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <TextInput
        style={styles.input}
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
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome 
            name={showPassword ? "eye-slash" : "eye"} 
            size={20} 
            color="#555" 
          />
        </TouchableOpacity>
      </View>

      {/* Avatar URL */}
      <TextInput
        style={styles.input}
        placeholder="URL de tu foto de perfil"
        value={avatar}
        onChangeText={setAvatar}
      />

      {/* Botón editar perfil */}
      <TouchableOpacity style={styles.editButton} onPress={handleUpdateProfile}>
        <Text style={styles.editButtonText}>Guardar cambios</Text>
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f6fa'
  },
});
