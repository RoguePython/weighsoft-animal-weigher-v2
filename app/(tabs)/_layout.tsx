import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
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
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="custom-fields"
        options={{
          title: 'Custom Fields',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.clipboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="animals"
        options={{
          title: 'Animals',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pawprint.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="weighing"
        options={{
          title: 'Weigh',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="scalemass.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
