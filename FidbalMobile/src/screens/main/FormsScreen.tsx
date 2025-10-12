import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const FormsScreen = () => {
  const [forms, setForms] = useState([]);
  const [submittedForms, setSubmittedForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
    fetchSubmittedForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms/types');
      setForms(response.data.forms);
    } catch (error) {
      console.error('Forms load error:', error);
    }
  };

  const fetchSubmittedForms = async () => {
    try {
      const response = await api.get('/forms/list');
      setSubmittedForms(response.data.forms);
      setLoading(false);
    } catch (error) {
      console.error('Submitted forms error:', error);
      setLoading(false);
    }
  };

  const handleFormPress = async (formUrl, formTitle, formType) => {
    try {
      await Linking.openURL(formUrl);
      
      setTimeout(async () => {
        try {
          await api.post('/forms/submit', {
            formTitle: formTitle,
            formType: formType,
            googleFormUrl: formUrl
          });
          fetchSubmittedForms();
        } catch (error) {
          console.error('Form submit error:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Error opening form:', error);
    }
  };

  const isFormSubmitted = (formId) => {
    return submittedForms.some(f => f.form_type === formId);
  };

  const availableForms = [
    {
      id: 'personal',
      title: 'Kişisel Tanıtıcı Bilgi Formu',
      description: 'Kişisel bilgiler',
      url: 'https://forms.gle/pvbAiodN5Au6savf7',
      icon: 'document-text',
      color: '#3B82F6'
    },
    {
      id: 'stress',
      title: 'Algılanan Stres Ölçeği',
      description: 'Stres değerlendirmesi',
      url: 'https://forms.gle/CmeaiXh6bjJfAxcZ6',
      icon: 'pulse',
      color: '#F97316'
    },
    {
      id: 'nursing',
      title: 'Hemşirelik Eğitim Stresi',
      description: 'Eğitim stresi',
      url: 'https://forms.gle/uJRGR5yr1U32viDk9',
      icon: 'school',
      color: '#A855F7'
    },
    {
      id: 'psqi',
      title: 'Pittsburgh Uyku Kalitesi İndeksi (PUKİ)',
      description: 'Uyku kalitesi',
      url: 'https://forms.gle/Xv2Ku6JjcpoQqZks6',
      icon: 'moon',
      color: '#10B981'
    }
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Formlar</Text>
        <Text style={styles.subtitle}>Değerlendirme ve takip formları</Text>
      </View>

      <View style={styles.content}>
        {availableForms.map((form) => {
          const submitted = isFormSubmitted(form.id);
          return (
            <TouchableOpacity
              key={form.id}
              style={[styles.formCard, submitted && styles.formCardSubmitted]}
              onPress={() => handleFormPress(form.url, form.title, form.id)}
            >
              <View style={styles.formHeader}>
                <View style={[styles.iconContainer, { backgroundColor: form.color + '20' }]}>
                  <Ionicons name={form.icon} size={32} color={form.color} />
                </View>
                {submitted && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              </View>

              <Text style={styles.formTitle}>{form.title}</Text>
              <Text style={styles.formDescription}>{form.description}</Text>

              <View style={[styles.formButton, submitted && styles.formButtonSubmitted]}>
                <Text style={[styles.buttonText, submitted && styles.buttonTextSubmitted]}>
                  {submitted ? 'Formu Yeniden Doldur' : 'Formu Doldur'}
                </Text>
                <Ionicons 
                  name="open-outline" 
                  size={18} 
                  color={submitted ? '#10B981' : '#FFF'} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {submittedForms.length > 0 && (
        <View style={styles.infoBox}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.infoText}>
            {submittedForms.length} form dolduruldu
          </Text>
        </View>
      )}

      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>Neden Form Dolduruyoruz?</Text>
        <Text style={styles.helpText}>
          Bu değerlendirme formları sayesinde uyku kaliteniz ve genel sağlık durumunuz hakkında 
          daha detaylı bilgi edinebilir, uzmanlarımız size daha iyi öneriler sunabilir.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formCardSubmitted: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  formButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  formButtonSubmitted: {
    backgroundColor: '#F0FDF4',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSubmitted: {
    color: '#10B981',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  helpBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default FormsScreen;