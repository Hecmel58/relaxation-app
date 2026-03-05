import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, deleteDoc, doc, writeBatch, where, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';
import JitsiMeetModal from './JitsiMeetModal';

function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [allMessages, setAllMessages] = useState([]);
  const [videoCalls, setVideoCalls] = useState([]);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const prevMessageIdsRef = useRef(new Set());

  useEffect(() => {
    if (!db) return;

    const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAllMessages(allMsgs);

      const grouped = {};
      allMsgs.forEach(msg => {
        const uid = msg.userId || 'unknown';
        if (!grouped[uid]) {
          grouped[uid] = {
            userId: uid,
            userName: msg.userName || 'Kullanıcı',
            messages: []
          };
        }
        grouped[uid].messages.push(msg);
      });

      setConversations(Object.values(grouped));
      setLoading(false);

      // Yeni kullanıcı mesajlarını tespit et ve unread sayacını güncelle
      const newUnread = {};
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const msg = { id: change.doc.id, ...change.doc.data() };
          // Sadece kullanıcıdan gelen ve daha önce görmediğimiz mesajlar
          if (msg.sender === 'user' && !prevMessageIdsRef.current.has(msg.id)) {
            const uid = msg.userId || 'unknown';
            newUnread[uid] = (newUnread[uid] || 0) + 1;
          }
        }
      });

      if (Object.keys(newUnread).length > 0) {
        setUnreadCounts(prev => {
          const updated = { ...prev };
          Object.keys(newUnread).forEach(uid => {
            updated[uid] = (updated[uid] || 0) + newUnread[uid];
          });
          return updated;
        });
      }

      // Mevcut ID'leri kaydet
      snapshot.docs.forEach(d => prevMessageIdsRef.current.add(d.id));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;

    // Video call taleplerini dinle
    const videoCallsQuery = query(
      collection(db, 'videoCalls'),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(videoCallsQuery, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideoCalls(calls);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    const msgs = allMessages.filter(msg => msg.userId === selectedUserId);
    setMessages(msgs);

    // Konuşma açılınca unread sıfırla ve localStorage güncelle
    setUnreadCounts(prev => ({ ...prev, [selectedUserId]: 0 }));
    localStorage.setItem('admin_messages_last_seen', Date.now().toString());
  }, [selectedUserId, allMessages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        sender: 'expert',
        userId: selectedUserId,
        userName: 'Uzman',
        timestamp: Timestamp.now()
      });
      
      try {
        await api.post('/chat/send-message', {
          receiverId: selectedUserId,
          message: newMessage
        });
      } catch (apiError) {
        console.error('Bildirim gönderilemedi:', apiError);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      alert('Mesaj gönderilemedi');
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

  const handleDeleteConversation = async (e, userId) => {
    e.stopPropagation();
    
    if (!confirm('Bu konuşmadaki tüm mesajları silmek istediğinize emin misiniz?')) return;

    try {
      const batch = writeBatch(db);
      const userMessages = allMessages.filter(msg => msg.userId === userId);
      
      userMessages.forEach(msg => {
        batch.delete(doc(db, 'messages', msg.id));
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Konuşma silinemedi:', error);
      alert('Konuşma silinemedi');
    }
  };

  const handleJoinVideoCall = async (call) => {
    try {
      console.log('Admin video call\'a katılıyor:', call.roomId);
      
      // Status'u accepted olarak güncelle (SİLME!)
      await updateDoc(doc(db, 'videoCalls', call.id), {
        status: 'accepted'
      });
      
      console.log('Video call status güncellendi: accepted');
      
      // Jitsi Modal'ı aç - AYNI roomId ile
      setActiveVideoCall({
        ...call,
        roomId: call.roomId // Kullanıcının oluşturduğu oda
      });
      
      // 10 saniye sonra Firebase'den temizle (görüşme başladıktan sonra)
      setTimeout(async () => {
        try {
          await deleteDoc(doc(db, 'videoCalls', call.id));
          console.log('Video call kaydı temizlendi');
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Video call join error:', error);
      alert('Video görüşmeye katılınamadı');
    }
  };

  const handleRejectVideoCall = async (call) => {
    try {
      // Status'u rejected olarak güncelle
      await updateDoc(doc(db, 'videoCalls', call.id), {
        status: 'rejected'
      });
      
      // 2 saniye sonra sil
      setTimeout(async () => {
        await deleteDoc(doc(db, 'videoCalls', call.id));
      }, 2000);
    } catch (error) {
      console.error('Video call reject error:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Mesajlar yükleniyor...</p>
      </div>
    );
  }

  if (selectedUserId) {
    const conv = conversations.find(c => c.userId === selectedUserId);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{conv?.userName}</h3>
            <p className="text-sm text-slate-500">{messages.length} mesaj</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedUserId(null)}>
            Geri Dön
          </Button>
        </div>

        <Card className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className="relative group">
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {msg.sender === 'user' ? msg.userName : 'Siz (Uzman)'}
                    </div>
                    <div className="text-sm">{msg.text}</div>
                    {msg.timestamp && (
                      <div className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toDate().toLocaleString('tr-TR')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className={`absolute ${msg.sender === 'user' ? '-right-8' : '-left-8'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700`}
                    title="Mesajı sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendReply} className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Yanıt yazın..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="submit">Gönder</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{conversations.length}</div>
            <div className="text-sm text-slate-600 mt-1">Toplam Konuşma</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">{videoCalls.length}</div>
            <div className="text-sm text-slate-600 mt-1">Video Call Talebi</div>
          </div>
        </Card>
      </div>

      {/* Video Call Talepleri */}
      {videoCalls.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-lg">🎥 Görüntülü Görüşme Talepleri</h3>
          {videoCalls.map((call) => (
            <Card key={call.id} className="bg-warning-50 border-warning-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">📹</div>
                  <div>
                    <div className="font-semibold text-slate-900">{call.userName}</div>
                    <div className="text-sm text-slate-600">
                      Görüntülü görüşme talebi - {call.createdAt?.toDate?.()?.toLocaleTimeString('tr-TR')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Oda: {call.roomId}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleJoinVideoCall(call)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Katıl
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectVideoCall(call)}
                  >
                    Reddet
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Mesaj Konuşmaları */}
      {conversations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-slate-600">Henüz mesaj bulunmuyor</p>
          </div>
        </Card>
      ) : (
        conversations.map((conv) => {
          const unread = unreadCounts[conv.userId] || 0;
          return (
          <Card 
            key={conv.userId} 
            className={`hover:shadow-md transition-shadow cursor-pointer relative group ${unread > 0 ? 'border-primary-400 bg-primary-50' : ''}`}
            onClick={() => setSelectedUserId(conv.userId)}
          >
            <div className="flex items-center justify-between pr-12">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{conv.userName}</span>
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                      {unread} yeni
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {conv.messages[conv.messages.length - 1]?.text?.substring(0, 50)}...
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {conv.messages.length} mesaj
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {conv.messages[conv.messages.length - 1]?.timestamp?.toDate?.()?.toLocaleString('tr-TR') || ''}
              </div>
            </div>
            <button
              onClick={(e) => handleDeleteConversation(e, conv.userId)}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-xl"
              title="Tüm konuşmayı sil"
            >
              🗑️
            </button>
          </Card>
          );
        })
      )}

      {/* Video Call Modal */}
      {activeVideoCall && (
        <JitsiMeetModal
          onClose={() => setActiveVideoCall(null)}
          userName="Admin"
          userId="admin"
          roomId={activeVideoCall.roomId}
        />
      )}
    </div>
  );
}

export default AdminMessages;
