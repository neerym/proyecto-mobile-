    import React, { useEffect } from 'react';
    import { View, Image, Text, StyleSheet, ImageBackground } from 'react-native';

    // Pantalla de carga inicial (eso del splash)
    export default function Loading({ navigation }) {

    useEffect(() => {
        // tiempo antes de desaparecer
        const timer = setTimeout(() => {
        navigation.replace('Home');
        }, 3000);

        // limpieza del temporizador 
        return () => clearTimeout(timer);
    }, [navigation]);

    // pantalla de carga
    return (
        <ImageBackground
        source={require('../assets/fondoPistacho.jpg')} 
        style={styles.backgroundImage}
        >
        <View style={styles.overlay}>
            <Text style={styles.header}>Sana-mente Natural</Text>
            <Image
            source={require('../assets/logoblanco.png')} 
            style={styles.logo}
            />
            <Text style={styles.slogan}>
            Porque comer bien es la base de sentirse mejor
            </Text>
        </View>
        </ImageBackground>
    );
    }

    // Estilos
    const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    overlay: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
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
