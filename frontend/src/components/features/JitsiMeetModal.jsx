import React, { useEffect, useRef } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import api from '../../api/axios';

function JitsiMeetModal({ onClose, userName, userId, roomId }) {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    // Jitsi Meet API script'ini yükle
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = initializeJitsi;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current) return;

    // Oda ID'si - roomId varsa onu kullan, yoksa userId ile oluştur
    const roomName = roomId || `FidBal-Support-${userId}-${Date.now()}`;

    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'settings',
          'videoquality',
          'filmstrip',
          'tileview',
        ],
        DEFAULT_BACKGROUND: '#1e293b',
      },
      userInfo: {
        displayName: userName || 'Kullanıcı',
      },
    };

    const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
    jitsiApiRef.current = api;

    // Event listeners
    api.on('readyToClose', () => {
      onClose();
    });

    api.on('videoConferenceJoined', () => {
      console.log('Video konferans başladı');
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-slate-900 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-white">Görüntülü Görüşme</h3>
            <p className="text-sm text-slate-400">
              Oda: {roomId || 'Bağlanıyor...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl px-3"
            title="Aramayı sonlandır"
          >
            ✕
          </button>
        </div>

        {/* Jitsi Container */}
        <div ref={jitsiContainerRef} className="flex-1" />

        {/* Footer Info */}
        <div className="p-3 bg-slate-800 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            Güvenli bağlantı sağlanmaktadır. Uzman bağlandığında görüşme başlayacaktır.
          </p>
        </div>
      </div>
    </div>
  );
}

export default JitsiMeetModal;