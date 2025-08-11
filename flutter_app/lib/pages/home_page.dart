import 'package:flutter/material.dart';
import '../services/api_service.dart';

class HomePage extends StatelessWidget {
  final ApiService api;
  HomePage({required this.api});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Relaxation - Mobile')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text('Demo mobile app skeleton', style: TextStyle(fontSize: 20)),
            SizedBox(height: 12),
            ElevatedButton(onPressed: () {
              // navigate to other pages later
            }, child: Text('Gevşeme Teknikleri'))
          ],
        ),
      ),
    );
  }
}
