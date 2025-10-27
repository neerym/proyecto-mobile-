import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  Animated,
  ImageBackground
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth } from '../src/config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Configuración de Google Sign-In con credenciales de Firebase
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "966224331213-mnvu2va2ogr0aul6c0pmkdpe816shi1t.apps.googleusercontent.com", 
    expoClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",   
    webClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",    
  });

  // 🟢 Manejo de respuesta de Google Sign-In
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        const credential = GoogleAuthProvider.credential(authentication.idToken);
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
      showError("Por favor ingrese ambos campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("El formato del correo electrónico no es válido.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
          errorMessage = "No existe una cuenta asociada a este correo electrónico";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      showError(errorMessage);
    }
  };

  // 🔄 Recuperar contraseña
  const handleForgotPassword = async () => {
    if (!email) {
      showError("Por favor ingresa tu correo electrónico.");
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
      showError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          
          {/* Encabezado con logo */}
          
          <View style={styles.header}>
            <Text style={styles.headerText}>Sana-mente Natural</Text>
            <Image source={require('../assets/logoblanco.png')} style={styles.logo} />
          </View>

          {/* Formulario de login */}
          <View style={styles.form}>
            <Text style={styles.title}>Iniciar sesión</Text>

            {/* Campo de Email */}
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={[
                  styles.input,
                  email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && { color: 'red' },
                ]}
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
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

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
                ¿No tenés cuenta? <Text style={{ color: '#789C3B', fontWeight: 'bold' }}>Registrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </ImageBackground>
      

      {/* Toast flotante */}
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <FontAwesome name="exclamation-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
    
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: { width: 100, height: 100 },
  form: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    marginTop: -30,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'stretch'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', marginBottom: 20 },
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
    color: '#789C3B',
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#789C3B',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 25,
  },
  googleText: { marginLeft: 10, fontSize: 16, color: '#333' },
  signUpText: { fontSize: 14, color: '#555' },
});
