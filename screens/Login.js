import React, { useState } from 'react';
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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleGoogleLogin = async () => {
    Alert.alert("Google Login", "Aquí se conectará Firebase con Google.");
  };

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

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.title}>Iniciar sesión</Text>

            {/* Email */}
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

            {/* Password */}
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

            {/* Forgot password */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón ingresar */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            {/* Botón ingresar con Google */}
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <FontAwesome name="google" size={20} color="#db4437" />
              <Text style={styles.googleText}>Ingresar con Google</Text>
            </TouchableOpacity>

            {/* Crear cuenta */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    backgroundColor: '#789C3B',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: { width: 100, height: 100 },
  form: {
    flex: 1,
    alignItems: 'center',
    marginTop: -30,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
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
    alignSelf: 'flex-end',
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
