import {
  useEffect,
  useState,
} from 'react';

import {
  getAgents,
  type Agent,
} from '../../api/agents.api';

import {
  addAgentToDepartment,
  getDepartmentById,
  removeAgentFromDepartment,
  type Department,
} from '../../api/departments.api';

import './ManageDepartmentAgentsModal.css';

interface Props {
  open: boolean;
  department: Department | null;
  onClose: () => void;
  onChanged?: () => void;
}

export default function ManageDepartmentAgentsModal({
  open,
  department,
  onClose,
  onChanged,
}: Props) {
  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [search, setSearch] =
    useState('');

  const [
    assignedAgentIds,
    setAssignedAgentIds,
  ] = useState<Set<string>>(
    new Set(),
  );

  const [loading, setLoading] =
    useState(false);

  const [
    updatingAgentId,
    setUpdatingAgentId,
  ] = useState<string | null>(
    null,
  );

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!open || !department?.id) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const [
          allAgents,
          departmentDetail,
        ] = await Promise.all([
          getAgents(),
          getDepartmentById(
            department.id,
          ),
        ]);

        setAgents(
          allAgents.filter(
            (agent) =>
              agent.role === 'AGENT',
          ),
        );

        const ids = new Set(
          (
            departmentDetail
              .agentDepartments ?? []
          ).map(
            (item) =>
              item.agent.id,
          ),
        );

        setAssignedAgentIds(ids);
      } catch (error) {
        console.error(
          'Không thể tải Agent:',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [
    open,
    department?.id,
  ]);

  if (!open || !department) {
    return null;
  }

  const keyword =
    search.trim().toLowerCase();

  const filteredAgents =
    agents.filter((agent) => {
      if (!keyword) {
        return true;
      }

      return (
        agent.name
          .toLowerCase()
          .includes(keyword) ||
        agent.email
          .toLowerCase()
          .includes(keyword)
      );
    });

  const handleToggle = async (
    agent: Agent,
  ) => {
    if (!department?.id) {
      return;
    }

    const isAssigned =
      assignedAgentIds.has(
        agent.id,
      );

    try {
      setUpdatingAgentId(
        agent.id,
      );
      setError('');

      if (isAssigned) {
        await removeAgentFromDepartment(
          department.id,
          agent.id,
        );

        setAssignedAgentIds(
          (current) => {
            const next =
              new Set(current);

            next.delete(
              agent.id,
            );

            return next;
          },
        );
      } else {
        await addAgentToDepartment(
          department.id,
          agent.id,
        );

        setAssignedAgentIds(
          (current) => {
            const next =
              new Set(current);

            next.add(
              agent.id,
            );

            return next;
          },
        );
      }

      onChanged?.();
    } catch (error) {
      console.error(
        'Không thể cập nhật Agent:',
        error,
      );
      setError(
        isAssigned
          ? 'Không thể gỡ Agent khỏi Department.'
          : 'Không thể thêm Agent vào Department.',
      );
    } finally {
      setUpdatingAgentId(
        null,
      );
    }
  };

  return (
    <div
      className="manage-agents-overlay"
      onMouseDown={onClose}
    >
      <div
        className="manage-agents-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="manage-agents-header">
          <div className="manage-agents-icon">
            👥
          </div>

          <div>
            <h2>
              Quản lý Agents
            </h2>

            <p>
              {department.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="manage-agents-summary">
          <div>
            <span>Agents hiện tại</span>

            <strong>
              {assignedAgentIds.size}
            </strong>
          </div>

          <div>
            <span>Agents khả dụng</span>

            <strong>
              {agents.length}
            </strong>
          </div>
        </div>

        <div className="manage-agents-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Tìm Agent..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        {error && (
          <div className="manage-agents-error">
            ! {error}
          </div>
        )}

        <div className="manage-agents-list">
          {loading ? (
            <div className="manage-agents-loading">
              Đang tải Agents...
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const isAssigned =
                assignedAgentIds.has(
                  agent.id,
                );

              const isUpdating =
                updatingAgentId ===
                agent.id;

              return (
                <div
                  key={agent.id}
                  className={
                    isAssigned
                      ? 'manage-agent-item assigned'
                      : 'manage-agent-item'
                  }
                >
                  <div className="manage-agent-avatar">
                    {getInitial(agent.name)}
                    <span
                      className={
                        agent.status === 'ACTIVE'
                          ? 'online'
                          : 'offline'
                      }
                    />
                  </div>

                  <div className="manage-agent-info">
                    <strong>
                      {agent.name}
                    </strong>

                    <span>
                      {agent.email}
                    </span>

                    <small>
                      ● {agent.status}
                    </small>
                  </div>

                  <div className="manage-agent-actions">
                    {isAssigned && (
                      <span className="assigned-badge">
                        ✓ Đã tham gia
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={
                        isUpdating ||
                        agent.status ===
                        'INACTIVE'
                      }
                      className={
                        isAssigned
                          ? 'remove-agent-button'
                          : 'add-agent-button'
                      }
                      onClick={() =>
                        void handleToggle(agent)
                      }
                    >
                      {isUpdating
                        ? 'Đang xử lý...'
                        : isAssigned
                          ? 'Bỏ khỏi nhóm'
                          : 'Thêm vào'}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {!loading &&
            filteredAgents.length ===
            0 && (
              <div className="manage-agents-empty">
                👤 Không tìm thấy Agent
              </div>
            )}
        </div>

        <div className="manage-agents-footer">
          <span>
            💡 Agent cần thuộc
            Department để được phân công
            Ticket của phòng ban này.
          </span>

          <button
            type="button"
            onClick={onClose}
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitial(
  value: string,
): string {
  return (
    value
      .trim()
      .charAt(0)
      .toUpperCase() || '?'
  );
}
