import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { apiClient } from '../lib/api';

export default function InputScreen({ navigation }: any) {
  const [sleepDuration, setSleepDuration] = useState('');
  const [activitySteps, setActivitySteps] = useState('');
  const [moodScore, setMoodScore] = useState(3);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const moodEmojis = ['😢', '😟', '😐', '😊', '😃'];

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!sleepDuration || !activitySteps) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.predictRisk(userId, {
        sleepQuality: moodScore,
        sleepDuration: parseFloat(sleepDuration),
        fatigueLevel: moodScore,
        moodScore,
        activitySteps: parseInt(activitySteps),
      });
      
      Alert.alert('Success', 'Risk assessment calculated!');
      navigation.navigate('Dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to calculate risk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Metrics Input</Text>
        <Text style={styles.subtitle}>Track your daily health data</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sleep Duration (hours)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 0-24 hours"
            keyboardType="decimal-pad"
            value={sleepDuration}
            onChangeText={setSleepDuration}
          />
          <Text style={styles.hint}>Enter 0-24 hours</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity (steps)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 0-30,000 steps"
            keyboardType="number-pad"
            value={activitySteps}
            onChangeText={setActivitySteps}
          />
          <Text style={styles.hint}>Enter 0-30,000 steps</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mood Score</Text>
          <View style={styles.moodContainer}>
            {moodEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  moodScore === index + 1 && styles.moodButtonActive
                ]}
                onPress={() => setMoodScore(index + 1)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>Select 1 (poor) to 5 (excellent)</Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Calculating...' : 'Calculate Risk'}
          </Text>
        </TouchableOpacity>
      </View>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  moodButtonActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  moodEmoji: {
    fontSize: 32,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
