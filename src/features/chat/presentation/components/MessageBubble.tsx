import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Markdown from 'react-native-markdown-display';
import { Message } from '../../domain/entities/Message';

const stripMarkdown = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{2}([^*_]+)[*_]{2}/g, '$1')
    .replace(/[*_]([^*_]+)[*_]/g, '$1')
    .replace(/^###\s+/gm, '')
    .replace(/^##\s+/gm, '')
    .replace(/^#\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^[-*_]{3,}$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

interface Props { message: Message; }

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const [speaking, setSpeaking] = useState(false);

  const speakMessage = useCallback(() => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(stripMarkdown(message.content), {
      language: 'es-EC',
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  }, [message.content, speaking]);

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.aiHeader}>
          <View style={styles.aiIconContainer}>
            <MaterialIcons name="auto-awesome" size={16} color="#cebdff" />
          </View>
          <Text style={styles.aiLabel}>Gemini Intelligence</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <Text style={[styles.text, styles.userText]}>
            {message.content}
          </Text>
        ) : (
          <Markdown style={markdownStyles}>
            {message.content}
          </Markdown>
        )}
      </View>
      <View style={[styles.footerRow, isUser ? styles.footerRowUser : styles.footerRowAI]}>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString('es-EC', {
            hour: '2-digit', minute: '2-digit',
          })}
        </Text>
        {!isUser && (
          <TouchableOpacity onPress={speakMessage} activeOpacity={0.6} style={styles.speakBtn}>
            <MaterialIcons
              name={speaking ? 'volume-up' : 'volume-up'}
              size={16}
              color={speaking ? '#cebdff' : '#948e9f'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 6, maxWidth: '85%' },
  userContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  aiContainer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginLeft: 4,
  },
  aiIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(206, 189, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: '#cebdff',
    opacity: 0.85,
  },
  bubble: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  userBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: 'rgba(32, 31, 31, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(206, 189, 255, 0.12)',
    borderBottomLeftRadius: 6,
  },
  text: { fontSize: 16, lineHeight: 24 },
  userText: { color: '#e5e2e1' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  footerRowUser: {
    justifyContent: 'flex-end',
  },
  footerRowAI: {
    justifyContent: 'flex-start',
  },
  timestamp: { fontSize: 10, color: '#948e9f', marginHorizontal: 4 },
  speakBtn: {
    padding: 4,
    marginLeft: 4,
  },
});

const markdownStyles = {
  body: {
    color: '#cbc3d5',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    color: '#e5e2e1',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 8,
  },
  heading2: {
    color: '#e5e2e1',
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 6,
  },
  heading3: {
    color: '#e5e2e1',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 4,
  },
  heading4: {
    color: '#e5e2e1',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#e5e2e1',
  },
  italic: {
    fontStyle: 'italic',
  },
  code_inline: {
    backgroundColor: 'rgba(206, 189, 255, 0.1)',
    color: '#cebdff',
    fontFamily: 'monospace',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#e5e2e1',
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  fence: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#e5e2e1',
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  link: {
    color: '#7cd0ff',
    textDecorationLine: 'underline',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#cebdff',
    paddingLeft: 12,
    marginVertical: 6,
    opacity: 0.8,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    marginVertical: 2,
  },
  paragraph: {
    marginVertical: 4,
  },
  hr: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 1,
    marginVertical: 12,
  },
} as const;
