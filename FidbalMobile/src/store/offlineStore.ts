import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from '../services/api';

interface OfflineData {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingRequests: OfflineData[];
  isSyncing: boolean;
  lastSyncTime: number | null;
  addPendingRequest: (request: Omit<OfflineData, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>) => Promise<void>;
  syncPendingRequests: () => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  clearPendingRequests: () => Promise<void>;
  removePendingRequest: (id: string) => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  getPendingCount: () => number;
}

const STORAGE_KEY = 'fidbal_offline_queue';
const MAX_RETRIES = 3;
const SYNC_DELAY = 2000; // Online olunca 2 saniye bekle

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  pendingRequests: [],
  isSyncing: false,
  lastSyncTime: null,

  setOnlineStatus: (isOnline: boolean) => {
    const wasOffline = !get().isOnline;
    set({ isOnline });
    console.log('📡 Network status:', isOnline ? '✅ Online' : '❌ Offline');

    // Offline'dan online'a geçişte bekleyen istekleri gönder
    if (isOnline && wasOffline) {
      console.log('🔄 Online olundu, senkronizasyon başlatılıyor...');
      setTimeout(() => {
        get().syncPendingRequests();
      }, SYNC_DELAY);
    }
  },

  addPendingRequest: async (request) => {
    try {
      const offlineData: OfflineData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: MAX_RETRIES,
        ...request,
      };

      const updatedRequests = [...get().pendingRequests, offlineData];
      set({ pendingRequests: updatedRequests });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
      console.log('💾 Offline request saved:', {
        id: offlineData.id,
        endpoint: offlineData.endpoint,
        method: offlineData.method
      });
    } catch (error) {
      console.error('❌ Save offline request error:', error);
      throw error;
    }
  },

  syncPendingRequests: async () => {
    const { pendingRequests, isOnline, isSyncing } = get();

    if (!isOnline) {
      console.log('⚠️ Offline - senkronizasyon yapılamıyor');
      return;
    }

    if (isSyncing) {
      console.log('⚠️ Zaten senkronizasyon devam ediyor');
      return;
    }

    if (pendingRequests.length === 0) {
      console.log('✅ Senkronize edilecek istek yok');
      return;
    }

    set({ isSyncing: true });
    console.log(`🔄 ${pendingRequests.length} istek senkronize ediliyor...`);

    const failedRequests: OfflineData[] = [];
    let successCount = 0;

    for (const request of pendingRequests) {
      try {
        console.log(`📤 Gönderiliyor: ${request.method} ${request.endpoint}`);

        // API çağrısını yap
        if (request.method === 'POST') {
          await api.post(request.endpoint, request.data);
        } else if (request.method === 'PUT') {
          await api.put(request.endpoint, request.data);
        } else if (request.method === 'DELETE') {
          await api.delete(request.endpoint);
        }

        successCount++;
        console.log(`✅ Başarılı: ${request.endpoint}`);
      } catch (error: any) {
        console.error(`❌ Başarısız: ${request.endpoint}`, error.message);

        // Retry sayısını artır
        const updatedRequest = {
          ...request,
          retryCount: request.retryCount + 1,
        };

        // Max retry'a ulaşmadıysa tekrar dene
        if (updatedRequest.retryCount < updatedRequest.maxRetries) {
          failedRequests.push(updatedRequest);
          console.log(`🔄 Retry ${updatedRequest.retryCount}/${updatedRequest.maxRetries}`);
        } else {
          console.log(`❌ Max retry ulaşıldı, istek siliniyor: ${request.endpoint}`);
        }
      }
    }

    // Başarılı olanları temizle, başarısızları tut
    set({ 
      pendingRequests: failedRequests,
      isSyncing: false,
      lastSyncTime: Date.now()
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(failedRequests));

    console.log(`✅ Senkronizasyon tamamlandı: ${successCount} başarılı, ${failedRequests.length} başarısız`);
  },

  loadPendingRequests: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const requests: OfflineData[] = JSON.parse(stored);
        
        // Eski istekleri temizle (7 günden eski)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const validRequests = requests.filter(req => req.timestamp > sevenDaysAgo);
        
        set({ pendingRequests: validRequests });
        console.log(`✅ ${validRequests.length} bekleyen istek yüklendi (${requests.length - validRequests.length} eski istek temizlendi)`);

        // Eğer eski istek temizlendiyse storage'ı güncelle
        if (validRequests.length !== requests.length) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validRequests));
        }
      }
    } catch (error) {
      console.error('❌ Load pending requests error:', error);
    }
  },

  clearPendingRequests: async () => {
    try {
      set({ pendingRequests: [] });
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('✅ Tüm bekleyen istekler temizlendi');
    } catch (error) {
      console.error('❌ Clear pending requests error:', error);
    }
  },

  removePendingRequest: async (id: string) => {
    try {
      const updatedRequests = get().pendingRequests.filter(req => req.id !== id);
      set({ pendingRequests: updatedRequests });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
      console.log('✅ İstek silindi:', id);
    } catch (error) {
      console.error('❌ Remove pending request error:', error);
    }
  },

  getPendingCount: () => {
    return get().pendingRequests.length;
  },
}));

// Network durumunu dinle
NetInfo.addEventListener((state) => {
  useOfflineStore.getState().setOnlineStatus(state.isConnected ?? false);
});
