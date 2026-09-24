import { useCallback, useEffect, useState } from 'react';

import {
    getTickets,
    type Ticket,
    type TicketPriority,
    type TicketStatus,
} from '../../api/tickets.api';

import CreateTicketModal from './CreateTicketModal';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';

import './TicketsPage.css';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [priority, setPriority] = useState('ALL');
    const navigate = useNavigate();
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    useEffect(() => {
        setCurrentPage(1);
    }, [search, status, priority]);

    const [createModalOpen, setCreateModalOpen] =
        useState(false);

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getTickets();

            setTickets(data);
        } catch (error) {
            console.error('Load tickets error:', error);

            setError('Không thể tải danh sách Ticket.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTickets();
    }, [loadTickets]);

    const handleTicketCreated = (ticket: Ticket) => {
        setTickets((currentTickets) => [
            ticket,
            ...currentTickets,
        ]);
    };

    const safeTickets = Array.isArray(tickets) ? tickets : [];

    const filteredTickets = safeTickets.filter((ticket) => {
        const keyword = search.trim().toLowerCase();

        const matchSearch =
            keyword === '' ||
            ticket.subject.toLowerCase().includes(keyword) ||
            ticket.customer?.name
                ?.toLowerCase()
                .includes(keyword) ||
            ticket.customer?.email
                ?.toLowerCase()
                .includes(keyword);

        const matchStatus =
            status === 'ALL' ||
            ticket.status === status;

        const matchPriority =
            priority === 'ALL' ||
            ticket.priority === priority;

        return (
            matchSearch &&
            matchStatus &&
            matchPriority
        );
    });

    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalOpen = safeTickets.filter(
        (ticket) => ticket.status === 'OPEN',
    ).length;

    const totalInProgress = safeTickets.filter(
        (ticket) => ticket.status === 'IN_PROGRESS',
    ).length;

    const totalCompleted = safeTickets.filter(
        (ticket) =>
            ticket.status === 'RESOLVED' ||
            ticket.status === 'CLOSED',
    ).length;

    return (
        <div className="tickets-page">
            {/* =========================
          HEADER
      ========================= */}

            <div className="tickets-header">
                <div className="page-title-row">
                    <div className="title-icon">
                        🎫
                    </div>

                    <div>
                        <h1>Tickets</h1>

                        <p>
                            Theo dõi và xử lý các yêu cầu hỗ trợ
                            khách hàng
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="create-ticket-button"
                    onClick={() => setCreateModalOpen(true)}
                >
                    <span>＋</span>
                    Tạo Ticket
                </button>
            </div>

            {/* =========================
          SUMMARY
      ========================= */}

            <div className="ticket-summary">
                <SummaryCard
                    icon="📨"
                    title="Tất cả"
                    value={safeTickets.length}
                    className="summary-blue"
                />

                <SummaryCard
                    icon="🔥"
                    title="Đang mở"
                    value={totalOpen}
                    className="summary-orange"
                />

                <SummaryCard
                    icon="⚡"
                    title="Đang xử lý"
                    value={totalInProgress}
                    className="summary-purple"
                />

                <SummaryCard
                    icon="✅"
                    title="Hoàn thành"
                    value={totalCompleted}
                    className="summary-green"
                />
            </div>

            {/* =========================
          ERROR
      ========================= */}

            {error && (
                <div className="ticket-page-error">
                    <div className="ticket-error-icon">
                        !
                    </div>

                    <div>
                        <strong>
                            Không thể tải dữ liệu
                        </strong>

                        <span>{error}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadTickets()}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* =========================
          TABLE PANEL
      ========================= */}

            <div className="ticket-panel">
                {/* TOOLBAR */}

                <div className="ticket-toolbar">
                    <div className="ticket-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Tìm tiêu đề, khách hàng, email..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <div className="ticket-filters">
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                        >
                            <option value="ALL">
                                Tất cả trạng thái
                            </option>

                            <option value="OPEN">
                                Open
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="WAITING">
                                Waiting
                            </option>

                            <option value="RESOLVED">
                                Resolved
                            </option>

                            <option value="CLOSED">
                                Closed
                            </option>
                        </select>

                        <select
                            value={priority}
                            onChange={(event) =>
                                setPriority(event.target.value)
                            }
                        >
                            <option value="ALL">
                                Tất cả ưu tiên
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                            <option value="URGENT">
                                Urgent
                            </option>
                        </select>

                        <button
                            type="button"
                            className="refresh-ticket-button"
                            title="Làm mới"
                            onClick={() => void loadTickets()}
                        >
                            ↻
                        </button>
                    </div>
                </div>

                {/* LOADING */}

                {loading ? (
                    <div className="ticket-loading">
                        <div className="loading-spinner" />

                        <p>
                            Đang tải danh sách Tickets...
                        </p>
                    </div>
                ) : (
                    <div className="ticket-table-container">
                        <table className="tickets-table">
                            <thead>
                                <tr>
                                    <th>TICKET</th>
                                    <th>KHÁCH HÀNG</th>
                                    <th>PHÒNG BAN</th>
                                    <th>ƯU TIÊN</th>
                                    <th>TRẠNG THÁI</th>
                                    <th>AGENT</th>
                                    <th>NGÀY TẠO</th>
                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedTickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        {/* TICKET */}

                                        <td>
                                            <div className="ticket-main-info">
                                                <div className="ticket-small-icon">
                                                    #
                                                </div>

                                                <div>
                                                    <strong>
                                                        {ticket.subject}
                                                    </strong>

                                                    <span>
                                                        #
                                                        {ticket.id
                                                            .slice(0, 8)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CUSTOMER */}

                                        <td>
                                            <div className="customer-cell">
                                                <div className="customer-avatar">
                                                    {getInitial(
                                                        ticket.customer?.name,
                                                    )}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {ticket.customer?.name ??
                                                            'Không xác định'}
                                                    </strong>

                                                    <span>
                                                        {ticket.customer?.email ??
                                                            '---'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* DEPARTMENT */}

                                        <td>
                                            <span className="department-badge">
                                                {ticket.department?.name ??
                                                    'Chưa có'}
                                            </span>
                                        </td>

                                        {/* PRIORITY */}

                                        <td>
                                            <PriorityBadge
                                                priority={ticket.priority}
                                            />
                                        </td>

                                        {/* STATUS */}

                                        <td>
                                            <StatusBadge
                                                status={ticket.status}
                                            />
                                        </td>

                                        {/* AGENT */}

                                        <td>
                                            {ticket.assignedAgent ? (
                                                <div className="assigned-agent">
                                                    <div>
                                                        {getInitial(
                                                            ticket.assignedAgent.name,
                                                        )}
                                                    </div>

                                                    <span>
                                                        {ticket.assignedAgent.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="unassigned">
                                                    Chưa phân công
                                                </span>
                                            )}
                                        </td>

                                        {/* DATE */}

                                        <td>
                                            {formatDate(ticket.createdAt)}
                                        </td>

                                        {/* ACTION */}

                                        <td>
                                            <button
                                                type="button"
                                                className="ticket-more"
                                                title="Xem chi tiết"
                                                onClick={() =>
                                                    navigate(`/tickets/${ticket.id}`)
                                                }
                                            >
                                                •••
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* EMPTY */}

                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="empty-tickets"
                                        >
                                            <div>📭</div>

                                            <strong>
                                                Không tìm thấy Ticket
                                            </strong>

                                            <p>
                                                Không có Ticket phù hợp với
                                                bộ lọc hiện tại.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* FOOTER */}

                {!loading && filteredTickets.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredTickets.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* =========================
          CREATE MODAL
      ========================= */}

            <CreateTicketModal
                open={createModalOpen}
                onClose={() =>
                    setCreateModalOpen(false)
                }
                onCreated={handleTicketCreated}
            />
        </div>
    );
}

/* =========================
   SUMMARY CARD
========================= */

interface SummaryCardProps {
    icon: string;
    title: string;
    value: number;
    className: string;
}

function SummaryCard({
    icon,
    title,
    value,
    className,
}: SummaryCardProps) {
    return (
        <div
            className={`ticket-summary-card ${className}`}
        >
            <div className="summary-icon">
                {icon}
            </div>

            <div>
                <span>{title}</span>
                <strong>{value}</strong>
            </div>
        </div>
    );
}

/* =========================
   STATUS
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

/* =========================
   PRIORITY
========================= */

function PriorityBadge({
    priority,
}: {
    priority: TicketPriority;
}) {
    const labels: Record<TicketPriority, string> = {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        URGENT: 'Urgent',
    };

    return (
        <span
            className={`
        ticket-priority
        priority-${priority.toLowerCase()}
      `}
        >
            {labels[priority]}
        </span>
    );
}

/* =========================
   HELPERS
========================= */

function getInitial(
    name?: string | null,
): string {
    if (!name) {
        return '?';
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date));
}