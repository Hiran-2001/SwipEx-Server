import { MessagesService } from './messages.service';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    sendMessage(user: any, receiverId: string, productId: string, messageText: string): Promise<{
        success: boolean;
        message: string;
        data: {
            product: {
                id: string;
                title: string;
            };
            sender: {
                id: string;
                full_name: string;
                avatar_url: string | null;
            };
            receiver: {
                id: string;
                full_name: string;
                avatar_url: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            message: string;
            product_id: string;
            is_read: boolean;
            sender_id: string;
            receiver_id: string;
        };
    }>;
    getConversations(user: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    getMessages(user: any, counterpartId: string, productId: string): Promise<{
        success: boolean;
        data: ({
            sender: {
                id: string;
                full_name: string;
                avatar_url: string | null;
            };
            receiver: {
                id: string;
                full_name: string;
                avatar_url: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            message: string;
            product_id: string;
            is_read: boolean;
            sender_id: string;
            receiver_id: string;
        })[];
    }>;
    markAsRead(user: any, counterpartId: string, productId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
