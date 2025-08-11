import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class ApiService {
  final String baseUrl;
  final http.Client _client = http.Client();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  WebSocketChannel? signaling;

  ApiService({required this.baseUrl});

  Future<String?> _token() async => await _storage.read(key: 'jwt');

  Future<Map<String,String>> _headers() async {
    final token = await _token();
    final headers = {'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer \$token';
    return headers;
  }

  Future<Map<String,dynamic>> login(String phone, String password) async {
    final res = await _client.post(Uri.parse('\$baseUrl/api/auth/login'),
      headers: {'Content-Type':'application/json'},
      body: jsonEncode({'phone':phone,'password':password}));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['token'] != null) await _storage.write(key: 'jwt', value: data['token']);
      return data;
    }
    throw Exception('Login failed: ' + res.body);
  }

  Future<Map<String,dynamic>> register(Map<String,dynamic> payload) async {
    final res = await _client.post(Uri.parse('\$baseUrl/api/auth/register'),
      headers: {'Content-Type':'application/json'}, body: jsonEncode(payload));
    if (res.statusCode == 201) {
      final data = jsonDecode(res.body);
      if (data['token'] != null) await _storage.write(key: 'jwt', value: data['token']);
      return data;
    }
    throw Exception('Register failed: ' + res.body);
  }

  Future<dynamic> createPhys(Map<String,dynamic> payload) async {
    final token = await _token();
    final res = await _client.post(Uri.parse('\$baseUrl/api/physiological-records'),
      headers: {'Content-Type':'application/json', if (token!=null) 'Authorization':'Bearer \$token'},
      body: jsonEncode(payload));
    if (res.statusCode == 201) return jsonDecode(res.body);
    throw Exception('Create phys failed: ' + res.body);
  }

  // WebSocket signaling helpers
  void connectSignaling(String wsUrl, String roomId, String peerId) {
    signaling = WebSocketChannel.connect(Uri.parse(wsUrl));
    // join
    signaling!.sink.add(jsonEncode({'type':'join','room':roomId,'peerId':peerId}));
  }

  void sendSignal(Map<String,dynamic> msg) {
    if (signaling != null) {
      signaling!.sink.add(jsonEncode(msg));
    }
  }

  void disposeSignaling() {
    signaling?.sink.close();
    signaling = null;
  }
}
