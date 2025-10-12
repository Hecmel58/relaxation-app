import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import SleepScreen from '../screens/main/SleepScreen';
import RelaxationScreen from '../screens/main/RelaxationScreen';
import BinauralScreen from '../screens/main/BinauralScreen';
import FormsScreen from '../screens/main/FormsScreen';
import SupportScreen from '../screens/main/SupportScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import VideoCallScreen from '../screens/main/VideoCallScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const user = useAuthStore((state) => state.user);
  const hasExperimentalAccess = user?.isAdmin || user?.abGroup === 'experiment';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          display: 'none',
        },
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Ana Sayfa',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Sleep"
        component={SleepScreen}
        options={{
          title: 'Uyku Takibi',
        }}
      />
      <Tab.Screen
        name="Forms"
        component={FormsScreen}
        options={{
          title: 'Formlar',
        }}
      />
      <Tab.Screen
        name="Relaxation"
        component={RelaxationScreen}
        options={{
          title: 'Rahatlama',
        }}
      />
      <Tab.Screen
        name="Binaural"
        component={BinauralScreen}
        options={{
          title: 'Binaural',
        }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: 'Destek',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VideoCall" 
        component={VideoCallScreen}
        options={{ 
          title: 'Görüntülü Görüşme',
          headerShown: true,
          presentation: 'fullScreenModal',
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}