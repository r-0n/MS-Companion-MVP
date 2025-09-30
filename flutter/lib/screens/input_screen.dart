import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class InputScreen extends StatefulWidget {
  const InputScreen({super.key});

  @override
  State<InputScreen> createState() => _InputScreenState();
}

class _InputScreenState extends State<InputScreen> {
  final _formKey = GlobalKey<FormState>();
  final _sleepQualityController = TextEditingController();
  final _sleepDurationController = TextEditingController();
  final _fatigueController = TextEditingController();
  final _activityStepsController = TextEditingController();
  int _selectedMood = 3;
  bool _isSubmitting = false;

  final List<String> _moodEmojis = ['😢', '😕', '😐', '😊', '😄'];

  @override
  void dispose() {
    _sleepQualityController.dispose();
    _sleepDurationController.dispose();
    _fatigueController.dispose();
    _activityStepsController.dispose();
    super.dispose();
  }

  Future<void> _submitMetrics() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final apiService = Provider.of<ApiService>(context, listen: false);
      final userId = authService.currentUser?.uid;

      if (userId == null) throw Exception('User not logged in');

      await apiService.predictRisk({
        'userId': userId,
        'sleepQuality': int.parse(_sleepQualityController.text),
        'sleepDuration': double.parse(_sleepDurationController.text),
        'fatigueLevel': int.parse(_fatigueController.text),
        'mood': _selectedMood,
        'activitySteps': int.parse(_activityStepsController.text),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Health metrics submitted successfully!'),
            backgroundColor: Colors.green,
          ),
        );

        _sleepQualityController.clear();
        _sleepDurationController.clear();
        _fatigueController.clear();
        _activityStepsController.clear();
        setState(() => _selectedMood = 3);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF4A90E2),
      body: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text(
                'Log Health Metrics',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(30),
                    topRight: Radius.circular(30),
                  ),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        const Text(
                          'How are you feeling today?',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 15),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: List.generate(5, (index) {
                            final mood = index + 1;
                            return GestureDetector(
                              onTap: () {
                                setState(() => _selectedMood = mood);
                              },
                              child: Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: _selectedMood == mood
                                      ? const Color(0xFF4A90E2)
                                      : Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: const Color(0xFF4A90E2),
                                    width: 2,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    _moodEmojis[index],
                                    style: const TextStyle(fontSize: 32),
                                  ),
                                ),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 25),
                        _buildTextField(
                          controller: _sleepQualityController,
                          label: 'Sleep Quality (1-10)',
                          hint: 'Rate your sleep quality',
                        ),
                        const SizedBox(height: 15),
                        _buildTextField(
                          controller: _sleepDurationController,
                          label: 'Sleep Duration (hours)',
                          hint: 'Hours of sleep',
                          isDecimal: true,
                        ),
                        const SizedBox(height: 15),
                        _buildTextField(
                          controller: _fatigueController,
                          label: 'Fatigue Level (1-10)',
                          hint: 'Rate your fatigue',
                        ),
                        const SizedBox(height: 15),
                        _buildTextField(
                          controller: _activityStepsController,
                          label: 'Activity Steps',
                          hint: 'Number of steps today',
                        ),
                        const SizedBox(height: 30),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isSubmitting ? null : _submitMetrics,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF4A90E2),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: _isSubmitting
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text(
                                    'Submit Metrics',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    bool isDecimal = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: TextInputType.numberWithOptions(decimal: isDecimal),
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'This field is required';
            }
            final number = isDecimal ? double.tryParse(value) : int.tryParse(value);
            if (number == null) {
              return 'Please enter a valid number';
            }
            return null;
          },
        ),
      ],
    );
  }
}
