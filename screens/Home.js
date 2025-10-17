import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert,
  ImageBackground
} from 'react-native';

// Importamos signOut de Firebase para cerrar sesión
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

// 🏠 Pantalla principal de inicio
export default function Home({ navigation }) {

  // 🔑 Función para cerrar sesión del usuario
  const handleLogout = async () => {
    try {
      await signOut(auth);  // Firebase cierra sesión
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      
      // Redirige al login y resetea la navegación
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  // 🖼️ Renderizado de la pantalla Home
  return (
    <ImageBackground
      source={require('../assets/fondoPistacho.jpg')}
      style={styles.background}
      resizeMode="cover" >
    <View style={styles.container}>
      {/* Logo de la app */}
      <Image source={require('../assets/logoblanco.png')} style={styles.logo} />

      {/* Mensaje de bienvenida */}
      <Text style={styles.title}>Bienvenido a Sana-mente Natural</Text>
      <Text style={styles.subtitle}>Elige una opción para continuar</Text>

      {/* Botón para ver perfil */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Ver Perfil</Text>
      </TouchableOpacity>

      {/* Botón para ver productos */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Items')}
      >
        <Text style={styles.buttonText}>Ver Productos</Text>
      </TouchableOpacity>

      {/* Botón para cerrar sesión */}
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
    </ImageBackground>
  );
}

// 🎨 Estilos de la pantalla Home
const styles = StyleSheet.create({
  // 🔹 Fondo con imagen
  background: {
    flex: 1,
    justifyContent: 'center',
  },

  // 🔹 Contenedor principal
  container: {
    flex: 1,
    justifyContent: 'center', // centra contenido verticalmente
    alignItems: 'center',     // centra contenido horizontalmente
    padding: 20,
    
  },

  // 🔹 Logo
  logo: {
    width: 120,
    height: 180,
    marginBottom: 20,
  },

  // 🔹 Títulos
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#103900',
    marginBottom: 5,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)' 
  },
  subtitle: {
    fontSize: 16,
    color: '#103900',
    marginBottom: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)' 
  },

  // 🔹 Botones
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#789C3B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#789C3B',
  },
  logoutText: {
    color: '#789C3B',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 🔹 Opcional: oscurecer un poco la imagen
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    ...StyleSheet.absoluteFillObject,
  },
});

