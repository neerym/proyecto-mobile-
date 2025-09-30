import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function Loading({ navigation }) {
    useEffect(() => {
        const timer = setTimeout(() => {
        navigation.replace('Home');
        }, 3000); // 3 segundos

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.slogan}>Porque comer bien es la base de sentirse mejor</Text>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#789C3B', // verde del logo
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
});
