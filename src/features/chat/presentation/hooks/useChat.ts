import { useCallback, useState } from 'react';
import { ChatRepositoryImpl } from '../../data/repositories/ChatRepositoryImpl';
import { Message } from '../../domain/entities/Message';
import { SendMessageUseCase } from '../../domain/usecases/SendMessageUseCase';

// Inyección de dependencias: el hook construye el grafo de objetos
const sendMessageUseCase = new SendMessageUseCase(new ChatRepositoryImpl());

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userInput: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { userMessage, assistantMessage } =
        await sendMessageUseCase.execute(userInput, messages);
      setMessages(prev => [...prev, userMessage, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
};
