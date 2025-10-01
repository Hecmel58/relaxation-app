import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../ui/Card';
import Button from '../ui/Button';

function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    const msgs = allMessages.filter(msg => msg.userId === selectedUserId);
    setMessages(msgs);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{conversations.length}</div>
            <div className="text-sm text-slate-600 mt-1">Toplam Konuşma</div>
          </div>
        </Card>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-slate-600">Henüz mesaj bulunmuyor</p>
          </div>
        </Card>
      ) : (
        conversations.map((conv) => (
          <Card 
            key={conv.userId} 
            className="hover:shadow-md transition-shadow cursor-pointer relative group"
            onClick={() => setSelectedUserId(conv.userId)}
          >
            <div className="flex items-center justify-between pr-12">
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{conv.userName}</div>
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
        ))
      )}
    </div>
  );
}

export default AdminMessages;