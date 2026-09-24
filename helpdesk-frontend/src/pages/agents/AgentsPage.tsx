import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  deleteAgent,
  getAgents,
  type Agent,
} from '../../api/agents.api';

import './AgentsPage.css';
import AgentModal from '../../components/agents/AgentModal';
import Pagination from '../../components/common/Pagination';

type StatusFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'INACTIVE';

export default function AgentsPage() {
  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [agentModalOpen, setAgentModalOpen] =
    useState(false);

  const [editingAgent, setEditingAgent] =
    useState<Agent | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  /* =========================
     LOAD AGENTS
  ========================= */

  const loadAgents = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getAgents();

        setAgents(data);
      } catch (error) {
        console.error(error);

        setError(
          'Không thể tải danh sách Agent.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (
    agent: Agent,
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa Agent "${agent.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(agent.id);
      setError('');

      await deleteAgent(agent.id);

      setAgents((current) =>
        current.filter(
          (item) =>
            item.id !== agent.id,
        ),
      );
    } catch (error) {
      console.error(error);

      setError(
        'Không thể xóa Agent. Agent có thể đang liên quan đến Ticket, Conversation hoặc Department.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================
     FILTER
  ========================= */

  const keyword =
    search.trim().toLowerCase();

  const filteredAgents =
    agents.filter((agent) => {
      const matchSearch =
        !keyword ||
        agent.name
          .toLowerCase()
          .includes(keyword) ||
        agent.email
          .toLowerCase()
          .includes(keyword);

      const matchStatus =
        statusFilter === 'ALL' ||
        agent.status === statusFilter;

      return (
        matchSearch &&
        matchStatus
      );
    });

  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeAgents =
    agents.filter(
      (agent) =>
        agent.status === 'ACTIVE',
    ).length;

  const inactiveAgents =
    agents.filter(
      (agent) =>
        agent.status === 'INACTIVE',
    ).length;

  const totalAssignments =
    agents.reduce(
      (total, agent) =>
        total +
        (
          agent.agentDepartments
            ?.length ?? 0
        ),
      0,
    );

  /* =========================
     UI
  ========================= */

  return (
    <div className="agents-page">
      {/* HEADER */}

      <div className="agents-header">
        <div className="agents-title">
          <div className="agents-title-icon">
            🎧
          </div>

          <div>
            <h1>Agents</h1>

            <p>
              Quản lý nhân viên hỗ trợ
              và trạng thái hoạt động
            </p>
          </div>
        </div>

        <button
          type="button"
          className="create-agent-button"
          onClick={() => {
            setEditingAgent(null);
            setAgentModalOpen(true);
          }}
        >
          <span>＋</span>
          Thêm Agent
        </button>
      </div>

      {/* STATS */}

      <div className="agent-stats">
        <AgentStatCard
          icon="👥"
          title="Tổng Agent"
          value={agents.length}
          description="Tài khoản hỗ trợ"
          className="agent-stat-blue"
        />

        <AgentStatCard
          icon="●"
          title="Đang hoạt động"
          value={activeAgents}
          description="Có thể nhận Ticket"
          className="agent-stat-green"
        />

        <AgentStatCard
          icon="◷"
          title="Không hoạt động"
          value={inactiveAgents}
          description="Tạm ngừng hỗ trợ"
          className="agent-stat-orange"
        />

        <AgentStatCard
          icon="▦"
          title="Phân công"
          value={totalAssignments}
          description="Agent - Department"
          className="agent-stat-purple"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="agent-error">
          <span>!</span>

          <div>
            <strong>
              Có lỗi xảy ra
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadAgents()
            }
          >
            Thử lại
          </button>
        </div>
      )}

      {/* MAIN PANEL */}

      <div className="agents-panel">
        <div className="agents-toolbar">
          <div className="agent-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Tìm Agent theo tên hoặc email..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="agent-status-filter">
            <button
              type="button"
              className={
                statusFilter === 'ALL'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setStatusFilter('ALL')
              }
            >
              Tất cả
              <span>{agents.length}</span>
            </button>

            <button
              type="button"
              className={
                statusFilter === 'ACTIVE'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setStatusFilter('ACTIVE')
              }
            >
              Active
              <span>{activeAgents}</span>
            </button>

            <button
              type="button"
              className={
                statusFilter === 'INACTIVE'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setStatusFilter(
                  'INACTIVE',
                )
              }
            >
              Inactive
              <span>{inactiveAgents}</span>
            </button>
          </div>

          <button
            type="button"
            className="agent-refresh-button"
            title="Làm mới"
            onClick={() =>
              void loadAgents()
            }
          >
            ↻
          </button>
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="agents-loading">
            <div className="agent-spinner" />

            <span>
              Đang tải Agents...
            </span>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="agents-empty">
            <div>🎧</div>

            <h3>
              Không tìm thấy Agent
            </h3>

            <p>
              Không có Agent phù hợp
              với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="agents-grid">
            {paginatedAgents.map(
              (agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  deleting={
                    deletingId ===
                    agent.id
                  }
                  onEdit={() => {
                    setEditingAgent(agent);
                    setAgentModalOpen(true);
                  }}
                  onDelete={() =>
                    void handleDelete(
                      agent,
                    )
                  }
                />
              ),
            )}
          </div>
        )}

        {!loading && filteredAgents.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAgents.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <AgentModal
        open={agentModalOpen}
        agent={editingAgent}
        onClose={() => {
          setAgentModalOpen(false);
          setEditingAgent(null);
        }}
        onSaved={(savedAgent) => {
          setAgents((current) => {
            const exists =
              current.some(
                (agent) =>
                  agent.id ===
                  savedAgent.id,
              );

            if (exists) {
              return current.map(
                (agent) =>
                  agent.id ===
                  savedAgent.id
                    ? {
                        ...agent,
                        ...savedAgent,
                      }
                    : agent,
              );
            }

            return [
              savedAgent,
              ...current,
            ];
          });
        }}
      />
    </div>
  );
}

/* =========================
   AGENT CARD
========================= */

interface AgentCardProps {
  agent: Agent;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function AgentCard({
  agent,
  deleting,
  onEdit,
  onDelete,
}: AgentCardProps) {
  const isActive =
    agent.status === 'ACTIVE';

  const departments =
    agent.agentDepartments?.map(
      (item) => item.department,
    ) ?? [];

  return (
    <div className="agent-card">
      <div className="agent-card-top">
        <div className="agent-avatar-wrapper">
          <div className="agent-avatar">
            {getInitial(agent.name)}
          </div>

          <span
            className={
              agent.isOnline
                ? 'agent-online-dot'
                : 'agent-offline-dot'
            }
          />
        </div>

        <div className="agent-card-actions">
          <button
            type="button"
            className="agent-edit-button"
            title="Chỉnh sửa"
            onClick={onEdit}
          >
            ✎
          </button>

          <button
            type="button"
            className="agent-delete-button"
            title="Xóa"
            disabled={deleting}
            onClick={onDelete}
          >
            {deleting
              ? '...'
              : '×'}
          </button>
        </div>
      </div>

      <div className="agent-card-info">
        <h3>{agent.name}</h3>

        <p>{agent.email}</p>

        <div className="agent-badges">
          <span
            className={
              isActive
                ? 'agent-status-active'
                : 'agent-status-inactive'
            }
          >
            ● {agent.status}
          </span>

          <span
            className={
              agent.isOnline
                ? 'online-status online'
                : 'online-status offline'
            }
          >
            {agent.isOnline
              ? '● Online'
              : '● Offline'}
          </span>

          <span className="agent-role-badge">
            {agent.role === 'ADMIN'
              ? '★ ADMIN'
              : '🎧 AGENT'}
          </span>
        </div>
      </div>

      <div className="agent-card-divider" />

      <div className="agent-department-section">
        <div className="agent-section-title">
          <span>Departments</span>

          <span>
            {departments.length}
          </span>
        </div>

        {departments.length === 0 ? (
          <div className="agent-no-department">
            Chưa thuộc Department nào
          </div>
        ) : (
          <div className="agent-departments">
            {departments.map(
              (department) => (
                <span
                  key={department.id}
                  className="agent-department-badge"
                >
                  🏢 {department.name}
                </span>
              ),
            )}
          </div>
        )}
      </div>

      <div className="agent-card-bottom">
        <span>
          Tham gia
        </span>

        <strong>
          {formatDate(agent.createdAt)}
        </strong>
      </div>
    </div>
  );
}

/* =========================
   STAT
========================= */

interface AgentStatCardProps {
  icon: string;
  title: string;
  value: number;
  description: string;
  className: string;
}

function AgentStatCard({
  icon,
  title,
  value,
  description,
  className,
}: AgentStatCardProps) {
  return (
    <div
      className={`agent-stat-card ${className}`}
    >
      <div className="agent-stat-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>
          {description}
        </small>
      </div>
    </div>
  );
}

/* =========================
   HELPERS
========================= */

function getInitial(
  value?: string | null,
): string {
  if (!value) {
    return '?';
  }

  return value
    .trim()
    .charAt(0)
    .toUpperCase();
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return 'Chưa có';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Chưa có';
  }

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date);
}
