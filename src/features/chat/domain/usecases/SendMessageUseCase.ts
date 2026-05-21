import { Message, createMessage } from "../entities/Message";
import { ChatRepository } from "../repositories/ChatRepository";

export class SendMessageUseCase {
    constructor(private readonly chatRepository: ChatRepository) {}

    async execute(
        userInput: string,
        history: Message[]
    ): Promise<{ userMessage: Message; assistantMessage: Message}> {

        //Regla del negocio
        if (!userInput.trim()) {
            throw new Error('El mensaje no puede estar vacio');
        }

        const userMessage = createMessage('user', userInput.trim());
        const responseText = await this.chatRepository.sendMessage(userInput, history);
        const assistantMessage = createMessage('assistant', responseText);

        return { userMessage, assistantMessage };
    }
}