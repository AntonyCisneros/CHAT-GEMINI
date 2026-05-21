import { Message } from "../entities/Message";

export interface ChatRepository {
    sendMessage(userMessage: string, history: Message[]): Promise<string>;
}