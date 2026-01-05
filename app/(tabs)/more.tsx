/**
 * More Tab - Secondary Features Menu
 *
 * Organizes all secondary features in a grid layout with sections.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

const DEFAULT_TENANT_ID = 'default-tenant';

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
  testID?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MoreScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [healthAlertCount, setHealthAlertCount] = useState<number>(0);

  const loadHealthAlertCount = useCallback(async () => {
    try {
      const transactionRepo = container.transactionRepository;
      const allTransactions = await transactionRepo.findAll(DEFAULT_TENANT_ID);
      const alerts = allTransactions.filter((t) => t.weight_loss_flag === true).length;
      setHealthAlertCount(alerts);
    } catch (error) {
      console.error('Failed to load health alert count:', error);
      // Don't show error to user, just keep count at 0
    }
  }, []);

  // Refresh health alert count whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadHealthAlertCount();
    }, [loadHealthAlertCount])
  );

  const menuSections: MenuSection[] = [
    {
      title: 'Management',
      items: [
        {
          id: 'sessions',
          label: 'Sessions',
          icon: 'calendar-outline',
          route: '/sessions-list',
          testID: 'more-sessions',
        },
        {
          id: 'batches',
          label: 'Batches/Groups',
          icon: 'layers-outline',
          route: '/batches-list',
          testID: 'more-batches',
        },
        {
          id: 'custom-fields',
          label: 'Custom Fields',
          icon: 'list-outline',
          route: '/custom-fields-list',
          testID: 'more-custom-fields',
        },
        {
          id: 'history',
          label: 'History',
          icon: 'time-outline',
          route: '/weighing-history',
          testID: 'more-history',
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          id: 'growth-tracking',
          label: 'Growth Tracking',
          icon: 'trending-up-outline',
          route: '/growth-tracking',
          testID: 'more-growth-tracking',
        },
        {
          id: 'health-monitoring',
          label: 'Health Monitoring',
          icon: 'heart-outline',
          route: '/health-monitoring',
          badge: healthAlertCount,
          testID: 'more-health-monitoring',
        },
        {
          id: 'ready-to-sell',
          label: 'Ready to Sell',
          icon: 'cash-outline',
          route: '/ready-to-sell',
          testID: 'more-ready-to-sell',
        },
        {
          id: 'feed-comparison',
          label: 'Feed Comparison',
          icon: 'bar-chart-outline',
          route: '/feed-comparison',
          testID: 'more-feed-comparison',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings-outline',
          route: '/settings',
          testID: 'more-settings',
        },
      ],
    },
  ];

  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="more-screen"
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]}>More</Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
          Access additional features and settings
        </Text>
      </View>

      {menuSections.map((section, sectionIndex) => (
        <View key={section.title} style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
            {section.title}
          </Text>
          <View style={styles.menuGrid}>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.default,
                  },
                ]}
                onPress={() => handleMenuItemPress(item.route)}
                activeOpacity={0.7}
                testID={item.testID}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name={item.icon}
                    size={SPACING[6]} // 24pt
                    color={theme.interactive.primary}
                    style={styles.menuIcon}
                  />
                  <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>{item.label}</Text>
                  {item.badge !== undefined && item.badge > 0 && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: theme.status.error,
                        },
                      ]}
                    >
                      <Text style={[TEXT_STYLES.caption, { color: theme.text.inverse }]}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING[4],
    paddingTop: SPACING[12],
    paddingBottom: SPACING[24],
  },
  header: {
    marginBottom: SPACING[6],
  },
  section: {
    marginBottom: SPACING[6],
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  menuItem: {
    width: '47%', // 2 columns with gap
    minHeight: 88, // Min 44pt touch target (doubled for visual spacing)
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  menuIcon: {
    marginBottom: SPACING[2],
  },
  badge: {
    position: 'absolute',
    top: -SPACING[2],
    right: -SPACING[2],
    minWidth: SPACING[5],
    height: SPACING[5],
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING[1],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

