import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';

class ApiService {
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:5000',
  );

  Future<String?> _getToken() async {
    return await FirebaseAuth.instance.currentUser?.getIdToken();
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> createUser(
    String uid,
    String email,
    String name,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/users'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'firebaseUid': uid,
        'email': email,
        'displayName': name,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create user: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> predictRisk(Map<String, dynamic> metrics) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/predict-risk'),
      headers: await _getHeaders(),
      body: jsonEncode(metrics),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to predict risk: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> getLatestRisk(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/latest-risk/$userId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get latest risk: ${response.body}');
    }
  }

  Future<List<dynamic>> getRiskHistory(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/risk-history/$userId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get risk history: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> sendChatMessage(
    String userId,
    String message,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/chat'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'userId': userId,
        'message': message,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to send message: ${response.body}');
    }
  }

  Future<List<dynamic>> getChatHistory(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/chat/history/$userId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get chat history: ${response.body}');
    }
  }
}
