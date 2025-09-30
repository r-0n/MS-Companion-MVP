import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class TrendsScreen extends StatefulWidget {
  const TrendsScreen({super.key});

  @override
  State<TrendsScreen> createState() => _TrendsScreenState();
}

class _TrendsScreenState extends State<TrendsScreen> {
  List<dynamic> _riskHistory = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRiskHistory();
  }

  Future<void> _loadRiskHistory() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final apiService = Provider.of<ApiService>(context, listen: false);
    final userId = authService.currentUser?.uid;

    if (userId == null) return;

    try {
      final history = await apiService.getRiskHistory(userId);
      setState(() {
        _riskHistory = history;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  List<FlSpot> _getChartData() {
    if (_riskHistory.isEmpty) return [];
    
    return _riskHistory
        .asMap()
        .entries
        .map((entry) => FlSpot(
              entry.key.toDouble(),
              (entry.value['riskScore'] as num).toDouble(),
            ))
        .toList();
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
                '7-Day Trends',
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
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : RefreshIndicator(
                        onRefresh: _loadRiskHistory,
                        child: SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 20),
                              if (_riskHistory.isEmpty)
                                const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(40),
                                    child: Text(
                                      'No data yet. Start logging your health metrics to see trends!',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ),
                                )
                              else ...[
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(15),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.05),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Risk Score Trend',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 20),
                                      SizedBox(
                                        height: 200,
                                        child: LineChart(
                                          LineChartData(
                                            gridData: FlGridData(
                                              show: true,
                                              drawVerticalLine: false,
                                              horizontalInterval: 2,
                                              getDrawingHorizontalLine: (value) {
                                                return FlLine(
                                                  color: Colors.grey.withOpacity(0.2),
                                                  strokeWidth: 1,
                                                );
                                              },
                                            ),
                                            titlesData: FlTitlesData(
                                              leftTitles: AxisTitles(
                                                sideTitles: SideTitles(
                                                  showTitles: true,
                                                  reservedSize: 40,
                                                  getTitlesWidget: (value, meta) {
                                                    return Text(
                                                      value.toInt().toString(),
                                                      style: const TextStyle(
                                                        fontSize: 12,
                                                        color: Colors.grey,
                                                      ),
                                                    );
                                                  },
                                                ),
                                              ),
                                              bottomTitles: AxisTitles(
                                                sideTitles: SideTitles(
                                                  showTitles: true,
                                                  getTitlesWidget: (value, meta) {
                                                    if (value.toInt() >= 0 &&
                                                        value.toInt() < _riskHistory.length) {
                                                      final date = DateTime.parse(
                                                        _riskHistory[value.toInt()]['assessmentDate'],
                                                      );
                                                      return Padding(
                                                        padding: const EdgeInsets.only(top: 8),
                                                        child: Text(
                                                          DateFormat('MM/dd').format(date),
                                                          style: const TextStyle(
                                                            fontSize: 12,
                                                            color: Colors.grey,
                                                          ),
                                                        ),
                                                      );
                                                    }
                                                    return const Text('');
                                                  },
                                                ),
                                              ),
                                              topTitles: const AxisTitles(
                                                sideTitles: SideTitles(showTitles: false),
                                              ),
                                              rightTitles: const AxisTitles(
                                                sideTitles: SideTitles(showTitles: false),
                                              ),
                                            ),
                                            borderData: FlBorderData(show: false),
                                            minX: 0,
                                            maxX: (_riskHistory.length - 1).toDouble(),
                                            minY: 0,
                                            maxY: 10,
                                            lineBarsData: [
                                              LineChartBarData(
                                                spots: _getChartData(),
                                                isCurved: true,
                                                color: const Color(0xFF4A90E2),
                                                barWidth: 3,
                                                dotData: const FlDotData(show: true),
                                                belowBarData: BarAreaData(
                                                  show: true,
                                                  color: const Color(0xFF4A90E2).withOpacity(0.1),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 20),
                                const Text(
                                  'Recent Assessments',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                ..._riskHistory.map((assessment) {
                                  final date = DateTime.parse(assessment['assessmentDate']);
                                  final riskScore = (assessment['riskScore'] as num).toDouble();
                                  final category = assessment['riskCategory'] as String;
                                  
                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    padding: const EdgeInsets.all(15),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(10),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.05),
                                          blurRadius: 5,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                DateFormat('MMM dd, yyyy').format(date),
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  color: Colors.grey,
                                                ),
                                              ),
                                              const SizedBox(height: 5),
                                              Text(
                                                category.toUpperCase(),
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Text(
                                          riskScore.toStringAsFixed(1),
                                          style: const TextStyle(
                                            fontSize: 24,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF4A90E2),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ],
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
}
