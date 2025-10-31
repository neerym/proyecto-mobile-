import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, ScrollView, Platform, Animated, ImageBackground
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../src/config/firebaseConfig";
import GoogleIcon from "../components/GoogleIcon";

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  // Control del toast
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

WebBrowser.maybeCompleteAuthSession();  

// --- CONFIGURACIÓN GOOGLE ---
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true, 
});

const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",
  androidClientId: "966224331213-mnvu2va2ogr0aul6c0pmkdpe816shi1t.apps.googleusercontent.com",
  webClientId: "966224331213-g9pkfmt0jsv8aj5fclc79trs1hbuchaq.apps.googleusercontent.com",
  redirectUri,
  responseType: "id_token",
  scopes: ["profile", "email"],
});

// --- EFECTO DE LOGIN ---
useEffect(() => {
  if (response?.type === "success") {
    const { authentication } = response;
    if (authentication?.idToken) {
      const credential = GoogleAuthProvider.credential(authentication.idToken);
      signInWithCredential(auth, credential)
        .then(() =>
          navigation.reset({ index: 0, routes: [{ name: "Loading" }] })
        )
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
  // Presencia con trim
  if (!emailTrim || !passwordTrim) {
    showError("Por favor ingrese ambos campos.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrim)) {
    showError("Por favor, ingrese un correo válido.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, emailTrim, passwordTrim);
    navigation.reset({ index: 0, routes: [{ name: 'Loading' }] });
  } catch (error) {
    // evita enumeración de usuarios
    let errorMessage = "Credenciales inválidas. Por favor, verifique su correo y contraseña.";

    // Excepciones permitidas
    if (error.code === 'auth/network-request-failed') {
      errorMessage = "Error de conexión, por favor intenta más tarde.";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Demasiados intentos. Por favor, intenta más tarde.";
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
        } catch (error) {
    }
  

// Mostrar siempre el mismo mensaje
showError("Si tu cuenta existe, recibirás un enlace para restablecer tu contraseña. Revisá tu correo o la carpeta de spam.");
  };

  const emailTrim = email.trim();
  const passwordTrim = password.trim();
  const canSubmit = emailTrim.length > 0 && passwordTrim.length > 0;

  return (
            <ImageBackground
            source={require('../assets/fondoPistacho.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
              <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
          >
            <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.container}>

          {/* Encabezado con logo */}

          <View style={styles.header}>
            <Text style={styles.headerText}>Sana-mente Natural</Text>
            <Image source={require('../assets/logoblanco.png')} style={styles.logo} />
          </View>

          <View style={styles.formWrapper}>
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
                  name={showPassword ? "eye" : "eye-slash"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            

            {/* Recuperar contraseña */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={{ width: "100%" }}
              disabled={loadingReset} // desactiva mientras está cargando
            >
              <Text
                style={[
                  styles.forgotPassword,
                  loadingReset && { opacity: 0.5 }, //  gris temporal
                ]}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>


            {/* Botón para ingresar */}
            <TouchableOpacity 
              style={[styles.button, !canSubmit && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={!canSubmit}
            >
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>


            {/* Botón de login con Google
            <TouchableOpacity
              style={styles.googleButton}
              disabled={!request}
              onPress={() => promptAsync()}
              activeOpacity={0.8}
            >
              <GoogleIcon size={20} />
              <Text style={styles.googleText}>Ingresar con Google</Text>
            </TouchableOpacity> */}


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
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast flotante */}
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <FontAwesome name="exclamation-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
      </ImageBackground>
  );
}

// Estilos
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    justifyContent: Platform.OS === 'web' ? 'center' : 'center',
  },
  container: {
    minHeight: '100%',
    backgroundColor: "rgba(29, 53, 19, 0.55)",
    paddingTop: Platform.OS === 'web' ? 0 : 40,
    paddingBottom: Platform.OS === 'web' ? 0 : 40,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  logo: { width: 140, height: 140 },
  formWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  form: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    marginTop: -40,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    paddingTop: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: 'rgba(16, 57, 0, 1)', marginBottom: 20  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 48,
    width: '100%',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 40 },
  forgotPassword: {
    color: '#789C3B',
    fontSize: 13,
    textAlign: "right",
    marginBottom: 20,
    marginTop: -8
  },
  button: {
    backgroundColor: '#789C3B',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 18,
  },
  googleText: { marginLeft: 10, fontSize: 15, color: '#333' },
  signUpText: { fontSize: 14, color: '#555', marginBottom: 15 },
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

  buttonDisabled: {
  opacity: 0.5
},

});
