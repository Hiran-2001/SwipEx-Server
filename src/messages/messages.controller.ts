import { Controller, Get, Post, Patch, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @CurrentUser() user: any,
    @Body('receiverId', ParseUUIDPipe) receiverId: string,
    @Body('productId', ParseUUIDPipe) productId: string,
    @Body('message') messageText: string,
  ) {
    return this.messagesService.sendMessage(user.id, receiverId, productId, messageText);
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.id);
  }

  @Get('thread')
  async getMessages(
    @CurrentUser() user: any,
    @Query('counterpartId', ParseUUIDPipe) counterpartId: string,
    @Query('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.messagesService.getMessages(user.id, counterpartId, productId);
  }

  @Patch('read')
  async markAsRead(
    @CurrentUser() user: any,
    @Body('counterpartId', ParseUUIDPipe) counterpartId: string,
    @Body('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.messagesService.markAsRead(user.id, counterpartId, productId);
  }
}
