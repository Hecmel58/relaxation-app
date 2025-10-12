import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/sleep/analytics?period=week');
      setStats(response.data.analytics);
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const allMenus = [
    { id: 'sleep', title: 'Uyku Takibi', icon: '😴', screen: 'Sleep', color: '#818cf8' },
    { id: 'relaxation', title: 'Rahatlama', icon: '🧘‍♀️', screen: 'Relaxation', color: '#34d399' },
    { id: 'binaural', title: 'Binaural Sesler', icon: '🎵', screen: 'Binaural', color: '#f472b6' },
    { id: 'forms', title: 'Formlar', icon: '📋', screen: 'Forms', color: '#fbbf24' },
    { id: 'support', title: 'Uzman Desteği', icon: '💬', screen: 'Support', color: '#60a5fa' },
    { id: 'profile', title: 'Profil', icon: '👤', screen: 'Profile', color: '#a78bfa' },
  ];

  const filteredMenus = allMenus.filter(menu => {
    if (menu.id === 'relaxation' || menu.id === 'binaural') {
      return user?.isAdmin || user?.abGroup === 'experiment';
    }
    return true;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hoş Geldiniz,</Text>
        <Text style={styles.name}>{user?.name}</Text>
        {user?.isAdmin && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{stats?.total_sessions || 0}</Text>
          <Text style={styles.statLabel}>Toplam Kayıt</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>
            {stats?.avg_sleep_quality?.toFixed(1) || '0.0'}/10
          </Text>
          <Text style={styles.statLabel}>Ortalama Kalite</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Menüler</Text>
      <View style={styles.menusContainer}>
        {filteredMenus.map((menu) => (
          <TouchableOpacity
            key={menu.id}
            style={[styles.menuCard, { borderLeftColor: menu.color }]}
            onPress={() => navigation.navigate(menu.screen)}
          >
            <Text style={styles.menuIcon}>{menu.icon}</Text>
            <Text style={styles.menuTitle}>{menu.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    padding: 24,
    backgroundColor: '#0f172a',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    marginTop: -40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  menusContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  menuCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
});