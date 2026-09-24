import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  getPublicDepartments,
  type Department,
} from '../../api/departments.api';

import {
  connectCustomerSocket,
  destroyCustomerSocket,
} from '../../socket/customer.socket';

import type {
  Message,
} from '../../api/messages.api';

import './CustomerChatPage.css';

type Stage =
  | 'CONNECT'
  | 'START'
  | 'CHAT';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export default function CustomerChatPage() {
  const [stage, setStage] =
    useState<Stage>('CONNECT');

  const [connected, setConnected] =
    useState(false);

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [conversationId, setConversationId] =
    useState('');

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [waiting, setWaiting] =
    useState(false);

  const [assigned, setAssigned] =
    useState(false);

  const [agentName, setAgentName] =
    useState('');

  const [error, setError] =
    useState('');

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [departmentId, setDepartmentId] =
    useState('');

  const [subject, setSubject] =
    useState('');

  const [firstMessage, setFirstMessage] =
    useState('');

  const [input, setInput] =
    useState('');

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket =
      connectCustomerSocket();

    const onConnect = () =>
      setConnected(true);

    const onDisconnect = () =>
      setConnected(false);

    const onReady = () => {
      setConnected(true);
    };

    const onCustomerConnected = (data: {
      customer: Customer;
    }) => {
      setCustomer(data.customer);
      setStage('START');
      setError('');
    };

    const onCreated = (data: {
      conversation: {
        id: string;
      };
      agent?: {
        id: string;
        name: string;
      } | null;
    }) => {
      const newConversationId =
        data.conversation.id;

      setConversationId(
        newConversationId,
      );

      setStage('CHAT');
      setError('');

      /*
       * Hiển thị ngay nội dung
       * Customer nhập lúc tạo Ticket.
       */
      if (firstMessage.trim()) {
        const initialMessage: Message = {
          id: `local-${Date.now()}`,
          conversationId:
            newConversationId,
          senderId:
            customer?.id ?? null,
          senderType: 'CUSTOMER',
          content:
            firstMessage.trim(),
          messageType: 'TEXT',
          createdAt:
            new Date().toISOString(),
        };

        setMessages(
          [initialMessage],
        );
      }

      /*
       * Có Agent ngay khi tạo
       */
      if (data.agent) {
        setAssigned(true);
        setWaiting(false);

        setAgentName(
          data.agent.name,
        );

        return;
      }

      /*
       * Chưa có Agent
       */
      setAssigned(false);
      setWaiting(true);
      setAgentName('');
    };

    const onWaiting = () => {
      setAssigned(false);
      setWaiting(true);
      setAgentName('');
    };

    const onAssigned = (data: {
      agent?: {
        id?: string;
        name?: string;
      };
    }) => {
      setAssigned(true);
      setWaiting(false);

      setAgentName(
        data.agent?.name ??
          'Support Agent',
      );
    };

    const onMessage = (data: {
      message: Message;
    }) => {
      if (!data.message) return;

      setMessages((current) => {
        const exists =
          current.some(
            (message) =>
              message.id ===
              data.message.id,
          );

        if (exists) return current;

        return [
          ...current,
          data.message,
        ];
      });

      if (
        data.message.senderType ===
          'AGENT' &&
        data.message.conversationId
      ) {
        connectCustomerSocket().emit(
          'message:read',
          {
            conversationId:
              data.message.conversationId,
          },
        );
      }
    };

    const onClosed = () => {
      setWaiting(false);

      setError(
        'Cuộc trò chuyện đã kết thúc.',
      );
    };

    const onError = (data: {
      message?: string;
    }) => {
      setError(
        data?.message ??
          'Đã xảy ra lỗi.',
      );
    };

    socket.on(
      'connect',
      onConnect,
    );

    socket.on(
      'disconnect',
      onDisconnect,
    );

    socket.on(
      'customer:ready',
      onReady,
    );

    socket.on(
      'customer:connected',
      onCustomerConnected,
    );

    socket.on(
      'conversation:created',
      onCreated,
    );

    socket.on(
      'conversation:waiting',
      onWaiting,
    );

    socket.on(
      'conversation:assigned',
      onAssigned,
    );

    socket.on(
      'message:new',
      onMessage,
    );

    socket.on(
      'conversation:closed',
      onClosed,
    );

    socket.on(
      'customer:error',
      onError,
    );

    socket.on(
      'chat:error',
      onError,
    );

    socket.on(
      'message:error',
      onError,
    );

    return () => {
      destroyCustomerSocket();
    };
  }, []);

  useEffect(() => {
    if (stage !== 'START') return;

    getPublicDepartments()
      .then(setDepartments)
      .catch(() => {
        setError(
          'Không tải được Department. (Có thể do lỗi authentication, cần API public)',
        );
      });
  }, [stage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const connectCustomer = () => {
    if (!name.trim()) {
      setError(
        'Vui lòng nhập tên.',
      );
      return;
    }

    setError('');

    connectCustomerSocket().emit(
      'customer:connect',
      {
        name: name.trim(),
        email:
          email.trim() ||
          undefined,
        phone:
          phone.trim() ||
          undefined,
      },
    );
  };

  const startChat = () => {
    if (
      !departmentId ||
      !subject.trim()
    ) {
      setError(
        'Chọn Department và nhập chủ đề.',
      );
      return;
    }

    setError('');

    connectCustomerSocket().emit(
      'customer:start-chat',
      {
        departmentId,
        subject:
          subject.trim(),

        message:
          firstMessage.trim() ||
          undefined,
      },
    );
  };

  const sendMessage = () => {
    const content =
      input.trim();

    if (
      !content ||
      !conversationId
    ) {
      return;
    }

    connectCustomerSocket().emit(
      'message:send',
      {
        conversationId,
        content,
        messageType: 'TEXT',
      },
    );

    setInput('');
  };

  return (
    <div className="customer-chat-page">
      <div className="customer-chat-shell">

        <header className="customer-chat-header">
          <div className="customer-chat-logo">
            H
          </div>

          <div>
            <h1>Helpdesk Support</h1>

            <p>
              Hỗ trợ khách hàng trực tuyến
            </p>
          </div>

          <div
            className={
              connected
                ? 'customer-online'
                : 'customer-offline'
            }
          >
            ●{' '}
            {connected
              ? 'Online'
              : 'Offline'}
          </div>
        </header>

        {error && (
          <div className="customer-chat-error">
            ⚠ {error}
          </div>
        )}

        {stage === 'CONNECT' && (
          <section className="customer-form-card">
            <div className="customer-form-icon">
              👋
            </div>

            <h2>
              Xin chào!
            </h2>

            <p>
              Nhập thông tin để bắt đầu
              nhận hỗ trợ.
            </p>

            <label>
              Họ tên *
            </label>

            <input
              value={name}
              placeholder="Nguyễn Văn A"
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
            />

            <label>Email</label>

            <input
              type="email"
              value={email}
              placeholder="email@example.com"
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
            />

            <label>
              Số điện thoại
            </label>

            <input
              value={phone}
              placeholder="09..."
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
            />

            <button
              onClick={
                connectCustomer
              }
            >
              Tiếp tục →
            </button>
          </section>
        )}

        {stage === 'START' && (
          <section className="customer-form-card">
            <div className="customer-form-icon purple">
              🎧
            </div>

            <h2>
              Bạn cần hỗ trợ gì?
            </h2>

            <p>
              Chào {customer?.name}
            </p>

            <label>
              Bộ phận *
            </label>

            <select
              value={departmentId}
              onChange={(event) =>
                setDepartmentId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Chọn Department
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={
                      department.id
                    }
                    value={
                      department.id
                    }
                  >
                    {department.name}
                  </option>
                ),
              )}
            </select>

            <label>
              Chủ đề *
            </label>

            <input
              value={subject}
              placeholder="Ví dụ: Không đăng nhập được"
              onChange={(event) =>
                setSubject(
                  event.target.value,
                )
              }
            />

            <label>
              Nội dung
            </label>

            <textarea
              value={firstMessage}
              placeholder="Mô tả vấn đề của bạn..."
              onChange={(event) =>
                setFirstMessage(
                  event.target.value,
                )
              }
            />

            <button
              onClick={startChat}
            >
              💬 Bắt đầu Chat
            </button>
          </section>
        )}

        {stage === 'CHAT' && (
          <section className="customer-conversation">
            <div className="customer-conversation-top">
              <div className="support-avatar">
                🎧
              </div>

              <div>
                <strong>
                  {assigned
                    ? agentName ||
                      'Support Agent'
                    : 'Đang tìm Agent...'}
                </strong>

                <p>
                  {assigned
                    ? 'Agent đang hỗ trợ bạn'
                    : 'Vui lòng chờ trong giây lát'}
                </p>
              </div>

              <span
                className={
                  assigned
                    ? 'assigned-badge'
                    : 'waiting-badge'
                }
              >
                {assigned
                  ? '● CONNECTED'
                  : '● WAITING'}
              </span>
            </div>

            <div className="customer-messages">
              {!assigned && (
                <div className="waiting-agent-card">
                  <span>⏳</span>

                  <div>
                    <strong>
                      Đang kết nối Agent
                    </strong>

                    <p>
                      Hệ thống đang tìm nhân viên
                      phù hợp với yêu cầu của bạn.
                    </p>
                  </div>
                </div>
              )}

              {messages.map(
                (message) => (
                  <div
                    key={message.id}
                    className={
                      message.senderType ===
                      'CUSTOMER'
                        ? 'customer-message-row mine'
                        : 'customer-message-row'
                    }
                  >
                    <div className="customer-message-bubble">
                      {message.content}
                    </div>
                  </div>
                ),
              )}

              <div ref={bottomRef} />
            </div>

            <div className="customer-message-input">
              <input
                value={input}
                placeholder={
                  waiting
                    ? 'Bạn vẫn có thể gửi tin nhắn...'
                    : 'Nhập tin nhắn...'
                }
                onChange={(event) =>
                  setInput(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={
                  sendMessage
                }
              >
                ➤
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
