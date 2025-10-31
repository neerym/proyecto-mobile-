import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

// Productos de ejemplo
const sampleProducts = [
  // FRUTAS
  {
    name: "Manzanas Orgánicas",
    tipo: "frutas",
    quantity: "1 kg",
    price: "$ 850 c/u",
    description: "Manzanas rojas deliciosas, cultivadas de forma orgánica sin pesticidas. Ricas en fibra y vitamina C. Perfectas para consumir frescas o en preparaciones.",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
  },
  {
    name: "Bananas",
    tipo: "frutas",
    quantity: "1 kg",
    price: "$ 650 c/u",
    description: "Bananas maduras, fuente natural de potasio y energía. Ideales para batidos, postres o consumo directo. Sin tratamientos químicos post-cosecha.",
    imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400"
  },
  {
    name: "Naranjas Valencianas",
    tipo: "frutas",
    quantity: "2 kg",
    price: "$ 1200 c/u",
    description: "Naranjas dulces y jugosas, perfectas para jugo natural. Alto contenido de vitamina C. Cultivadas naturalmente sin químicos artificiales.",
    imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400"
  },
  {
    name: "Frutillas Frescas",
    tipo: "frutas",
    quantity: "500 g",
    price: "$ 980 c/u",
    description: "Frutillas de estación, dulces y aromáticas. Ricas en antioxidantes. Ideales para ensaladas de frutas, postres o consumo directo.",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400"
  },
  {
    name: "Palta Hass",
    tipo: "frutas",
    quantity: "3 unidades",
    price: "$ 1500 c/u",
    description: "Paltas Hass maduras, cremosas y nutritivas. Alto contenido de grasas saludables. Perfectas para tostadas, ensaladas o guacamole.",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400"
  },

  // VERDURAS
  {
    name: "Espinaca Orgánica",
    tipo: "verduras",
    quantity: "500 g",
    price: "$ 750 c/u",
    description: "Espinaca fresca de cultivo orgánico, rica en hierro y vitaminas. Perfecta para ensaladas, salteados o batidos verdes. Sin pesticidas.",
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"
  },
  {
    name: "Tomates Cherry",
    tipo: "verduras",
    quantity: "250 g",
    price: "$ 680 c/u",
    description: "Tomates cherry dulces y jugosos. Cultivados naturalmente. Ideales para ensaladas, snacks saludables o guarniciones. Alto contenido de licopeno.",
    imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400"
  },
  {
    name: "Brócoli Fresco",
    tipo: "verduras",
    quantity: "1 unidad",
    price: "$ 520 c/u",
    description: "Brócoli verde intenso, fresco y crujiente. Excelente fuente de vitamina K y fibra. Perfecto para cocinar al vapor o en salteados.",
    imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400"
  },
  {
    name: "Zanahoria Orgánica",
    tipo: "verduras",
    quantity: "1 kg",
    price: "$ 580 c/u",
    description: "Zanahorias orgánicas, dulces y crujientes. Ricas en betacaroteno. Ideales para jugos, ensaladas, guisos o como snack saludable.",
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400"
  },
  {
    name: "Lechuga Manteca",
    tipo: "verduras",
    quantity: "1 unidad",
    price: "$ 450 c/u",
    description: "Lechuga manteca fresca y tierna. Hojas crujientes perfectas para ensaladas. Cultivada sin químicos. Baja en calorías y rica en agua.",
    imageUrl: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400"
  },

  // FRUTOS SECOS
  {
    name: "Almendras Naturales",
    tipo: "frutos secos",
    quantity: "250 g",
    price: "$ 1800 c/u",
    description: "Almendras crudas sin sal, tostadas naturalmente. Fuente de proteínas, fibra y grasas saludables. Snack nutritivo ideal para toda la familia.",
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400"
  },
  {
    name: "Nueces Mariposa",
    tipo: "frutos secos",
    quantity: "200 g",
    price: "$ 1650 c/u",
    description: "Nueces de alta calidad, ricas en omega-3 y antioxidantes. Perfectas para postres, ensaladas o consumo directo. Beneficiosas para la salud cardiovascular.",
    imageUrl: "https://images.unsplash.com/photo-1590958211209-ed36a9bb98a8?w=400"
  },
  {
    name: "Mix de Frutos Secos",
    tipo: "frutos secos",
    quantity: "300 g",
    price: "$ 1950 c/u",
    description: "Mezcla premium de almendras, nueces, castañas y avellanas. Sin sal ni azúcar agregados. Energía natural y nutrientes esenciales.",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400"
  },
  {
    name: "Castañas de Cajú",
    tipo: "frutos secos",
    quantity: "200 g",
    price: "$ 2100 c/u",
    description: "Castañas de cajú premium, cremosas y delicadas. Ricas en magnesio y vitamina E. Perfectas para snacks saludables o como ingrediente en recetas.",
    imageUrl: "https://images.unsplash.com/photo-1585888595550-b7c0d5097b4b?w=400"
  },
  {
    name: "Pistachos Naturales",
    tipo: "frutos secos",
    quantity: "150 g",
    price: "$ 1750 c/u",
    description: "Pistachos sin sal, levemente tostados. Alto contenido de proteínas y fibra. Snack delicioso y nutritivo. Beneficiosos para el control de peso.",
    imageUrl: "https://images.unsplash.com/photo-1599599810761-c7e9f76c6f23?w=400"
  },

  // CEREALES
  {
    name: "Avena Integral",
    tipo: "cereales",
    quantity: "500 g",
    price: "$ 580 c/u",
    description: "Avena integral en hojuelas, rica en fibra soluble. Ideal para desayunos saludables, panificados o batidos. Ayuda a controlar el colesterol.",
    imageUrl: "https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=400"
  },
  {
    name: "Quinoa Orgánica",
    tipo: "cereales",
    quantity: "500 g",
    price: "$ 1350 c/u",
    description: "Quinoa blanca orgánica, proteína completa de origen vegetal. Libre de gluten. Perfecta para ensaladas, guarniciones o platos principales.",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
  },
  {
    name: "Arroz Integral",
    tipo: "cereales",
    quantity: "1 kg",
    price: "$ 950 c/u",
    description: "Arroz integral de grano largo. Mayor contenido de fibra y nutrientes que el arroz blanco. Ideal para una alimentación saludable y equilibrada.",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
  },
  {
    name: "Granola Casera",
    tipo: "cereales",
    quantity: "400 g",
    price: "$ 1200 c/u",
    description: "Granola artesanal con avena, miel, frutos secos y semillas. Sin conservantes ni azúcares refinados. Perfecta para yogurt o como snack.",
    imageUrl: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400"
  },
  {
    name: "Semillas de Chía",
    tipo: "cereales",
    quantity: "250 g",
    price: "$ 850 c/u",
    description: "Semillas de chía premium, superalimento rico en omega-3. Alto contenido de fibra y proteínas. Ideal para puddings, batidos o como topping.",
    imageUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400"
  },

  // LEGUMBRES
  {
    name: "Lentejas Orgánicas",
    tipo: "legumbres",
    quantity: "500 g",
    price: "$ 680 c/u",
    description: "Lentejas orgánicas de primera calidad. Excelente fuente de proteína vegetal y hierro. Perfectas para guisos, ensaladas o hamburguesas vegetarianas.",
    imageUrl: "https://images.unsplash.com/photo-1585954802893-ba14b2e2c51e?w=400"
  },
  {
    name: "Garbanzos",
    tipo: "legumbres",
    quantity: "500 g",
    price: "$ 750 c/u",
    description: "Garbanzos de cocción rápida. Ricos en proteínas y fibra. Ideales para hummus, guisos, ensaladas o falafels. Muy versátiles en la cocina.",
    imageUrl: "https://images.unsplash.com/photo-1610213708801-99bcc8e0d0a6?w=400"
  },
  {
    name: "Porotos Negros",
    tipo: "legumbres",
    quantity: "500 g",
    price: "$ 620 c/u",
    description: "Porotos negros premium. Alto contenido de antioxidantes y fibra. Perfectos para preparaciones mexicanas, ensaladas o como guarnición nutritiva.",
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400"
  },
  {
    name: "Arvejas Secas",
    tipo: "legumbres",
    quantity: "500 g",
    price: "$ 580 c/u",
    description: "Arvejas secas partidas, cocción rápida. Ideales para sopas cremosas y guisos. Buena fuente de proteínas vegetales y vitaminas del grupo B.",
    imageUrl: "https://images.unsplash.com/photo-1590777612394-c5a13f8c3d0c?w=400"
  },
  {
    name: "Mix de Legumbres",
    tipo: "legumbres",
    quantity: "600 g",
    price: "$ 890 c/u",
    description: "Mezcla de lentejas, garbanzos y porotos. Lista para preparar sopas y guisos nutritivos. Excelente combinación de sabores y texturas.",
    imageUrl: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400"
  },
];

export default function LoadSampleProducts({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const loadProducts = async () => {
    Alert.alert(
      'Cargar productos de ejemplo',
      '¿Deseas cargar 25 productos de ejemplo en la base de datos? Esto puede tardar unos segundos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: async () => {
            setLoading(true);
            setStatus('Cargando productos...');

            let successCount = 0;
            let errorCount = 0;

            for (const product of sampleProducts) {
              try {
                await addDoc(collection(db, 'productos'), product);
                successCount++;
                setStatus(`Cargados: ${successCount}/${sampleProducts.length}`);
              } catch (error) {
                console.error(`Error cargando ${product.name}:`, error);
                errorCount++;
              }
            }

            setLoading(false);
            setStatus('');

            Alert.alert(
              'Proceso completado',
              `✅ Productos cargados: ${successCount}\n❌ Errores: ${errorCount}`,
              [
                {
                  text: 'Ver productos',
                  onPress: () => navigation.navigate('Items')
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <FontAwesome name="database" size={60} color="#789C3B" />
        <Text style={styles.title}>Cargar Productos de Ejemplo</Text>
        <Text style={styles.description}>
          Esta opción cargará 25 productos realistas distribuidos en 5 categorías:
        </Text>

        <View style={styles.categoriesList}>
          <Text style={styles.categoryItem}>• Frutas (5 productos)</Text>
          <Text style={styles.categoryItem}>• Verduras (5 productos)</Text>
          <Text style={styles.categoryItem}>• Frutos Secos (5 productos)</Text>
          <Text style={styles.categoryItem}>• Cereales (5 productos)</Text>
          <Text style={styles.categoryItem}>• Legumbres (5 productos)</Text>
        </View>

        {loading && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={loadProducts}
          disabled={loading}
        >
          <FontAwesome name="download" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>
            {loading ? 'Cargando...' : 'Cargar Productos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Nota: Puedes ejecutar esta acción varias veces, pero se crearán productos duplicados.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  categoriesList: {
    alignSelf: 'flex-start',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  categoryItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusContainer: {
    backgroundColor: '#e6f7ca',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  statusText: {
    color: '#2e7d32',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#789C3B',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#789C3B',
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    color: '#789C3B',
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
