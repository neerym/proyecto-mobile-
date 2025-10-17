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
  Animated 
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

  // Control del toast
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Configuración para login con Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "966224331213-mnvu2va2ogr0aul6c0pmkdpe816shi1t.apps.googleusercontent.com", 
    expoClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",   
    webClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",    
  });

  // Login con Google..Queda chequearlo despuess
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        const credential = GoogleAuthProvider.credential(authentication.idToken);
        signInWithCredential(auth, credential)
          .then(() => navigation.reset({ index: 0, routes: [{ name: 'Loading' }] }))
          .catch(() => showError("No se pudo iniciar sesión con Google."));
      }
    }
  }, [response]);

  // toast con mensaje de error
  const showError = (message) => {
    setToastMessage(message);
    setShowToast(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 3000);
    });
  };

  // Login normal con email y contraseña
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
      showError(errorMessage);
    }
  };

  // Envío de correo para restablecer contraseña
  const handleForgotPassword = async () => {
    if (!email) {
      showError("Por favor ingresa tu correo electrónico.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showError("Te enviamos un enlace para restablecer tu contraseña.");
    } catch (error) {
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
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          
          {/* Encabezado con logo */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Sana-mente Natural</Text>
            <Image source={require('../assets/logoblanco.png')} style={styles.logo} />
            
          </View>

          {/* Formulario principal */}
          <View style={styles.form}>
            <Text style={styles.title}>Iniciar sesión</Text>

            {/* Campo Email */}
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

            {/* Campo Contraseña */}
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
            <TouchableOpacity onPress={handleForgotPassword} style={{ width: "100%" }}>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón para ingresar */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            {/* Botón de login con Google (desactivado) */}
              <TouchableOpacity 
                style={styles.googleButtonDisabled}
                onPress={() => showError("Próximamente: inicio con Google")}
                activeOpacity={0.7}
              >
                <FontAwesome name="google" size={20} color="#999" />
                <Text style={styles.googleTextDisabled}>Ingresar con Google</Text>
              </TouchableOpacity>

            {/* Enlace para crear cuenta */}
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpText}>
                ¿No tenés cuenta? <Text style={{ color: '#789C3B', fontWeight: 'bold' }}>Registrate</Text>
              </Text>
            </TouchableOpacity>

            {/* Frase de la app y pie */}
            <Text style={styles.footer}>© 2025 Sana-mente Natural</Text> 
            <Text style={styles.footer}> Porque comer bien es la base de sentirse mejor</Text>
          </View>
        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    backgroundColor: '#789C3B',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 50,
  },
  headerText: {
  fontSize: 22,
  color: '#fff',
  fontWeight: 'bold',
  marginTop: 10,
  textAlign: 'center',
  textShadowColor: 'rgba(0, 0, 0, 0.4)',  
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
  letterSpacing: 1, 
},
  logo: { width: 180, height: 180 },
  form: {
    flex: 1,
    alignItems: 'center',
    marginTop: -75,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    paddingTop: 20, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5},
  title: { fontSize: 35, fontWeight: 'bold', color: '#103900', marginBottom: 30  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 25,
    width: '100%',
    height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 40 },
  forgotPassword: {
    color: '#789C3B',
    fontSize: 13,
    textAlign: "right",
    marginBottom: 30,
    marginTop: -15
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
  signUpText: { fontSize: 14, color: '#555', marginBottom: 20 },
  footer: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 10 },
  toast: {
    
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  toastText: { 
    color: '#fff', 
    fontWeight: '500', 
    textAlign: 'center' 
  },

  //  estilos botón Google
  googleButtonDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 25,
  },
  googleTextDisabled: {
    marginLeft: 10,
    fontSize: 16,
    color: '#777',
    fontWeight: 'bold'
  },
});
