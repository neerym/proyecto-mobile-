import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

//  Pantalla de carga inicial (Splash Screen)
export default function Loading({ navigation }) {

    useEffect(() => {
        // Redirige a Home 
        const timer = setTimeout(() => {
            navigation.replace('Home');
        }, 3000);

        // Limpieza del temporizador 
        return () => clearTimeout(timer);
    }, [navigation]);

    //  Render de la pantalla de carga
    return (
        <View style={styles.container}>
            {/* Logo  app */}
            <Text style={styles.header}>Sana-mente Natural</Text>
            <Image source={require('../assets/logoblanco.png')} style={styles.logo} />
            {/* Eslogan debajo del logo */}
            <Text style={styles.slogan}>
                Porque comer bien es la base de sentirse mejor
            </Text>
        </View>
    );
}

//  Estilos de la pantalla de carga
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#789C3B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    slogan: {
        color: '#fff',
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
    },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
});
