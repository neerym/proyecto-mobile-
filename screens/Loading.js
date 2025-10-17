import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

//  Pantalla de carga inicial (Splash Screen)
export default function Loading({ navigation }) {

    // useEffect se ejecuta al montar el componente
    useEffect(() => {
        // Redirige a Home después de 3 segundos
        const timer = setTimeout(() => {
            navigation.replace('Home');
        }, 3000);

        // Limpieza del temporizador si se desmonta antes
        return () => clearTimeout(timer);
    }, [navigation]);

    //  Render de la pantalla de carga
    return (
        <View style={styles.container}>
            {/* Logo de la app */}
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
        backgroundColor: '#789C3B', // color verde del logo
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
