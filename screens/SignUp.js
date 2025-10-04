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
import { auth, db } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones
  const onlyText = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (!onlyText(firstName) || !onlyText(lastName)) {
      Alert.alert("Error", "Nombre y apellido solo pueden contener letras.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "El correo no es válido.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date()
      });

      Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.log("Error Firebase:", error);
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Crear cuenta</Text>

            {/* Nombre */}
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={[
                  styles.input,
                  firstName && !onlyText(firstName) && { color: 'red' }
                ]}
                placeholder="Nombre"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Apellido */}
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={[
                  styles.input,
                  lastName && !onlyText(lastName) && { color: 'red' }
                ]}
                placeholder="Apellido"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Correo */}
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={[
                  styles.input,
                  email && !validateEmail(email) && { color: 'red' }
                ]}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={[
                  styles.input,
                  password && !validatePassword(password) && { color: 'red' }
                ]}
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

            {/* Confirmar contraseña */}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={[
                  styles.input,
                  confirmPassword && confirmPassword !== password && { color: 'red' }
                ]}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesome 
                  name={showConfirmPassword ? "eye-slash" : "eye"} 
                  size={20} 
                  color="#777" 
                />
              </TouchableOpacity>
            </View>

            {/* Botón registrarse */}
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            {/* Link para ir a login */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signUpText}>
                ¿Ya tenés cuenta? <Text style={{ color: '#789C3B', fontWeight: 'bold' }}>Iniciá sesión</Text>
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
    paddingVertical: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: { width: 100, height: 100 },
  form: {
    flex: 1,
    alignItems: 'center',
    marginTop: -10,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', marginBottom: 25 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 40, color: '#000' },
  button: {
    backgroundColor: '#789C3B',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  signUpText: { fontSize: 14, color: '#555', marginBottom: 10 },
});
