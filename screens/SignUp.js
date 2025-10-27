import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Platform, 
  Animated,
  ImageBackground
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; 
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

  // Toast animado
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setToast({ visible: false, message: '', type: '' });
      });
    }, 3500);
  };

  // Validaciones
  const onlyText = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showToast("Todos los campos son obligatorios", "error");
      return;
    }

    if (!onlyText(firstName) || !onlyText(lastName)) {
      showToast("Nombre y apellido solo pueden contener letras", "error");
      return;
    }

    if (!validateEmail(email)) {
      showToast("El formato del correo no es válido", "error");
      return;
    }

    if (!validatePassword(password)) {
      showToast("La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
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

      showToast("Registro exitoso", "success");

      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }, 3500);

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
      showToast(`❌ ${errorMessage}`, "error");
    }
  };

  return (
        <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={70}   
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <ImageBackground
      source={require('../assets/fondoPistacho.jpg')}
      style={{ width: '100%'}}
      >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Sana-mente Natural</Text>
          <Image source={require('../assets/logoblanco.png')} style={styles.logo} />
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Crear cuenta</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={[styles.input, firstName && !onlyText(firstName) && { color: 'red' }]}
              placeholder="Nombre"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          {firstName && !onlyText(firstName) && <Text style={styles.errorText}>Solo se permiten letras</Text>}

          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={[styles.input, lastName && !onlyText(lastName) && { color: 'red' }]}
              placeholder="Apellido"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          {lastName && !onlyText(lastName) && <Text style={styles.errorText}>Solo se permiten letras</Text>}

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={[styles.input, email && !validateEmail(email) && { color: 'red' }]}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {email && !validateEmail(email) && <Text style={styles.errorText}>Correo no válido</Text>}

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={[styles.input, password && !validatePassword(password) && { color: 'red' }]}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#777" />
            </TouchableOpacity>
          </View>
          {password && !validatePassword(password) && (
            <Text style={styles.errorText}>Debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número</Text>
          )}

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={[styles.input, confirmPassword && confirmPassword !== password && { color: 'red' }]}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#777" />
            </TouchableOpacity>
          </View>
          {confirmPassword && confirmPassword !== password && <Text style={styles.errorText}>Las contraseñas no coinciden</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signUpText}>
              ¿Ya tenés cuenta? <Text style={{ color: '#789C3B', fontWeight: 'bold' }}>Iniciá sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {toast.visible && (
          <Animated.View
            style={[
              styles.toast,
              { 
                opacity: fadeAnim,
                backgroundColor: toast.type === "success" ? "#4CAF50" : "#E53935"
              }
            ]}
          >
            <Text style={styles.toastText}>
              {toast.type === "success" ? "✅ " : "❌ "}
              {toast.message}
            </Text>
          </Animated.View>
        )}
      </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
  width: '100%',
  alignItems: 'center',
  paddingVertical: 40,
  backgroundColor:"rgba(29, 53, 19, 0.55)" //COLOR OPACIDAD
  },
  backgroundImage: {
  flex: 1,
  resizeMode: 'cover',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%'
},
  headerText: {
  paddingBottom: 10,
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
  logo: { width: 100, height: 100 },
  form: {
    flex: 1,
    alignItems: 'center',
    marginTop: -10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  title: { fontSize: 35, fontWeight: 'bold', color: '#103900', marginBottom: 30  },
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
  errorText: { color: 'red', fontSize: 12, marginTop: -10, marginBottom: 10, alignSelf: 'flex-start' },
  button: {
    backgroundColor: '#789C3B',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  signUpText: { fontSize: 14, color: '#555', marginBottom: 10 },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  toastText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});