import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ImageBackground,
  ScrollView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Home({ navigation }) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 2500);
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("✅ Sesión cerrada correctamente");
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }, 1500);
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
    }
  };

  const handleUnavailable = () => {
    showToast("🚧 Módulo en desarrollo");
  };

  return (
    <ImageBackground
      source={require('../assets/fondoPistacho.jpg')}
      style={styles.backgroundImage}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.overlay}>
          <Image source={require('../assets/logoblanco.png')} style={styles.logo} />
          <Text style={styles.title}>Panel Principal</Text>
          <Text style={styles.subtitle}>Seleccioná un módulo para continuar</Text>

          <Animated.View
            style={[
              styles.grid,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Items')}
            >
              <FontAwesome name="shopping-cart" size={40} color="#789C3B" />
              <Text style={styles.cardText}>Productos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={handleUnavailable}>
              <FontAwesome name="truck" size={40} color="#789C3B" />
              <Text style={styles.cardText}>Proveedores</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={handleUnavailable}>
              <FontAwesome name="tags" size={40} color="#789C3B" />
              <Text style={styles.cardText}>Marcas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={handleUnavailable}>
              <FontAwesome name="folder-open" size={40} color="#789C3B" />
              <Text style={styles.cardText}>Categorías</Text>
            </TouchableOpacity>

            {/* Nuevo cuadrado: Ver Perfil */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Profile')}
            >
              <FontAwesome name="user" size={40} color="#789C3B" />
              <Text style={styles.cardText}>Perfil</Text>
            </TouchableOpacity>

            {/* Botón de logout también dentro del grid (opcional) */}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#ffe6e6' }]}
              onPress={handleLogout}
            >
              <FontAwesome name="sign-out" size={40} color="#b71c1c" />
              <Text style={[styles.cardText, { color: '#b71c1c' }]}>Salir</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {toastVisible && (
          <Animated.View
            style={[
              styles.toast,
              {
                opacity: toastAnim,
                transform: [{
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  overlay: {
    width: '100%',
    minHeight: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // leve velo blanco
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
    grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,  // mantiene el diseño compacto
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    width: '42%',        // permite 2 por fila
    aspectRatio: 1,      // mantiene cuadradas
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },

  cardText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
