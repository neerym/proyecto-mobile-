import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Firebase: login con email/contraseña, reset password y login con Google
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth } from '../src/config/firebaseConfig';

// Necesario para completar sesión con Google en Expo
WebBrowser.maybeCompleteAuthSession();

// 🔑 Pantalla de Login
export default function Login({ navigation }) {
  // Estados para email, password y visibilidad de contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Configuración de Google Sign-In con credenciales de Firebase
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "966224331213-mnvu2va2ogr0aul6c0pmkdpe816shi1t.apps.googleusercontent.com", 
    iosClientId: "TU_IOS_CLIENT_ID.apps.googleusercontent.com", 
    expoClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",   
    webClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",    
  });

  // 🟢 Manejo de respuesta de Google Sign-In
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        const credential = GoogleAuthProvider.credential(authentication.idToken);
        
        // Autenticación con Firebase usando credencial de Google
        signInWithCredential(auth, credential)
          .then(() => {
            Alert.alert("✅ Bienvenido", "Has iniciado sesión con Google");
            navigation.reset({ index: 0, routes: [{ name: 'Loading' }] });
          })
          .catch((error) => {
            console.log("❌ Error credencial Google:", error);
            Alert.alert("Error", "No se pudo iniciar sesión con Google.");
          });
      }
    }
  }, [response]);

  // 📩 Login con email y password
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Loading' }] });
    } catch (error) {
      console.log("❌ Error Firebase:", error);

      // Manejo de errores más descriptivo
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  // 🔄 Recuperar contraseña
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("✅ Revisa tu correo", "Te enviamos un enlace para restablecer tu contraseña.");
    } catch (error) {
      console.log("❌ Error reset password:", error);
      let errorMessage = "No se pudo enviar el email de recuperación.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No existe un usuario con ese correo.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El correo ingresado no es válido.";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  // 🖼️ Interfaz de usuario del Login
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          
          {/* Header con logo */}
          <View style={styles.header}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </View>

          {/* Formulario de login */}
          <View style={styles.form}>
            <Text style={styles.title}>Iniciar sesión</Text>

            {/* Campo de Email */}
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Campo de Contraseña con toggle de visibilidad */}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome 
                  name={showPassword ? "eye-slash" : "eye"} 
                  size={20} 
                  color="#777" 
                />
              </TouchableOpacity>
            </View>

            {/* Recuperar contraseña */}
            <View style={{ width: '100%' }}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            </View>

            {/* Botón de login normal */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            {/* Botón de login con Google */}
            <TouchableOpacity 
              style={[styles.googleButton, { opacity: request ? 1 : 0.5 }]} 
              disabled={!request}
              onPress={() => promptAsync()}
            >
              <FontAwesome name="google" size={20} color="#db4437" />
              <Text style={styles.googleText}>Ingresar con Google</Text>
            </TouchableOpacity>

            {/* Link para crear cuenta */}
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpText}>
                ¿No tienes una cuenta? <Text style={{ color: '#789C3B', fontWeight: 'bold' }}>Crear cuenta</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 🎨 Estilos de la pantalla Login
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    backgroundColor: '#789C3B',
    width: '100%',
    alignItems: 'center',
    paddingVertical:50,
  },
  logo: { width: 180, height: 180 },
  form: {
    flex: 1,
    alignItems: 'center',
    marginTop: -75,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    paddingTop: 20, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  title: { fontSize: 35, fontWeight: 'bold', color: '#103900', marginBottom: 30 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
    height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 40 },
  forgotPassword: {
    width: '100%',
    alignSelf: 'flex-end',
    color: '#789c3bff',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 20,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#789C3B',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  googleText: { marginLeft: 10, fontSize: 16, color: '#333' },
  signUpText: { fontSize: 14, color: '#555' },
});
