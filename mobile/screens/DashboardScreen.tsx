import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { apiClient, RiskAssessment } from '../lib/api';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadLatestRisk();
  }, []);

  const loadLatestRisk = async () => {
    if (!userId) return;
    try {
      const risk = await apiClient.getLatestRisk(userId);
      setRiskAssessment(risk);
    } catch (error) {
      console.log('No risk assessment found');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (category: string) => {
    if (category === 'Low') return '#4CAF50';
    if (category === 'Medium') return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Dashboard</Text>
        <Text style={styles.subtitle}>MS Companion App</Text>
      </View>

      <View style={styles.riskContainer}>
        {riskAssessment ? (
          <>
            <View style={[styles.riskCircle, { borderColor: getRiskColor(riskAssessment.riskCategory) }]}>
              <Text style={styles.riskScore}>{Math.round(riskAssessment.riskScore)}%</Text>
              <Text style={styles.riskLabel}>Risk Score</Text>
            </View>
            
            <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(riskAssessment.riskCategory) }]}>
              <Text style={styles.categoryText}>{riskAssessment.riskCategory} Risk</Text>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>ℹ️</Text>
            <Text style={styles.noDataText}>No Data</Text>
          </View>
        )}
      </View>

      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionTitle}>💡 Personalized Suggestion</Text>
        {riskAssessment ? (
          <Text style={styles.suggestionText}>{riskAssessment.suggestion}</Text>
        ) : (
          <Text style={styles.suggestionText}>
            Enter your health metrics to get personalized suggestions.
          </Text>
        )}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>☀️</Text>
        <Text style={styles.tipText}>Rest well tonight for better health tomorrow</Text>
      </View>

      {riskAssessment && (
        <View style={styles.updateInfo}>
          <Text style={styles.updateLabel}>Last Update</Text>
          <Text style={styles.updateTime}>
            {new Date(riskAssessment.createdAt).toLocaleString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  riskContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  riskCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  riskScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  categoryBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataIcon: {
    fontSize: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  suggestionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#2E7D32',
    flex: 1,
  },
  updateInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  updateLabel: {
    fontSize: 12,
    color: '#999',
  },
  updateTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
