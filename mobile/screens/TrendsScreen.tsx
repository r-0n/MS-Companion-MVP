import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getAuth } from 'firebase/auth';
import { apiClient } from '../lib/api';

export default function TrendsScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!userId) return;
    try {
      const data = await apiClient.getRiskHistory(userId, 7);
      setHistory(data);
    } catch (error) {
      console.log('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: history.map((_, i) => `Day ${i + 1}`).reverse(),
    datasets: [{
      data: history.length > 0 
        ? history.map(h => h.riskAssessment?.riskScore || 0).reverse()
        : [0],
    }],
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return '#4CAF50';
    if (score < 70) return '#FF9800';
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
        <Text style={styles.title}>7-Day Risk Trends</Text>
        <Text style={styles.subtitle}>Historical risk analysis</Text>
      </View>

      {history.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#4A90E2',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Low Risk (&lt;30%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>Medium Risk (30-70%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>High Risk (&gt;70%)</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>📊</Text>
          <Text style={styles.noDataText}>No trend data available yet</Text>
          <Text style={styles.noDataHint}>
            Submit health metrics for 7 days to see your trends
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
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  noDataIcon: {
    fontSize: 60,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  noDataHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});
