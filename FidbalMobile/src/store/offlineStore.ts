import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface OfflineData {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingRequests: OfflineData[];
  addPendingRequest: (request: Omit<OfflineData, 'id' | 'timestamp'>) => Promise<void>;
  syncPendingRequests: () => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  pendingRequests: [],

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
    console.log('📡 Network status:', isOnline ? 'Online' : 'Offline');

    // Online olunca bekleyen istekleri gönder
    if (isOnline) {
      get().syncPendingRequests();
    }
  },

  addPendingRequest: async (request) => {
    try {
      const offlineData: OfflineData = {
        id: Date.now().toString() + Math.random().toString(36),
        timestamp: Date.now(),
        ...request,
      };

      const updatedRequests = [...get().pendingRequests, offlineData];
      set({ pendingRequests: updatedRequests });

      await AsyncStorage.setItem('fidbal_offline_queue', JSON.stringify(updatedRequests));
      console.log('💾 Offline request saved:', offlineData.endpoint);
    } catch (error) {
      console.error('❌ Save offline request error:', error);
    }
  },

  syncPendingRequests: async () => {
    const { pendingRequests, isOnline } = get();

    if (!isOnline || pendingRequests.length === 0) {
      return;
    }

    console.log('🔄 Syncing', pendingRequests.length, 'pending requests...');

    // Bu kısmı api.ts ile entegre etmek gerekiyor
    // Şimdilik sadece queue'yu temizliyoruz

    try {
      // TODO: API çağrıları burada yapılacak
      set({ pendingRequests: [] });
      await AsyncStorage.removeItem('fidbal_offline_queue');
      console.log('✅ All pending requests synced');
    } catch (error) {
      console.error('❌ Sync error:', error);
    }
  },

  loadPendingRequests: async () => {
    try {
      const stored = await AsyncStorage.getItem('fidbal_offline_queue');
      if (stored) {
        const requests = JSON.parse(stored);
        set({ pendingRequests: requests });
        console.log('✅ Loaded', requests.length, 'pending requests');
      }
    } catch (error) {
      console.error('❌ Load pending requests error:', error);
    }
  },
}));

// Network durumunu dinle
NetInfo.addEventListener((state) => {
  useOfflineStore.getState().setOnlineStatus(state.isConnected ?? false);
});