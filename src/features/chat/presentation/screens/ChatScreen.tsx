import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { MessageBubble } from '../components/MessageBubble';
import { useChat } from '../hooks/useChat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export const ChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const { isListening, toggleListening } = useSpeechRecognition((text) => {
    setInputText(text);
  });
  const flatListRef = useRef<FlatList>(null);
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleNewChat = () => {
    setMenuVisible(false);
    clearChat();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7} onPress={() => setMenuVisible(true)}>
            <MaterialIcons name="menu" size={24} color="#cbc3d5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gemini</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn} activeOpacity={0.7}>
          <Text style={styles.clearText}>Limpiar</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps='handled'
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='small' color='#cebdff' />
            <Text style={styles.loadingText}>Gemini está escribiendo...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name='error-outline' size={16} color='#f6be41' />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder='Escribe un mensaje...'
            placeholderTextColor='rgba(148, 142, 159, 0.6)'
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={toggleListening}
            activeOpacity={0.6}
          >
            <MaterialIcons
              name='mic'
              size={26}
              color={isListening ? '#110044' : '#948e9f'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name='arrow-upward'
              size={28}
              color={!inputText.trim() || isLoading ? '#8877cc' : '#110044'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          Gemini puede mostrar información inexacta, así que verifica sus respuestas.
        </Text>
      </KeyboardAvoidingView>

      <Modal visible={menuVisible} transparent animationType='fade' onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Menú</Text>
            <TouchableOpacity style={styles.menuItem} onPress={handleNewChat} activeOpacity={0.7}>
              <MaterialIcons name='add-circle-outline' size={22} color='#cbc3d5' />
              <Text style={styles.menuItemText}>Nuevo chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)} activeOpacity={0.7}>
              <MaterialIcons name='close' size={22} color='#cbc3d5' />
              <Text style={styles.menuItemText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(14, 14, 14, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBtn: {
    padding: 8,
    borderRadius: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: -0.5,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    color: '#948e9f',
    fontSize: 13,
    fontWeight: '600',
  },
  messagesList: { padding: 16, paddingBottom: 8 },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  loadingText: { color: '#948e9f', fontSize: 14 },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: 'rgba(246, 190, 65, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(246, 190, 65, 0.15)',
    gap: 8,
  },
  errorText: { color: '#f6be41', fontSize: 13, flex: 1 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: 'rgba(19, 19, 19, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(206, 189, 255, 0.1)',
    borderRadius: 36,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: '#e5e2e1',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 22,
    minHeight: 48,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  micButtonActive: {
    backgroundColor: '#cebdff',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#cebdff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(206, 189, 255, 0.25)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    backgroundColor: '#1c1b1b',
    borderRadius: 24,
    padding: 24,
    width: '75%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e5e2e1',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemText: {
    fontSize: 16,
    color: '#cbc3d5',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(148, 142, 159, 0.5)',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
});
