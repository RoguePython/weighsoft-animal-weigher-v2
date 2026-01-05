import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

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
          borderTopLeftRadius: SPACING[6], // 24pt
          borderTopRightRadius: SPACING[6], // 24pt
          position: 'absolute',
          left: SPACING[4], // 16pt
          right: SPACING[4], // 16pt
          bottom: SPACING[4], // 16pt
          height: SPACING[16], // 64pt
          paddingBottom: SPACING[2], // 8pt
          paddingTop: SPACING[2], // 8pt
          shadowColor: '#000000',
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: SPACING[2], // 8pt
          elevation: 8,
        },
        tabBarItemStyle: {
          borderRadius: SPACING[4], // 16pt
          marginHorizontal: SPACING[1], // 4pt
        },
        tabBarLabelStyle: {
          ...TEXT_STYLES.caption,
        },
      }}>
      {/* Primary Tabs - Only 4 visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="weigh"
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
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'menu' : 'menu-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Secondary Tabs - Hidden from tab bar, accessible via More menu */}
      <Tabs.Screen
        name="batches"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="custom-fields"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: SPACING[8], // 32pt
    height: SPACING[8], // 32pt
  },
});
