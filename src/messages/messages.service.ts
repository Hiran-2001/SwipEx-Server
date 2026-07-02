import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, receiverId: string, productId: string, messageText: string) {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
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

  async getConversations(userId: string) {
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

    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const counterpart = msg.sender_id === userId ? msg.receiver : msg.sender;
      if (!counterpart) continue;

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
      } else {
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

  async getMessages(userId: string, counterpartId: string, productId: string) {
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

  async markAsRead(userId: string, counterpartId: string, productId: string) {
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
}
