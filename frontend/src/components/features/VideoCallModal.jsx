import React, { useEffect, useRef, useState } from 'react';
import { collection, addDoc, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Button from '../ui/Button';

function VideoCallModal({ onClose, userId, userName }) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [callId, setCallId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const servers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Kamera ve mikrofon izni al
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // WebRTC peer connection oluştur
      const peerConnection = new RTCPeerConnection(servers);
      peerConnectionRef.current = peerConnection;

      // Local stream'i peer connection'a ekle
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Remote stream için event listener
      peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
        setIsConnecting(false);
      };

      // ICE candidate event
      peerConnection.onicecandidate = async (event) => {
        if (event.candidate && callId) {
          await addDoc(collection(db, 'calls', callId, 'candidates'), {
            candidate: event.candidate.toJSON(),
            type: 'offer'
          });
        }
      };

      // Arama oluştur
      await createCall(peerConnection);

    } catch (err) {
      console.error('Video call initialization error:', err);
      setError('Kamera veya mikrofon erişimi reddedildi. Lütfen izinleri kontrol edin.');
      setIsConnecting(false);
    }
  };

  const createCall = async (peerConnection) => {
    try {
      // Firestore'da call document oluştur
      const callDoc = await addDoc(collection(db, 'calls'), {
        userId,
        userName,
        status: 'waiting',
        createdAt: new Date()
      });
      
      setCallId(callDoc.id);

      // Offer oluştur
      const offerDescription = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type
      };

      await updateDoc(callDoc, { offer });

      // Answer için dinle
      onSnapshot(callDoc, async (snapshot) => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          await peerConnection.setRemoteDescription(answerDescription);
        }
      });

      // Answer ICE candidates için dinle
      onSnapshot(collection(db, 'calls', callDoc.id, 'candidates'), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.type === 'answer') {
              await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          }
        });
      });

    } catch (err) {
      console.error('Call creation error:', err);
      setError('Arama oluşturulamadı.');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const cleanup = async () => {
    // Local stream'i durdur
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Peer connection'ı kapat
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Firestore'dan call'u sil
    if (callId) {
      try {
        await deleteDoc(doc(db, 'calls', callId));
      } catch (err) {
        console.error('Call cleanup error:', err);
      }
    }
  };

  const handleClose = async () => {
    await cleanup();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Görüntülü Görüşme</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-slate-900">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">❌</div>
                <p>{error}</p>
              </div>
            </div>
          ) : isConnecting ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Uzman bekleniyor...</p>
              </div>
            </div>
          ) : null}

          {/* Remote Video (Uzman) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local Video (Siz) - Küçük köşe */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                <span className="text-white text-4xl">👤</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          {isConnected && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              🟢 Bağlı
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-800 flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${
              isMuted ? 'bg-red-500' : 'bg-slate-600'
            } hover:bg-opacity-80 transition-colors`}
          >
            <span className="text-white text-xl">
              {isMuted ? '🔇' : '🎤'}
            </span>
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoOff ? 'bg-red-500' : 'bg-slate-600'
            } hover:bg-opacity-80 transition-colors`}
          >
            <span className="text-white text-xl">
              {isVideoOff ? '📷' : '📹'}
            </span>
          </button>

          <button
            onClick={handleClose}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <span className="text-white text-xl">📞</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCallModal;