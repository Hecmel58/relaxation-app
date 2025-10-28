import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

class ChatService {
  async getOrCreateChatRoom(userId, expertId) {
    const chatRoomsRef = collection(db, 'chatRooms');
    const q = query(
      chatRoomsRef,
      where('userId', '==', userId),
      where('expertId', '==', expertId)
    );

    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    const newRoom = await addDoc(chatRoomsRef, {
      userId,
      expertId,
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: 0
    });

    return newRoom.id;
  }

  async sendMessage(roomId, senderId, senderType, message) {
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    
    await addDoc(messagesRef, {
      senderId,
      senderType,
      message,
      timestamp: serverTimestamp(),
      read: false
    });

    const roomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(roomRef, {
      lastMessage: message,
      lastMessageAt: serverTimestamp()
    });
  }

  subscribeToMessages(roomId, callback) {
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  }

  async getUserChatRooms(userId) {
    const chatRoomsRef = collection(db, 'chatRooms');
    const q = query(
      chatRoomsRef,
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async markMessagesAsRead(roomId, userId) {
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
  }
}

export default new ChatService();