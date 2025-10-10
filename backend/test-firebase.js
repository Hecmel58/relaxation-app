require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  const db = admin.firestore();
  
  // Test: Collection'ları listele
  db.listCollections().then(collections => {
    console.log('✅ Firebase bağlantısı başarılı!');
    console.log('Collections:', collections.map(c => c.id));
    process.exit(0);
  });
} catch (error) {
  console.error('❌ Firebase bağlantı hatası:', error.message);
  process.exit(1);
}