import 'package:flutter/material.dart';
import 'pages/home_page.dart';
import 'services/api_service.dart';
void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  final ApiService api = ApiService(baseUrl: 'http://10.0.2.2:4000'); // adjust for emulator/device
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Relaxation Mobile',
      theme: ThemeData.dark(),
      home: HomePage(api: api),
    );
  }
}
