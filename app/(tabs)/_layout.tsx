import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="batches"
        options={{
          title: 'Batches',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/batches-icon.png')}
              style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/sessions-icon.png')}
              style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="custom-fields"
        options={{
          title: 'Custom Fields',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/custom-fields-icon.png')}
              style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="animals"
        options={{
          title: 'Animals',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/animals-icon.png')}
              style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="weighing"
        options={{
          title: 'Weigh',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/weighing-icon.png')}
              style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/weighing-history-icon.png')}
              style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 28,
    height: 28,
  },
});
