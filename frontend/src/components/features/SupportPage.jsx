import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { collection, addDoc, onSnapshot, orderBy, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';
import VideoCallModal from './VideoCallModal';

function SupportPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!db || !user?.userId) return;

    const q = query(
      collection(db, 'messages'),
      where('userId', '==', user.userId),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.userId) return;

    try {
      // Firebase'e mesajı kaydet
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        userId: user.userId,
        userName: user.name || 'Kullanıcı',
        sender: 'user',
        timestamp: Timestamp.now()
      });
      
      // Backend'e bildirim gönder (tüm adminlere)
      try {
        await api.post('/chat/send-message', {
          receiverId: 'admin',
          message: newMessage
        });
      } catch (apiError) {
        console.error('Bildirim gönderilemedi:', apiError);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      alert('Mesaj gönderilemedi: ' + error.message);
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Mesaj silinemedi:', error);
      alert('Mesaj silinemedi');
    }
  };

  const handleStartVideoCall = () => {
    setShowVideoCall(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Uzman Desteği</h1>
          <p className="text-slate-600 mt-1">Uyku uzmanlarımızla iletişime geçin</p>
        </div>
        <Button onClick={handleStartVideoCall}>
          🎥 Görüntülü Görüşme
        </Button>
      </div>

      <Card className="h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-slate-600">Henüz mesaj yok</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="relative group">
                  <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-900'
                  }`}>
                    {msg.sender === 'expert' && (
                      <div className="text-xs font-medium mb-1">Uzman</div>
                    )}
                    <div className="text-sm">{msg.text}</div>
                    {msg.timestamp && (
                      <div className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toDate().toLocaleTimeString('tr-TR')}
                      </div>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      title="Mesajı sil"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button type="submit">Gönder</Button>
          </div>
        </form>
      </Card>

      <Card className="bg-wellness-50 border-wellness-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-wellness-800 mb-2">İpucu</h4>
            <p className="text-wellness-700 text-sm">
              Uzmanlarımız 09:00-18:00 saatleri arasında çevrimiçidir.
              Görüntülü görüşme için kamera ve mikrofon izni vermeniz gerekir.
            </p>
          </div>
        </div>
      </Card>

      {showVideoCall && (
        <VideoCallModal
          onClose={() => setShowVideoCall(false)}
          userId={user?.userId}
          userName={user?.name}
        />
      )}
    </div>
  );
}

export default SupportPage;