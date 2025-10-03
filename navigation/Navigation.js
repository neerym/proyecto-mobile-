import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Firebase Auth para detectar cambios de sesión
import { onAuthStateChanged } from 'firebase/auth';  
import { auth } from '../src/config/firebaseConfig';  

// 📱 Screens principales de la app
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import Loading from '../screens/Loading';
import Items from '../screens/Items';
import AddProduct from '../screens/AddProduct';
import EditProduct from '../screens/EditProduct';
import Profile from '../screens/Profile';

// Creamos el stack de navegación
const Stack = createStackNavigator();

function Navigation() {
  // Estado para saber si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔑 Escucha cambios en la sesión de Firebase (login / logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user); // true si hay usuario, false si no
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {/* Stack principal de pantallas */}
      <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
        {/* Pantallas públicas */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />

        {/* Pantallas privadas (requieren estar logueado) */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Loading" component={Loading} />
        <Stack.Screen name="Items" component={Items} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="EditProduct" component={EditProduct} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
