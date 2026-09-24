import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    assignTicket,
    getTicketById,
    updateTicket,
    type Ticket,
    type TicketPriority,
    type TicketStatus,
} from '../../api/tickets.api';

import {
    getAgents,
    type Agent,
} from '../../api/agents.api';

import './TicketDetailPage.css';

export default function TicketDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadData = useCallback(async () => {
        if (!id) {
            setError('Không tìm thấy Ticket ID.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const [ticketData, agentData] = await Promise.all([
                getTicketById(id),
                getAgents(),
            ]);

            setTicket(ticketData);

            setAgents(
                agentData.filter(
                    (agent) =>
                        agent.role === 'AGENT' &&
                        agent.status === 'ACTIVE',
                ),
            );
        } catch (error) {
            console.error(error);
            setError('Không thể tải thông tin Ticket.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const showSuccess = (message: string) => {
        setSuccess(message);

        window.setTimeout(() => {
            setSuccess('');
        }, 2500);
    };

    const handleStatusChange = async (
        status: TicketStatus,
    ) => {
        if (!ticket) return;

        try {
            setSaving(true);
            setError('');

            const updated = await updateTicket(ticket.id, {
                status,
            });

            setTicket((current) =>
                current
                    ? {
                        ...current,
                        ...updated,
                    }
                    : current,
            );

            showSuccess('Đã cập nhật trạng thái Ticket.');
        } catch (error) {
            console.error(error);
            setError('Không thể cập nhật trạng thái.');
        } finally {
            setSaving(false);
        }
    };

    const handlePriorityChange = async (
        priority: TicketPriority,
    ) => {
        if (!ticket) return;

        try {
            setSaving(true);
            setError('');

            const updated = await updateTicket(ticket.id, {
                priority,
            });

            setTicket((current) =>
                current
                    ? {
                        ...current,
                        ...updated,
                    }
                    : current,
            );

            showSuccess('Đã cập nhật độ ưu tiên.');
        } catch (error) {
            console.error(error);
            setError('Không thể cập nhật độ ưu tiên.');
        } finally {
            setSaving(false);
        }
    };

    const handleAssignAgent = async (
        agentId: string,
    ) => {
        if (!ticket || !agentId) return;

        try {
            setSaving(true);
            setError('');

            await assignTicket(ticket.id, agentId);

            // Load lại để lấy đầy đủ assignedAgent
            await loadData();

            showSuccess('Đã phân công Agent thành công.');
        } catch (error) {
            console.error(error);

            setError(
                'Không thể phân công Agent. Hãy kiểm tra Agent có thuộc phòng ban của Ticket hay không.',
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="ticket-detail-loading">
                <div className="detail-spinner" />
                <span>Đang tải Ticket...</span>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="ticket-not-found">
                <div>🎫</div>

                <h2>Không tìm thấy Ticket</h2>

                <p>
                    Ticket có thể không tồn tại hoặc bạn không có
                    quyền truy cập.
                </p>

                <button onClick={() => navigate('/tickets')}>
                    ← Quay lại Tickets
                </button>
            </div>
        );
    }

    return (
        <div className="ticket-detail-page">
            {/* HEADER */}

            <div className="ticket-detail-header">
                <div>
                    <button
                        type="button"
                        className="back-ticket-button"
                        onClick={() => navigate('/tickets')}
                    >
                        ← Tickets
                    </button>

                    <div className="detail-title">
                        <div className="detail-ticket-icon">
                            🎫
                        </div>

                        <div>
                            <div className="detail-id">
                                #{ticket.id.slice(0, 8).toUpperCase()}
                            </div>

                            <h1>{ticket.subject}</h1>
                        </div>
                    </div>
                </div>

                <StatusBadge status={ticket.status} />
            </div>

            {/* MESSAGE */}

            {error && (
                <div className="detail-alert detail-alert-error">
                    <span>!</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="detail-alert detail-alert-success">
                    <span>✓</span>
                    {success}
                </div>
            )}

            {/* CONTENT */}

            <div className="ticket-detail-grid">
                {/* LEFT */}

                <div className="ticket-detail-main">
                    <section className="detail-card">
                        <div className="detail-card-header">
                            <div>
                                <h2>Thông tin Ticket</h2>
                                <p>
                                    Thông tin tổng quan của yêu cầu hỗ trợ
                                </p>
                            </div>

                            <span className="detail-card-icon">
                                📋
                            </span>
                        </div>

                        <div className="ticket-information-grid">
                            <InformationItem
                                label="Tiêu đề"
                                value={ticket.subject}
                            />

                            <InformationItem
                                label="Phòng ban"
                                value={
                                    ticket.department?.name ??
                                    'Chưa xác định'
                                }
                            />

                            <InformationItem
                                label="Ngày tạo"
                                value={formatDateTime(
                                    ticket.createdAt,
                                )}
                            />

                            <InformationItem
                                label="Cập nhật lần cuối"
                                value={formatDateTime(
                                    ticket.updatedAt,
                                )}
                            />
                        </div>
                    </section>

                    {/* STATUS */}

                    <section className="detail-card">
                        <div className="detail-card-header">
                            <div>
                                <h2>Trạng thái xử lý</h2>

                                <p>
                                    Cập nhật tiến trình của Ticket
                                </p>
                            </div>

                            <span className="detail-card-icon purple">
                                ⚡
                            </span>
                        </div>

                        <div className="detail-status-options">
                            <StatusOption
                                status="OPEN"
                                label="Open"
                                description="Ticket mới"
                                icon="📨"
                                current={ticket.status}
                                disabled={saving}
                                onClick={handleStatusChange}
                            />

                            <StatusOption
                                status="IN_PROGRESS"
                                label="In Progress"
                                description="Đang xử lý"
                                icon="⚡"
                                current={ticket.status}
                                disabled={saving}
                                onClick={handleStatusChange}
                            />

                            <StatusOption
                                status="WAITING"
                                label="Waiting"
                                description="Đang chờ"
                                icon="⏳"
                                current={ticket.status}
                                disabled={saving}
                                onClick={handleStatusChange}
                            />

                            <StatusOption
                                status="RESOLVED"
                                label="Resolved"
                                description="Đã giải quyết"
                                icon="✓"
                                current={ticket.status}
                                disabled={saving}
                                onClick={handleStatusChange}
                            />

                            <StatusOption
                                status="CLOSED"
                                label="Closed"
                                description="Đã đóng"
                                icon="🔒"
                                current={ticket.status}
                                disabled={saving}
                                onClick={handleStatusChange}
                            />
                        </div>
                    </section>

                    {/* PRIORITY */}

                    <section className="detail-card">
                        <div className="detail-card-header">
                            <div>
                                <h2>Mức độ ưu tiên</h2>

                                <p>
                                    Điều chỉnh độ ưu tiên xử lý
                                </p>
                            </div>

                            <span className="detail-card-icon orange">
                                🔥
                            </span>
                        </div>

                        <div className="detail-priority-options">
                            {(
                                [
                                    'LOW',
                                    'MEDIUM',
                                    'HIGH',
                                    'URGENT',
                                ] as TicketPriority[]
                            ).map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                        void handlePriorityChange(
                                            priority,
                                        )
                                    }
                                    className={`
                    detail-priority
                    detail-priority-${priority.toLowerCase()}
                    ${ticket.priority === priority
                                            ? 'active'
                                            : ''
                                        }
                  `}
                                >
                                    <span>●</span>
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* RIGHT */}

                <aside className="ticket-detail-sidebar">
                    {/* CUSTOMER */}

                    <section className="detail-card">
                        <div className="detail-card-header">
                            <div>
                                <h2>Khách hàng</h2>
                                <p>Người gửi yêu cầu</p>
                            </div>
                        </div>

                        <div className="detail-customer">
                            <div className="detail-customer-avatar">
                                {getInitial(ticket.customer?.name)}
                            </div>

                            <strong>
                                {ticket.customer?.name ??
                                    'Không xác định'}
                            </strong>

                            <span>
                                {ticket.customer?.email ?? '---'}
                            </span>
                        </div>
                    </section>

                    {/* AGENT */}

                    <section className="detail-card agent-card">
                        <div className="detail-card-header">
                            <div>
                                <h2>Agent phụ trách</h2>

                                <p>
                                    Phân công nhân viên hỗ trợ
                                </p>
                            </div>

                            <span className="detail-card-icon green">
                                👨‍💻
                            </span>
                        </div>

                        {ticket.assignedAgent ? (
                            <div className="current-agent">
                                <div className="current-agent-avatar">
                                    {getInitial(
                                        ticket.assignedAgent.name,
                                    )}
                                </div>

                                <div>
                                    <strong>
                                        {ticket.assignedAgent.name}
                                    </strong>

                                    <span>
                                        {ticket.assignedAgent.email}
                                    </span>
                                </div>

                                <div className="agent-online-dot" />
                            </div>
                        ) : (
                            <div className="no-agent">
                                <span>👤</span>

                                <div>
                                    <strong>
                                        Chưa phân công
                                    </strong>

                                    <p>
                                        Chọn Agent bên dưới
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="assign-agent-form">
                            <label>
                                {ticket.assignedAgent
                                    ? 'Thay đổi Agent'
                                    : 'Chọn Agent'}
                            </label>

                            <select
                                value={
                                    ticket.assignedAgentId ?? ''
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    void handleAssignAgent(
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">
                                    -- Chọn Agent --
                                </option>

                                {agents.map((agent) => (
                                    <option
                                        key={agent.id}
                                        value={agent.id}
                                    >
                                        {agent.name} - {agent.email}
                                    </option>
                                ))}
                            </select>

                            <small>
                                Agent phải thuộc phòng ban{' '}
                                <strong>
                                    {ticket.department?.name ??
                                        'của Ticket'}
                                </strong>
                            </small>
                        </div>
                    </section>

                    {/* META */}

                    <section className="detail-card ticket-meta-card">
                        <h2>Thông tin hệ thống</h2>

                        <div className="meta-row">
                            <span>Ticket ID</span>

                            <strong>
                                {ticket.id.slice(0, 13)}...
                            </strong>
                        </div>

                        <div className="meta-row">
                            <span>Priority</span>

                            <PriorityBadge
                                priority={ticket.priority}
                            />
                        </div>

                        <div className="meta-row">
                            <span>Status</span>

                            <StatusBadge
                                status={ticket.status}
                            />
                        </div>

                        <div className="meta-row">
                            <span>Ngày đóng</span>

                            <strong>
                                {ticket.closedAt
                                    ? formatDateTime(
                                        ticket.closedAt,
                                    )
                                    : '---'}
                            </strong>
                        </div>
                    </section>
                </aside>
            </div>

            {saving && (
                <div className="detail-saving">
                    <div className="detail-saving-spinner" />
                    Đang cập nhật...
                </div>
            )}
        </div>
    );
}

/* =========================
   INFORMATION
========================= */

function InformationItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="information-item">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

/* =========================
   STATUS OPTION
========================= */

interface StatusOptionProps {
    status: TicketStatus;
    label: string;
    description: string;
    icon: string;
    current: TicketStatus;
    disabled: boolean;
    onClick: (status: TicketStatus) => Promise<void>;
}

function StatusOption({
    status,
    label,
    description,
    icon,
    current,
    disabled,
    onClick,
}: StatusOptionProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={`
        detail-status-option
        detail-status-${status.toLowerCase()}
        ${current === status ? 'active' : ''}
      `}
            onClick={() => void onClick(status)}
        >
            <div>{icon}</div>

            <span>
                <strong>{label}</strong>
                <small>{description}</small>
            </span>
        </button>
    );
}

/* =========================
   BADGES
========================= */

function StatusBadge({
    status,
}: {
    status: TicketStatus;
}) {
    const labels: Record<TicketStatus, string> = {
        OPEN: '● Open',
        IN_PROGRESS: '● In Progress',
        WAITING: '● Waiting',
        RESOLVED: '✓ Resolved',
        CLOSED: '✓ Closed',
    };

    return (
        <span
            className={`
        ticket-status
        status-${status.toLowerCase()}
      `}
        >
            {labels[status]}
        </span>
    );
}

function PriorityBadge({
    priority,
}: {
    priority: TicketPriority;
}) {
    return (
        <span
            className={`
        ticket-priority
        priority-${priority.toLowerCase()}
      `}
        >
            {priority}
        </span>
    );
}

/* =========================
   HELPERS
========================= */

function getInitial(
    name?: string | null,
): string {
    if (!name) return '?';

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}

function formatDateTime(
    value: string,
): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}