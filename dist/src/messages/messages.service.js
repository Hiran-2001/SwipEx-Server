"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendMessage(senderId, receiverId, productId, messageText) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const receiver = await this.prisma.user.findUnique({
            where: { id: receiverId },
        });
        if (!receiver) {
            throw new common_1.NotFoundException('Receiver not found');
        }
        const message = await this.prisma.message.create({
            data: {
                sender_id: senderId,
                receiver_id: receiverId,
                product_id: productId,
                message: messageText,
            },
            include: {
                sender: {
                    select: { id: true, full_name: true, avatar_url: true },
                },
                receiver: {
                    select: { id: true, full_name: true, avatar_url: true },
                },
                product: {
                    select: { id: true, title: true },
                },
            },
        });
        return {
            success: true,
            message: 'Message sent successfully',
            data: message,
        };
    }
    async getConversations(userId) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { sender_id: userId },
                    { receiver_id: userId },
                ],
            },
            include: {
                sender: {
                    select: { id: true, full_name: true, avatar_url: true },
                },
                receiver: {
                    select: { id: true, full_name: true, avatar_url: true },
                },
                product: {
                    include: {
                        images: { take: 1 },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        const conversationMap = new Map();
        for (const msg of messages) {
            const counterpart = msg.sender_id === userId ? msg.receiver : msg.sender;
            if (!counterpart)
                continue;
            const key = `${msg.product_id}_${counterpart.id}`;
            const isUnread = msg.receiver_id === userId && !msg.is_read;
            if (!conversationMap.has(key)) {
                conversationMap.set(key, {
                    id: key,
                    productId: msg.product_id,
                    product: msg.product,
                    counterpart: counterpart,
                    lastMessage: msg.message,
                    lastMessageAt: msg.created_at,
                    unreadCount: isUnread ? 1 : 0,
                });
            }
            else {
                if (isUnread) {
                    const entry = conversationMap.get(key);
                    entry.unreadCount += 1;
                }
            }
        }
        return {
            success: true,
            data: Array.from(conversationMap.values()),
        };
    }
    async getMessages(userId, counterpartId, productId) {
        const messages = await this.prisma.message.findMany({
            where: {
                product_id: productId,
                OR: [
                    { sender_id: userId, receiver_id: counterpartId },
                    { sender_id: counterpartId, receiver_id: userId },
                ],
            },
            include: {
                sender: {
                    select: { id: true, full_name: true, avatar_url: true },
                },
                receiver: {
                    select: { id: true, full_name: true, avatar_url: true },
                },
            },
            orderBy: {
                created_at: 'asc',
            },
        });
        return {
            success: true,
            data: messages,
        };
    }
    async markAsRead(userId, counterpartId, productId) {
        await this.prisma.message.updateMany({
            where: {
                product_id: productId,
                sender_id: counterpartId,
                receiver_id: userId,
                is_read: false,
            },
            data: {
                is_read: true,
            },
        });
        return {
            success: true,
            message: 'Messages marked as read',
        };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map