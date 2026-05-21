export type MessageRole = 'user' | 'assistant';

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
}

export const createMessage = (
    role: MessageRole,
    content: string
): Message => ({
    id: Date.now().toString(),
    role,
    content,
    timestamp: new Date(),
})