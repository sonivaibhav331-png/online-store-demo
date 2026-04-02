import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const [userRole, setUserRole] = useState('guest'); // roles: guest, customer, worker

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📱 Flipkart Mobile App</Text>
      <Text>Logged in as: <Text style={{fontWeight: 'bold'}}>{userRole.toUpperCase()}</Text></Text>

      {/* AUTHENTICATION SIMULATION */}
      {userRole === 'guest' && (
        <View style={styles.authBox}>
          <Button title="Login as Customer" onPress={() => setUserRole('customer')} color="#2874f0" />
          <View style={{height: 10}} />
          <Button title="Login as Delivery Worker" onPress={() => setUserRole('worker')} color="#388e3c" />
        </View>
      )}

      {userRole !== 'guest' && (
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setUserRole('guest')}>
          <Text style={{color: '#fff', textAlign: 'center'}}>Logout</Text>
        </TouchableOpacity>
      )}

      {/* CUSTOMER MOBILE VIEW */}
      {userRole === 'customer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.card}>
            <Text style={styles.productName}>Smartphone X</Text>
            <Text>₹15,000</Text>
            <Button title="Buy Now" onPress={() => alert('Proceeding to checkout')} />
          </View>
        </View>
      )}

      {/* WORKER MOBILE VIEW */}
      {userRole === 'worker' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 My Deliveries</Text>
          <View style={styles.card}>
            <Text style={{fontWeight: 'bold'}}>Order #4592</Text>
            <Text>Address: 123 Main St, Mumbai</Text>
            <Text style={{color: 'orange', marginBottom: 10}}>Status: Out for Delivery</Text>
            <Button title="Mark as Delivered" onPress={() => alert('Order Complete!')} color="#388e3c" />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: '#f1f3f6', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#2874f0' },
  authBox: { marginTop: 30, padding: 20, backgroundColor: '#fff', borderRadius: 8 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, elevation: 2, marginBottom: 15 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#d32f2f', padding: 10, borderRadius: 5, marginTop: 10 }
});
