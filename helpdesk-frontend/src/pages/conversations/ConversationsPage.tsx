import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    getConversations,
    type Conversation,
} from '../../api/conversations.api';

import {
    getMessages,
    type Message,
} from '../../api/messages.api';

import {
    getChatSocket,
} from '../../socket/chat.socket';

import './ConversationsPage.css';
import CannedResponseModal from './CannedResponseModal';
import useConversationSocket from '../../hooks/useConversationSocket';
import TransferConversationModal from '../../components/conversations/TransferConversationModal';
import useAgentPresence from '../../hooks/useAgentPresence';

export default function ConversationsPage() {
    const [conversations, setConversations] =
        useState<Conversation[]>([]);

    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);

    const [messages, setMessages] =
        useState<Message[]>([]);

    const [cannedModalOpen, setCannedModalOpen] =
        useState(false);

    const [
      transferModalOpen,
      setTransferModalOpen,
    ] = useState(false);

    const [search, setSearch] = useState('');
    const [messageText, setMessageText] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] =
        useState(false);
    const [sending, setSending] = useState(false);

    const [error, setError] = useState('');

    const [
        lastReadConversationId,
        setLastReadConversationId,
    ] = useState<string | null>(null);

    const { statuses: agentStatuses } = useAgentPresence();

    /* =========================
       LOAD CONVERSATIONS
    ========================= */

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getConversations();

            setConversations(data);

            if (data.length > 0) {
                setSelectedConversation((current) => {
                    if (!current) {
                        return data[0];
                    }

                    return (
                        data.find(
                            (item) => item.id === current.id,
                        ) ?? data[0]
                    );
                });
            }
        } catch (error) {
            console.error(error);

            setError(
                'Không thể tải danh sách cuộc hội thoại.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadConversations();
    }, [loadConversations]);

    /* =========================
       LOAD MESSAGES
    ========================= */

    const loadMessages = useCallback(
        async (conversationId: string) => {
            try {
                setLoadingMessages(true);
                setError('');

                const data = await getMessages(
                    conversationId,
                );

                setMessages(data);
            } catch (error) {
                console.error(error);

                setMessages([]);

                setError(
                    'Không thể tải tin nhắn của cuộc hội thoại.',
                );
            } finally {
                setLoadingMessages(false);
            }
        },
        [],
    );

    useEffect(() => {
        if (!selectedConversation?.id) {
            setMessages([]);
            return;
        }

        setMessages([]);

        void loadMessages(
            selectedConversation.id,
        );
    }, [
        selectedConversation?.id,
        loadMessages,
    ]);

    /* =========================
       REALTIME HANDLERS
    ========================= */

    const handleRealtimeMessage = useCallback(
        (newMessage: Message) => {
            if (
                newMessage.conversationId ===
                selectedConversation?.id
            ) {
                setMessages((current) => {
                    const exists = current.some(
                        (message) => message.id === newMessage.id,
                    );
                    if (exists) {
                        return current;
                    }
                    return [...current, newMessage];
                });
            }
        },
        [selectedConversation?.id],
    );

    const handleConversationAssigned = useCallback(async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Không thể refresh conversations:', error);
        }
    }, []);

    const handleConversationClosed = useCallback(
        (data: {
            conversationId: string;
            conversation: Conversation;
        }) => {
            setConversations((current) =>
                current.map((conversation) =>
                    conversation.id === data.conversationId
                        ? {
                              ...conversation,
                              ...data.conversation,
                              status: 'CLOSED',
                          }
                        : conversation,
                ),
            );

            setSelectedConversation((current) => {
                if (!current || current.id !== data.conversationId) {
                    return current;
                }
                return {
                    ...current,
                    ...data.conversation,
                    status: 'CLOSED',
                };
            });
        },
        [],
    );

    const handleConversationTransferred = useCallback(
        async (data: {
            conversationId: string;
            conversation: Conversation;
            fromAgentId: string;
            toAgentId: string;
        }) => {
            setTransferModalOpen(false);

            try {
                const updatedConversations = await getConversations();
                setConversations(updatedConversations);

                const updatedSelected = updatedConversations.find(
                    (conversation) => conversation.id === data.conversationId,
                );

                if (updatedSelected) {
                    setSelectedConversation(updatedSelected);
                } else {
                    setSelectedConversation((current) => {
                        if (current?.id === data.conversationId) {
                            return null;
                        }
                        return current;
                    });
                    setMessages([]);
                }
            } catch (error) {
                console.error(
                    'Không thể refresh conversation sau transfer:',
                    error,
                );
            }
        },
        [],
    );

    const handleMessageRead = useCallback(
        (data: {
            conversationId: string;
        }) => {
            setLastReadConversationId(
                data.conversationId,
            );
        },
        [],
    );

    const {
        connected: socketConnected,
        socketError,
    } = useConversationSocket({
        selectedConversationId:
            selectedConversation?.id ?? null,
        onMessage: handleRealtimeMessage,
        onConversationAssigned: handleConversationAssigned,
        onConversationClosed: handleConversationClosed,
        onConversationTransferred: handleConversationTransferred,
        onMessageRead: handleMessageRead,
    });

    /* =========================
       SEND MESSAGE
    ========================= */

    const handleSendMessage = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (
            !selectedConversation ||
            !messageText.trim() ||
            sending
        ) {
            return;
        }

        if (!socketConnected) {
            setError(
                'Realtime đang mất kết nối. Vui lòng thử lại.',
            );
            return;
        }

        const content =
            messageText.trim();

        try {
            setSending(true);
            setError('');

            const socket =
                getChatSocket();

            socket.emit(
                'message:send',
                {
                    conversationId:
                        selectedConversation.id,
                    content,
                    messageType: 'TEXT',
                },
            );

            setMessageText('');
        } catch (error) {
            console.error(error);

            setError(
                'Không thể gửi tin nhắn.',
            );
        } finally {
            setSending(false);
        }
    };

    /* =========================
       FILTER
    ========================= */

    const filteredConversations =
        conversations.filter((conversation) => {
            const keyword =
                search.trim().toLowerCase();

            if (!keyword) {
                return true;
            }

            const subject =
                conversation.ticket?.subject
                    ?.toLowerCase() ?? '';

            const customer =
                conversation.ticket?.customer?.name
                    ?.toLowerCase() ?? '';

            const email =
                conversation.ticket?.customer?.email
                    ?.toLowerCase() ?? '';

            return (
                subject.includes(keyword) ||
                customer.includes(keyword) ||
                email.includes(keyword)
            );
        });

    const activeCount = conversations.filter(
        (conversation) =>
            conversation.status === 'ACTIVE',
    ).length;

    /* =========================
       UI
    ========================= */

    return (
        <div className="conversations-page">
            {/* HEADER */}

            <div className="conversation-page-header">
                <div className="conversation-heading">
                    <div className="conversation-heading-icon">
                        💬
                    </div>

                    <div>
                        <h1>Conversations</h1>

                        <p>
                            Trò chuyện và hỗ trợ khách hàng
                            theo thời gian thực
                        </p>
                    </div>
                </div>

                <div className="conversation-header-status">
                    <span className="conversation-live-dot" />

                    <strong>
                        {activeCount} cuộc hội thoại
                        đang hoạt động
                    </strong>
                </div>

                <div
                    className={
                        socketConnected
                            ? 'realtime-status online'
                            : 'realtime-status offline'
                    }
                >
                    <span />
                    {socketConnected
                        ? 'Realtime connected'
                        : 'Realtime disconnected'}
                </div>
            </div>

            {socketError && (
                <div className="socket-error-message">
                    ⚠ {socketError}
                </div>
            )}

            {error && (
                <div className="conversation-error">
                    <span>!</span>

                    <div>
                        <strong>Có lỗi xảy ra</strong>
                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            void loadConversations()
                        }
                    >
                        ↻
                    </button>
                </div>
            )}

            {/* CHAT APP */}

            <div className="conversation-app">
                {/* =====================
            LEFT SIDEBAR
        ===================== */}

                <aside className="conversation-list-panel">
                    <div className="conversation-list-header">
                        <div>
                            <h2>Hộp thư</h2>

                            <span>
                                {conversations.length} conversations
                            </span>
                        </div>

                        <button
                            type="button"
                            className="conversation-refresh"
                            onClick={() =>
                                void loadConversations()
                            }
                        >
                            ↻
                        </button>
                    </div>

                    <div className="conversation-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Tìm khách hàng, ticket..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <div className="conversation-filter-tabs">
                        <button className="active">
                            Tất cả
                        </button>

                        <button>
                            Active
                        </button>

                        <button>
                            Closed
                        </button>
                    </div>

                    <div className="conversation-list">
                        {loading ? (
                            <ConversationListLoading />
                        ) : (
                            <>
                                {filteredConversations.map(
                                    (conversation) => (
                                        <button
                                            type="button"
                                            key={conversation.id}
                                            className={`
                        conversation-list-item
                        ${selectedConversation?.id ===
                                                    conversation.id
                                                    ? 'selected'
                                                    : ''
                                                }
                      `}
                                            onClick={() =>
                                                setSelectedConversation(
                                                    conversation,
                                                )
                                            }
                                        >
                                            <div className="conversation-avatar">
                                                {getInitial(
                                                    conversation.ticket
                                                        ?.customer?.name,
                                                )}

                                                {conversation.status ===
                                                    'ACTIVE' && (
                                                        <span className="avatar-online" />
                                                    )}
                                            </div>

                                            <div className="conversation-list-content">
                                                <div className="conversation-name-row">
                                                    <strong>
                                                        {conversation.ticket
                                                            ?.customer?.name ??
                                                            'Khách hàng'}
                                                    </strong>

                                                    <small>
                                                        {formatTime(
                                                            conversation.startedAt,
                                                        )}
                                                    </small>
                                                </div>

                                                <span className="conversation-subject">
                                                    {conversation.ticket
                                                        ?.subject ??
                                                        'Không có tiêu đề'}
                                                </span>

                                                <div className="conversation-list-bottom">
                                                    <span
                                                        className={`
                              conversation-status-small
                              conversation-status-${conversation.status.toLowerCase()}
                            `}
                                                    >
                                                        {conversation.status}
                                                    </span>

                                                    <span className="conversation-ticket-id">
                                                        #
                                                        {conversation.ticketId
                                                            .slice(0, 6)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ),
                                )}

                                {filteredConversations.length ===
                                    0 && (
                                        <div className="conversation-empty-list">
                                            <div>📭</div>

                                            <strong>
                                                Không có cuộc hội thoại
                                            </strong>

                                            <span>
                                                Thử thay đổi từ khóa tìm kiếm
                                            </span>
                                        </div>
                                    )}
                            </>
                        )}
                    </div>
                </aside>

                {/* =====================
            CENTER CHAT
        ===================== */}

                <main className="conversation-chat-panel">
                    {selectedConversation ? (
                        <>
                            {/* CHAT HEADER */}

                            <div className="chat-header">
                                <div className="chat-customer">
                                    <div className="chat-customer-avatar">
                                        {getInitial(
                                            selectedConversation.ticket
                                                ?.customer?.name,
                                        )}

                                        {selectedConversation.status ===
                                            'ACTIVE' && (
                                                <span className="avatar-online" />
                                            )}
                                    </div>

                                    <div>
                                        <strong>
                                            {selectedConversation.ticket
                                                ?.customer?.name ??
                                                'Khách hàng'}
                                        </strong>

                                        <span>
                                            {selectedConversation.status ===
                                                'ACTIVE'
                                                ? '● Đang hoạt động'
                                                : 'Cuộc hội thoại đã đóng'}
                                        </span>
                                    </div>
                                </div>

                                <div className="chat-header-actions">
                                    {selectedConversation?.status ===
                                      'ACTIVE' && (
                                      <button
                                        type="button"
                                        className="conversation-transfer-button"
                                        onClick={() =>
                                          setTransferModalOpen(true)
                                        }
                                      >
                                        <span>⇄</span>
                                        Chuyển Agent
                                      </button>
                                    )}

                                    <button
                                        type="button"
                                        title="Làm mới tin nhắn"
                                        onClick={() =>
                                            void loadMessages(
                                                selectedConversation.id,
                                            )
                                        }
                                    >
                                        ↻
                                    </button>

                                    <button
                                        type="button"
                                        title="Thông tin"
                                    >
                                        ⓘ
                                    </button>
                                </div>
                            </div>

                            {/* TICKET BAR */}

                            <div className="chat-ticket-bar">
                                <div>
                                    <span>🎫</span>

                                    <div>
                                        <small>Ticket</small>

                                        <strong>
                                            {selectedConversation.ticket
                                                ?.subject ??
                                                'Không có tiêu đề'}
                                        </strong>
                                    </div>
                                </div>

                                <span
                                    className={`
                    conversation-status-badge
                    conversation-status-${selectedConversation.status.toLowerCase()}
                  `}
                                >
                                    ● {selectedConversation.status}
                                </span>
                            </div>

                            {/* MESSAGES */}

                            <div className="chat-messages">
                                {loadingMessages ? (
                                    <div className="chat-loading">
                                        <div className="chat-spinner" />

                                        <span>
                                            Đang tải tin nhắn...
                                        </span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="chat-empty">
                                        <div>👋</div>

                                        <h3>
                                            Bắt đầu cuộc trò chuyện
                                        </h3>

                                        <p>
                                            Chưa có tin nhắn trong cuộc
                                            hội thoại này.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="message-list">
                                        {messages.map((message, index) => {
                                            const isLastAgent = message.senderType === 'AGENT' && index === messages.findLastIndex(m => m.senderType === 'AGENT');
                                            
                                            return (
                                                <MessageBubble
                                                    key={message.id}
                                                    message={message}
                                                    lastReadConversationId={
                                                        isLastAgent ? lastReadConversationId : null
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* INPUT */}

                            <form
                                className="chat-input-area"
                                onSubmit={handleSendMessage}
                            >
                                <div className="chat-input-tools">
                                    <button
                                        type="button"
                                        title="Đính kèm file"
                                    >
                                        📎
                                    </button>

                                    <button
                                        type="button"
                                        title="Canned Response"
                                        disabled={
                                            !selectedConversation ||
                                            selectedConversation.status === 'CLOSED'
                                        }
                                        onClick={() =>
                                            setCannedModalOpen(true)
                                        }
                                    >
                                        ⚡
                                    </button>
                                </div>

                                <div className="chat-input-wrapper">
                                    <textarea
                                        placeholder={
                                            selectedConversation.status ===
                                                'CLOSED'
                                                ? 'Cuộc hội thoại đã đóng'
                                                : 'Nhập tin nhắn hỗ trợ...'
                                        }
                                        value={messageText}
                                        onChange={(event) =>
                                            setMessageText(
                                                event.target.value,
                                            )
                                        }
                                        disabled={
                                            sending ||
                                            selectedConversation.status ===
                                            'CLOSED'
                                        }
                                        rows={1}
                                    />

                                    <button
                                        type="submit"
                                        className="send-message-button"
                                        disabled={
                                            sending ||
                                            !messageText.trim() ||
                                            selectedConversation.status ===
                                            'CLOSED'
                                        }
                                    >
                                        {sending ? '...' : '➤'}
                                    </button>
                                </div>

                                <small>
                                    Tin nhắn được gửi với tài khoản
                                    Agent đang đăng nhập.
                                </small>
                            </form>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <div>💬</div>

                            <h2>
                                Chọn một cuộc hội thoại
                            </h2>

                            <p>
                                Chọn khách hàng ở danh sách bên trái
                                để bắt đầu hỗ trợ.
                            </p>
                        </div>
                    )}
                </main>

                {/* =====================
            RIGHT INFORMATION
        ===================== */}

                <aside className="conversation-info-panel">
                    {selectedConversation ? (
                        <>
                            <div className="customer-profile-card">
                                <div className="profile-avatar">
                                    {getInitial(
                                        selectedConversation.ticket
                                            ?.customer?.name,
                                    )}
                                </div>

                                <h3>
                                    {selectedConversation.ticket
                                        ?.customer?.name ??
                                        'Khách hàng'}
                                </h3>

                                <span>
                                    {selectedConversation.ticket
                                        ?.customer?.email ??
                                        'Không có email'}
                                </span>

                                <div
                                    className={`
                    profile-status
                    ${selectedConversation.status ===
                                            'ACTIVE'
                                            ? 'online'
                                            : 'offline'
                                        }
                  `}
                                >
                                    ●{' '}
                                    {selectedConversation.status ===
                                        'ACTIVE'
                                        ? 'Đang hỗ trợ'
                                        : 'Đã đóng'}
                                </div>
                            </div>

                            <div className="conversation-info-section">
                                <h4>Thông tin Ticket</h4>

                                <InfoRow
                                    label="Ticket ID"
                                    value={`#${selectedConversation.ticketId
                                        .slice(0, 8)
                                        .toUpperCase()}`}
                                />

                                <InfoRow
                                    label="Trạng thái"
                                    value={
                                        selectedConversation.ticket
                                            ?.status ?? '---'
                                    }
                                />

                                <InfoRow
                                    label="Bắt đầu"
                                    value={formatDate(
                                        selectedConversation.startedAt,
                                    )}
                                />
                            </div>

                            <div className="conversation-info-section">
                                <h4>Agent phụ trách</h4>

                                {selectedConversation.agent ? (
                                    <div className="conversation-agent">
                                        <div>
                                            {getInitial(
                                                selectedConversation.agent.name,
                                            )}
                                        </div>

                                        <span>
                                            <strong>
                                                {
                                                    selectedConversation.agent
                                                        .name
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    selectedConversation.agent
                                                        .email
                                                }
                                            </small>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="conversation-no-agent">
                                        👤 Chưa có Agent
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="conversation-info-empty">
                            <span>ⓘ</span>

                            <p>
                                Thông tin cuộc hội thoại sẽ hiển thị
                                tại đây.
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            <CannedResponseModal
                open={cannedModalOpen}
                onClose={() =>
                    setCannedModalOpen(false)
                }
                onSelect={(content) => {
                    setMessageText(content);
                }}
            />

            <TransferConversationModal
                open={transferModalOpen}
                conversation={selectedConversation}
                currentAgentId={selectedConversation?.agentId}
                agentStatuses={agentStatuses}
                onClose={() => setTransferModalOpen(false)}
            />
        </div>
    );
}

/* =========================
   MESSAGE
========================= */

function MessageBubble({
    message,
    lastReadConversationId,
}: {
    message: Message;
    lastReadConversationId?: string | null;
}) {
    const isAgent =
        message.senderType === 'AGENT';

    const isSystem =
        message.senderType === 'SYSTEM';

    if (isSystem) {
        return (
            <div className="system-message">
                <span>⚙</span>
                {message.content}
            </div>
        );
    }

    return (
        <div
            className={`
        message-row
        ${isAgent ? 'agent-message-row' : ''}
      `}
        >
            {!isAgent && (
                <div className="message-avatar customer-message-avatar">
                    C
                </div>
            )}

            <div
                className={`
          message-content
          ${isAgent
                        ? 'agent-message'
                        : 'customer-message'
                    }
        `}
            >
                <div className="message-bubble">
                    {message.content}
                </div>

                <span className="message-time">
                    {isAgent ? 'Bạn' : 'Khách hàng'}
                    {' · '}
                    {formatTime(message.createdAt)}
                </span>
                
                {message.senderType === 'AGENT' &&
                  lastReadConversationId ===
                    message.conversationId && (
                    <span className="message-read-status">
                      ✓✓ Đã đọc
                    </span>
                )}
            </div>

            {isAgent && (
                <div className="message-avatar agent-message-avatar">
                    A
                </div>
            )}
        </div>
    );
}

/* =========================
   LOADING
========================= */

function ConversationListLoading() {
    return (
        <div className="conversation-list-loading">
            <div className="chat-spinner" />

            <span>
                Đang tải Conversations...
            </span>
        </div>
    );
}

/* =========================
   INFO
========================= */

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="conversation-info-row">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

/* =========================
   HELPERS
========================= */

function getInitial(
    value?: string | null,
): string {
    if (!value) return '?';

    return value
        .trim()
        .charAt(0)
        .toUpperCase();
}

function formatTime(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}