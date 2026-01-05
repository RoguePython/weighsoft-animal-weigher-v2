/**
 * Home Tab - Dashboard
 *
 * Main dashboard showing key metrics, quick actions, recent activity, and open sessions.
 */

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { useFocusEffect, useRouter } from 'expo-router';
import { EmptyState } from '@/presentation/components/ui';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_TENANT_ID = 'default-tenant';

interface DashboardStats {
  totalAnimals: number;
  activeAnimals: number;
  openSessions: number;
  healthAlerts: number;
  recentWeighs: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    activeAnimals: 0,
    openSessions: 0,
    healthAlerts: 0,
    recentWeighs: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [entities, setEntities] = useState<Map<string, Entity>>(new Map());
  const [openSessions, setOpenSessions] = useState<Batch[]>([]);
  const [sessionTransactionCounts, setSessionTransactionCounts] = useState<Map<string, number>>(
    new Map()
  );

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const entityRepo = container.entityRepository;
      const batchRepo = container.batchRepository;
      const transactionRepo = container.transactionRepository;

      // Load all data in parallel
      const [allEntities, activeEntities, allBatches, allTransactions] = await Promise.all([
        entityRepo.findAll(DEFAULT_TENANT_ID),
        entityRepo.findByStatus(DEFAULT_TENANT_ID, 'Active'),
        batchRepo.findAll(DEFAULT_TENANT_ID),
        transactionRepo.findAll(DEFAULT_TENANT_ID),
      ]);

      // Filter open sessions
      const open = allBatches.filter((b) => b.status === 'Open' || b.status === 'Draft');
      setOpenSessions(open);

      // Count transactions per session
      const txCounts = new Map<string, number>();
      open.forEach((session) => {
        const count = allTransactions.filter((t) => t.batch_id === session.batch_id).length;
        txCounts.set(session.batch_id, count);
      });
      setSessionTransactionCounts(txCounts);

      // Get recent transactions (last 5, sorted by date descending)
      const recent = allTransactions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentTransactions(recent);

      // Load entities for recent transactions
      const entityIds = [...new Set(recent.map((t) => t.entity_id))];
      const entityMap = new Map<string, Entity>();
      for (const entityId of entityIds) {
        const entity = await entityRepo.findById(entityId);
        if (entity) {
          entityMap.set(entityId, entity);
        }
      }
      setEntities(entityMap);

      // Count health alerts (transactions with weight_loss_flag)
      const healthAlerts = allTransactions.filter((t) => t.weight_loss_flag === true).length;

      // Count recent weighs (today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const recentWeighs = allTransactions.filter(
        (t) => new Date(t.created_at) >= today
      ).length;

      // Calculate stats
      setStats({
        totalAnimals: allEntities.length,
        activeAnimals: activeEntities.length,
        openSessions: open.length,
        healthAlerts,
        recentWeighs,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const handleStartWeighing = () => {
    router.push('/(tabs)/weigh' as any);
  };

  const handleAddAnimal = () => {
    router.push('/entity-setup' as any);
  };

  const handleCreateSession = () => {
    router.push('/batch-setup' as any);
  };

  const handleContinueWeighing = (batchId: string) => {
    router.push(`/(tabs)/weigh?batchId=${batchId}` as any);
  };

  const handleViewTransaction = (txId: string) => {
    router.push(`/transaction-detail?txId=${txId}` as any);
  };

  const handleViewReadyToSell = () => {
    router.push('/ready-to-sell' as any);
  };

  const handleViewHealthMonitoring = () => {
    router.push('/health-monitoring' as any);
  };

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.background.primary }]}
        testID="home-screen"
      >
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="home-screen"
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]}>Dashboard</Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.primary }]}
            onPress={handleStartWeighing}
            testID="home-start-weighing-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>Start Weighing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
            onPress={handleAddAnimal}
            testID="home-add-animal-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>Add Animal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
            onPress={handleCreateSession}
            testID="home-create-session-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>
              Create Session
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
          Key Metrics
        </Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>
              Active Animals
            </Text>
            <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>
              {stats.activeAnimals}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>
              Open Sessions
            </Text>
            <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>
              {stats.openSessions}
            </Text>
          </View>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor:
                  stats.healthAlerts > 0 ? theme.status.errorBackground : theme.background.secondary,
              },
            ]}
          >
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>
              Health Alerts
            </Text>
            <Text
              style={[
                TEXT_STYLES.h2,
                { color: stats.healthAlerts > 0 ? theme.status.error : theme.text.primary },
              ]}
            >
              {stats.healthAlerts}
            </Text>
            {stats.healthAlerts > 0 && (
              <TouchableOpacity onPress={handleViewHealthMonitoring} style={styles.metricLink}>
                <Text style={[TEXT_STYLES.caption, { color: theme.status.error }]}>View →</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>
              Recent Weighs
            </Text>
            <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>
              {stats.recentWeighs}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: theme.text.tertiary, marginTop: SPACING[1] }]}>
              Today
            </Text>
          </View>
        </View>
      </View>

      {/* Open Sessions */}
      {openSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
            Open Sessions
          </Text>
          {openSessions.map((session) => {
            const txCount = sessionTransactionCounts.get(session.batch_id) || 0;
            return (
              <TouchableOpacity
                key={session.batch_id}
                style={[
                  styles.sessionCard,
                  {
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.default,
                  },
                ]}
                onPress={() => handleContinueWeighing(session.batch_id)}
                testID={`home-session-${session.batch_id}`}
              >
                <View style={styles.sessionCardContent}>
                  <View style={styles.sessionInfo}>
                    <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>
                      {session.name}
                    </Text>
                    <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
                      {session.type} • {txCount} animals weighed
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: theme.interactive.primary }]}
                    onPress={() => handleContinueWeighing(session.batch_id)}
                  >
                    <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
          Recent Activity
        </Text>
        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="scale-outline"
            message="No recent weighing activity"
            description="Start weighing animals to see recent activity here. Recent weighings help you track daily progress and identify animals that need attention."
            action={{
              label: 'Start Weighing',
              onPress: handleStartWeighing,
              testID: 'empty-state-start-weighing-button',
            }}
            testID="recent-activity-empty-state"
          />
        ) : (
          <View style={styles.activityList}>
            {recentTransactions.map((transaction) => {
              const entity = entities.get(transaction.entity_id);
              const animalName = entity?.name || entity?.primary_tag || 'Unknown';
              const date = new Date(transaction.created_at);
              return (
                <TouchableOpacity
                  key={transaction.tx_id}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor: theme.background.secondary,
                      borderColor: theme.border.default,
                    },
                  ]}
                  onPress={() => handleViewTransaction(transaction.tx_id)}
                  testID={`home-activity-${transaction.tx_id}`}
                >
                  <View style={styles.activityItemContent}>
                    <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>
                      {animalName}
                    </Text>
                    <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
                      {transaction.weight} kg • {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {transaction.weight_loss_flag && (
                    <View
                      style={[
                        styles.alertBadge,
                        { backgroundColor: theme.status.errorBackground },
                      ]}
                    >
                      <Text style={[TEXT_STYLES.caption, { color: theme.status.error }]}>
                        Alert
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  actionButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    minWidth: 120,
    alignItems: 'center',
    minHeight: 44, // Minimum touch target
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  metricLink: {
    marginTop: SPACING[1],
  },
  sessionCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING[2],
  },
  sessionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  continueButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
    minHeight: 44, // Minimum touch target
    justifyContent: 'center',
  },
  activityList: {
    gap: SPACING[2],
  },
  activityItem: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44, // Minimum touch target
  },
  activityItemContent: {
    flex: 1,
  },
  alertBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING[2],
  },
});
