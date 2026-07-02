import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    sendMessage(senderId: string, receiverId: string, productId: string, messageText: string): Promise<{
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
    getConversations(userId: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    getMessages(userId: string, counterpartId: string, productId: string): Promise<{
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
    markAsRead(userId: string, counterpartId: string, productId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
