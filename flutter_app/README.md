Flutter app skeleton
--------------------
This is a minimal Flutter skeleton that connects to the backend REST API and WebSocket signaling.

Steps:
1. Install Flutter SDK.
2. cd flutter_app
3. flutter pub get
4. Adjust the ApiService baseUrl in lib/main.dart (for Android emulator use 10.0.2.2, for iOS simulator use localhost).
5. For WebRTC use, you'll need to configure platform permissions and follow flutter_webrtc setup docs.

Note: This is a starter skeleton. For full production features (push notifications, auth flows, chat), further integration is required.
