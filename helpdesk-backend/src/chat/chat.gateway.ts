import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { RedisService } from '../redis/redis.service';
import { AssignmentService } from './assignment.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly redisService: RedisService,
    private readonly assignmentService: AssignmentService,
  ) { }

  private getAgentSocketsKey(agentId: string) {
    return `presence:agent:${agentId}:sockets`;
  }

  private async addAgentSocket(
    agentId: string,
    socketId: string,
  ) {
    const redis =
      this.redisService.getClient();

    const key =
      this.getAgentSocketsKey(agentId);

    await redis.sadd(key, socketId);

    return redis.scard(key);
  }

  private async removeAgentSocket(
    agentId: string,
    socketId: string,
  ) {
    const redis =
      this.redisService.getClient();

    const key =
      this.getAgentSocketsKey(agentId);

    await redis.srem(key, socketId);

    const remainingSockets =
      await redis.scard(key);

    if (remainingSockets === 0) {
      await redis.del(key);
    }

    return remainingSockets;
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (token) {
        const payload =
          await this.jwtService.verifyAsync(token, {
            secret:
              process.env.JWT_SECRET ||
              'helpdesk-secret-key',
          });

        const user =
          await this.prisma.user.findUnique({
            where: {
              id: payload.sub,
            },
          });

        if (!user) {
          client.emit('auth:error', {
            message: 'User không tồn tại',
          });

          client.disconnect();
          return;
        }

        if (user.status !== 'ACTIVE') {
          client.emit('auth:error', {
            message: 'Tài khoản đã bị khóa',
          });

          client.disconnect();
          return;
        }

        if (user.role !== 'AGENT') {
          client.emit('auth:error', {
            message:
              'Chỉ Agent được phép kết nối Chat Server',
          });

          client.disconnect();
          return;
        }

        client.data.type = 'AGENT';

        client.data.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        await client.join(`agent:${user.id}`);

        const socketCount =
          await this.addAgentSocket(
            user.id,
            client.id,
          );

        if (socketCount === 1) {

          await this.prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isOnline: true,
            },
          });

          this.server.emit('agent:status', {
            agentId: user.id,
            status: 'ONLINE',
          });

          const waitingAssignment =
            await this.assignmentService
              .assignWaitingConversation(
                user.id,
              );

          if (waitingAssignment) {
            const waitingRoom =
              `conversation:${waitingAssignment.conversation.id}`;

            // Agent vừa online tham gia room
            await client.join(waitingRoom);

            // Thông báo riêng cho Agent
            client.emit(
              'conversation:assigned',
              {
                conversationId:
                  waitingAssignment
                    .conversation.id,

                ticketId:
                  waitingAssignment
                    .ticket.id,

                conversation:
                  waitingAssignment
                    .conversation,

                ticket:
                  waitingAssignment.ticket,

                agent:
                  waitingAssignment.agent,
              },
            );

            // Customer đã join room từ lúc
            // customer:start-chat nên sẽ nhận event này
            client
              .to(waitingRoom)
              .emit(
                'conversation:assigned',
                {
                  conversationId:
                    waitingAssignment
                      .conversation.id,

                  ticketId:
                    waitingAssignment
                      .ticket.id,

                  agent:
                    waitingAssignment.agent,
                },
              );

            console.log(
              `[Socket] Waiting conversation ${waitingAssignment.conversation.id} assigned to Agent ${user.email}`,
            );
          }
        }

        const activeConversations =
          await this.prisma.conversation.findMany({
            where: {
              agentId: user.id,
              status: 'ACTIVE',
            },

            select: {
              id: true,
            },
          });

        for (
          const conversation
          of activeConversations
        ) {
          await client.join(
            `conversation:${conversation.id}`,
          );
        }

        console.log(
          `[Socket] Agent ${user.email} connected (Active sockets: ${socketCount})`,
        );

        client.emit('connection:success', {
          message:
            'Kết nối Chat Server thành công',
          socketId: client.id,
          type: 'AGENT',
          user: client.data.user,
          activeSockets: socketCount,
          activeConversations:
            activeConversations.length,
        });

        return;
      }

      client.data.type = 'CUSTOMER_PENDING';

      console.log(
        `[Socket] Customer socket connected: ${client.id}`,
      );

      client.emit('customer:ready', {
        message:
          'Socket Customer sẵn sàng',
        socketId: client.id,
      });
    } catch (error) {
      console.error(
        '[Socket] Authentication failed:',
        error,
      );

      client.emit('auth:error', {
        message: 'JWT không hợp lệ',
      });

      client.disconnect();
    }
  }

  @SubscribeMessage('customer:connect')
  async handleCustomerConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      name: string;
      email?: string;
      phone?: string;
    },
  ) {
    try {
      if (
        client.data.type !==
        'CUSTOMER_PENDING'
      ) {
        client.emit('customer:error', {
          message:
            'Socket này không phải Customer',
        });

        return;
      }

      const customer =
        await this.chatService.connectCustomer(
          data,
        );

      if (!customer) {
        client.emit('customer:error', {
          message:
            'Không thể xác định Customer',
        });

        return;
      }

      client.data.type = 'CUSTOMER';

      client.data.customer = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      };

      console.log(
        `[Socket] Customer ${customer.id} connected`,
      );

      client.emit('customer:connected', {
        message:
          'Customer kết nối thành công',
        socketId: client.id,
        customer: client.data.customer,
      });
    } catch (error) {
      console.error(
        '[Socket] Customer connection error:',
        error,
      );

      client.emit('customer:error', {
        message:
          error instanceof Error
            ? error.message
            : 'Không thể kết nối Customer',
      });
    }
  }

  @SubscribeMessage('customer:start-chat')
  async handleStartChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      departmentId: string;
      subject: string;
      message?: string;
    },
  ) {
    try {
      if (
        client.data.type !== 'CUSTOMER' ||
        !client.data.customer
      ) {
        client.emit('chat:error', {
          message:
            'Customer chưa được xác thực',
        });

        return;
      }

      if (!data?.departmentId) {
        client.emit('chat:error', {
          message:
            'departmentId là bắt buộc',
        });

        return;
      }

      if (!data?.subject?.trim()) {
        client.emit('chat:error', {
          message:
            'subject là bắt buộc',
        });

        return;
      }

      const result =
        await this.chatService.startChat({
          customerId:
            client.data.customer.id,
          departmentId: data.departmentId,
          subject: data.subject.trim(),
          message: data.message?.trim(),
        });

      const room =
        `conversation:${result.conversation.id}`;

      await client.join(room);

      console.log(
        `[Socket] Customer ${client.data.customer.id} joined ${room}`,
      );

      client.emit('conversation:created', {
        ticket: result.ticket,
        conversation: result.conversation,
        agent: result.agent,
      });

      if (result.agent) {
        const agentRoom =
          `agent:${result.agent.id}`;

        const agentSockets =
          await this.server
            .in(agentRoom)
            .fetchSockets();

        for (const agentSocket of agentSockets) {
          await agentSocket.join(room);

          agentSocket.emit(
            'conversation:assigned',
            {
              conversationId:
                result.conversation.id,
              ticketId:
                result.ticket.id,
              agent: result.agent,
            },
          );

          console.log(
            `[Socket] Agent ${result.agent.id} joined ${room}`,
          );
        }

        client.emit(
          'conversation:assigned',
          {
            conversationId:
              result.conversation.id,
            ticketId:
              result.ticket.id,
            agent: result.agent,
          },
        );

        console.log(
          `[Socket] Conversation ${result.conversation.id} assigned to Agent ${result.agent.id}`,
        );
      } else {
        client.emit(
          'conversation:waiting',
          {
            conversationId:
              result.conversation.id,
            message:
              'Hiện chưa có Agent online. Vui lòng chờ.',
          },
        );

        console.log(
          `[Socket] Conversation ${result.conversation.id} is waiting for Agent`,
        );
      }
    } catch (error) {
      console.error(
        '[Socket] Start chat error:',
        error,
      );

      client.emit('chat:error', {
        message:
          error instanceof Error
            ? error.message
            : 'Không thể bắt đầu cuộc trò chuyện',
      });
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    },
  ) {
    try {
      if (
        client.data.type !== 'AGENT' &&
        client.data.type !== 'CUSTOMER'
      ) {
        client.emit('message:error', {
          message:
            'Socket chưa được xác thực',
        });

        return;
      }

      if (!data?.conversationId) {
        client.emit('message:error', {
          message:
            'conversationId là bắt buộc',
        });

        return;
      }

      if (!data?.content?.trim()) {
        client.emit('message:error', {
          message:
            'Nội dung tin nhắn không được để trống',
        });

        return;
      }

      let senderType:
        | 'AGENT'
        | 'CUSTOMER';

      let senderId: string;

      if (client.data.type === 'AGENT') {
        senderType = 'AGENT';
        senderId = client.data.user.id;
      } else {
        senderType = 'CUSTOMER';
        senderId =
          client.data.customer.id;
      }

      const result =
        await this.messagesService.create(
          data.conversationId,
          {
            senderType,
            senderId,
            content: data.content.trim(),
            messageType:
              data.messageType ?? 'TEXT',
          },
        );

      const room =
        `conversation:${data.conversationId}`;

      this.server
        .to(room)
        .emit('message:new', {
          message: result.data,
        });

      if (result.ticketStatusChanged) {
        this.server
          .to(room)
          .emit('ticket:status', {
            conversationId: data.conversationId,
            status: result.ticketStatus,
          });
      }

      console.log(
        `[Socket] ${senderType} ${senderId} sent message in ${room}`,
      );
    } catch (error) {
      console.error(
        '[Socket] Send message error:',
        error,
      );

      client.emit('message:error', {
        message:
          error instanceof Error
            ? error.message
            : 'Không thể gửi Message',
      });
    }
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
    },
  ) {
    try {
      if (
        client.data.type !== 'AGENT' &&
        client.data.type !== 'CUSTOMER'
      ) {
        client.emit('message:error', {
          message: 'Socket chưa được xác thực',
        });

        return;
      }

      if (!data?.conversationId) {
        client.emit('message:error', {
          message: 'conversationId là bắt buộc',
        });

        return;
      }

      const conversation =
        await this.prisma.conversation.findUnique({
          where: {
            id: data.conversationId,
          },
        });

      if (!conversation) {
        client.emit('message:error', {
          message: 'Conversation không tồn tại',
        });

        return;
      }

      const userId =
        client.data.type === 'AGENT'
          ? client.data.user.id
          : client.data.customer.id;

      if (
        client.data.type === 'AGENT' &&
        conversation.agentId !== userId
      ) {
        client.emit('message:error', {
          message:
            'Agent không được phân công Conversation này',
        });

        return;
      }

      if (
        client.data.type === 'CUSTOMER' &&
        conversation.customerId !== userId
      ) {
        client.emit('message:error', {
          message:
            'Customer không thuộc Conversation này',
        });

        return;
      }

      const result =
        await this.messagesService.markAsRead(
          data.conversationId,
        );

      const room =
        `conversation:${data.conversationId}`;

      this.server.to(room).emit('message:read:update', {
        conversationId: data.conversationId,
        readerType: client.data.type,
        readerId: userId,
        updatedCount: result.updatedCount,
      });

      console.log(
        `[Socket] ${client.data.type} ${userId} read messages in ${room}`,
      );
    } catch (error) {
      console.error(
        '[Socket] Mark message read error:',
        error,
      );

      client.emit('message:error', {
        message:
          error instanceof Error
            ? error.message
            : 'Không thể đánh dấu Message đã đọc',
      });
    }
  }

  @SubscribeMessage('conversation:close')
  async handleCloseConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
    },
  ) {
    try {
      if (client.data.type !== 'AGENT') {
        client.emit('conversation:error', {
          message: 'Chỉ Agent được phép đóng Conversation',
        });

        return;
      }

      if (!data?.conversationId) {
        client.emit('conversation:error', {
          message: 'conversationId là bắt buộc',
        });

        return;
      }

      const conversation =
        await this.prisma.conversation.findUnique({
          where: {
            id: data.conversationId,
          },
        });

      if (!conversation) {
        client.emit('conversation:error', {
          message: 'Conversation không tồn tại',
        });

        return;
      }

      if (
        conversation.agentId !==
        client.data.user.id
      ) {
        client.emit('conversation:error', {
          message:
            'Bạn không được phân công Conversation này',
        });

        return;
      }

      if (conversation.status === 'CLOSED') {
        client.emit('conversation:error', {
          message: 'Conversation đã được đóng',
        });

        return;
      }

      const result =
        await this.conversationsService.close(
          data.conversationId,
        );

      const room =
        `conversation:${data.conversationId}`;

      this.server.to(room).emit(
        'conversation:closed',
        {
          conversationId:
            data.conversationId,
          conversation:
            result.conversation,
        },
      );

      console.log(
        `[Socket] Agent ${client.data.user.id} closed ${room}`,
      );
    } catch (error) {
      console.error(
        '[Socket] Close conversation error:',
        error,
      );

      client.emit('conversation:error', {
        message:
          error instanceof Error
            ? error.message
            : 'Không thể đóng Conversation',
      });
    }
  }

  @SubscribeMessage('conversation:transfer')
  async handleTransferConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      targetAgentId: string;
    },
  ) {
    try {
      if (client.data.type !== 'AGENT') {
        client.emit('conversation:error', {
          message: 'Chỉ Agent được phép chuyển Conversation',
        });
        return;
      }

      if (
        !data?.conversationId ||
        !data?.targetAgentId
      ) {
        client.emit('conversation:error', {
          message:
            'conversationId và targetAgentId là bắt buộc',
        });
        return;
      }

      const conversation =
        await this.prisma.conversation.findUnique({
          where: {
            id: data.conversationId,
          },
          include: {
            ticket: true,
          },
        });

      if (!conversation) {
        client.emit('conversation:error', {
          message: 'Conversation không tồn tại',
        });
        return;
      }

      if (conversation.status === 'CLOSED') {
        client.emit('conversation:error', {
          message: 'Không thể chuyển Conversation đã đóng',
        });
        return;
      }

      if (
        conversation.agentId !==
        client.data.user.id
      ) {
        client.emit('conversation:error', {
          message:
            'Bạn không được phân công Conversation này',
        });
        return;
      }

      if (
        data.targetAgentId ===
        client.data.user.id
      ) {
        client.emit('conversation:error', {
          message:
            'Không thể chuyển Conversation cho chính mình',
        });
        return;
      }

      const targetAgent =
        await this.prisma.user.findUnique({
          where: {
            id: data.targetAgentId,
          },
          include: {
            agentDepartments: true,
          },
        });

      if (!targetAgent) {
        client.emit('conversation:error', {
          message: 'Agent nhận không tồn tại',
        });
        return;
      }

      if (targetAgent.role !== 'AGENT') {
        client.emit('conversation:error', {
          message: 'User được chọn không phải Agent',
        });
        return;
      }

      if (targetAgent.status !== 'ACTIVE') {
        client.emit('conversation:error', {
          message: 'Agent nhận đang bị khóa',
        });
        return;
      }

      const redis =
        this.redisService.getClient();

      const targetSocketCount =
        await redis.scard(
          this.getAgentSocketsKey(
            targetAgent.id,
          ),
        );

      if (targetSocketCount === 0) {
        client.emit(
          'conversation:error',
          {
            message:
              'Agent nhận đang Offline',
          },
        );

        return;
      }

      const belongsToDepartment =
        targetAgent.agentDepartments.some(
          (item) =>
            item.departmentId ===
            conversation.ticket.departmentId,
        );

      if (!belongsToDepartment) {
        client.emit('conversation:error', {
          message:
            'Agent nhận không thuộc Department của Conversation',
        });
        return;
      }

      const updatedConversation =
        await this.prisma.conversation.update({
          where: {
            id: data.conversationId,
          },
          data: {
            agentId: targetAgent.id,
          },
          include: {
            customer: true,
            agent: true,
            ticket: true,
          },
        });

      await this.prisma.ticket.update({
        where: {
          id: conversation.ticketId,
        },
        data: {
          assignedAgentId: targetAgent.id,
          status: 'IN_PROGRESS',
        },
      });

      const room =
        `conversation:${data.conversationId}`;

      // Agent hiện tại rời room
      client.leave(room);

      // Tìm socket của Agent mới
      const targetSockets =
        await this.server
          .in(`agent:${targetAgent.id}`)
          .fetchSockets();

      for (const socket of targetSockets) {
        socket.join(room);

        socket.emit(
          'conversation:transferred',
          {
            conversationId:
              data.conversationId,
            conversation:
              updatedConversation,
            fromAgentId:
              client.data.user.id,
            toAgentId:
              targetAgent.id,
          },
        );
      }

      // Thông báo cho customer và các socket còn lại
      this.server
        .to(room)
        .emit('conversation:transferred', {
          conversationId:
            data.conversationId,
          conversation:
            updatedConversation,
          fromAgentId:
            client.data.user.id,
          toAgentId:
            targetAgent.id,
        });

      // Thông báo riêng cho Agent cũ
      client.emit(
        'conversation:transferred',
        {
          conversationId:
            data.conversationId,
          conversation:
            updatedConversation,
          fromAgentId:
            client.data.user.id,
          toAgentId:
            targetAgent.id,
        },
      );

      console.log(
        `[Socket] Conversation ${data.conversationId} transferred from ${client.data.user.id} to ${targetAgent.id}`,
      );
    } catch (error) {
      console.error(
        '[Socket] Transfer conversation error:',
        error,
      );

      client.emit('conversation:error', {
        message:
          error instanceof Error
            ? error.message
            : 'Không thể chuyển Conversation',
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    if (
      client.data.type !== 'AGENT' &&
      client.data.type !== 'CUSTOMER'
    ) {
      return;
    }

    client.emit('pong', {
      message: 'pong',
      data,
      socketId: client.id,
    });
  }

  async handleDisconnect(
    client: Socket,
  ) {
    if (
      client.data.type === 'AGENT'
    ) {
      const user = client.data.user;

      if (!user) {
        return;
      }

      try {
        const remainingSockets =
          await this.removeAgentSocket(
            user.id,
            client.id,
          );

        if (remainingSockets === 0) {
          await this.prisma.user.update({
            where: {
              id: user.id,
            },

            data: {
              isOnline: false,
            },
          });

          this.server.emit(
            'agent:status',
            {
              agentId: user.id,
              status: 'OFFLINE',
            },
          );

          console.log(
            `[Socket] Agent ${user.email} offline`,
          );
        } else {
          console.log(
            `[Socket] Agent ${user.email} disconnected one socket. Remaining: ${remainingSockets}`,
          );
        }
      } catch (error) {
        console.error(
          '[Socket] Agent disconnect error:',
          error,
        );
      }

      return;
    }

    if (
      client.data.type === 'CUSTOMER'
    ) {
      console.log(
        `[Socket] Customer ${client.data.customer?.id} disconnected`,
      );

      return;
    }

    console.log(
      `[Socket] Pending socket disconnected: ${client.id}`,
    );
  }
}