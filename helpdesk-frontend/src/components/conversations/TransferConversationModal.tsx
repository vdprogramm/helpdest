import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getAgents,
  type Agent,
} from '../../api/agents.api';

import type {
  Conversation,
} from '../../api/conversations.api';

import {
  transferConversation,
} from '../../socket/conversation.socket';

import './TransferConversationModal.css';

interface TransferConversationModalProps {
  open: boolean;
  conversation: Conversation | null;
  currentAgentId?: string | null;
  agentStatuses?: Record<string, 'ONLINE' | 'OFFLINE'>;
  onClose: () => void;
}

export default function TransferConversationModal({
  open,
  conversation,
  currentAgentId,
  agentStatuses,
  onClose,
}: TransferConversationModalProps) {
  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [transferringId, setTransferringId] =
    useState<string | null>(null);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadAgents = async () => {
      try {
        setLoading(true);
        setError('');
        setSearch('');

        const data =
          await getAgents();

        setAgents(
          data.filter(
            (agent) =>
              agent.role === 'AGENT' &&
              agent.status === 'ACTIVE',
          ),
        );
      } catch (error) {
        console.error(error);

        setError(
          'Không thể tải danh sách Agent.',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAgents();
  }, [open]);

  const filteredAgents =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return agents.filter(
        (agent) => {
          if (
            currentAgentId &&
            agent.id === currentAgentId
          ) {
            return false;
          }

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
        },
      );
    }, [
      agents,
      search,
      currentAgentId,
    ]);

  if (!open || !conversation) {
    return null;
  }

  const handleTransfer = (
    agent: Agent,
  ) => {
    try {
      setError('');
      setTransferringId(agent.id);

      transferConversation({
        conversationId:
          conversation.id,

        targetAgentId:
          agent.id,
      });

      /*
       * Không close modal ngay.
       *
       * Backend sẽ emit:
       * conversation:transferred
       *
       * ConversationsPage sẽ nhận
       * event rồi đóng modal.
       */
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : 'Không thể chuyển Conversation.',
      );

      setTransferringId(null);
    }
  };

  return (
    <div
      className="transfer-overlay"
      onMouseDown={() => {
        if (!transferringId) {
          onClose();
        }
      }}
    >
      <div
        className="transfer-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="transfer-header">
          <div className="transfer-header-icon">
            ⇄
          </div>

          <div className="transfer-header-content">
            <span>
              CONVERSATION TRANSFER
            </span>

            <h2>
              Chuyển cuộc trò chuyện
            </h2>

            <p>
              Chuyển khách hàng cho Agent
              phù hợp hơn.
            </p>
          </div>

          <button
            type="button"
            className="transfer-close"
            disabled={
              Boolean(transferringId)
            }
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="transfer-conversation-info">
          <div className="transfer-conversation-icon">
            💬
          </div>

          <div>
            <span>
              Conversation
            </span>

            <strong>
              {conversation.ticket
                ?.subject ??
                'Customer Support'}
            </strong>

            <small>
              ID:{' '}
              {conversation.id.slice(
                0,
                8,
              )}
              ...
            </small>
          </div>

          <span
            className={`
              transfer-status
              ${
                conversation.status ===
                'ACTIVE'
                  ? 'active'
                  : 'closed'
              }
            `}
          >
            ● {conversation.status}
          </span>
        </div>

        {error && (
          <div className="transfer-error">
            <div>!</div>

            <div>
              <strong>
                Không thể chuyển
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="transfer-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Tìm Agent theo tên hoặc email..."
            value={search}
            disabled={
              Boolean(transferringId)
            }
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        <div className="transfer-section-title">
          <div>
            <strong>
              Agent khả dụng
            </strong>

            <span>
              Chọn Agent muốn chuyển
              Conversation
            </span>
          </div>

          <span className="transfer-count">
            {filteredAgents.length}
          </span>
        </div>

        <div className="transfer-agent-list">
          {loading ? (
            <div className="transfer-loading">
              <div className="transfer-spinner" />

              <span>
                Đang tải Agents...
              </span>
            </div>
          ) : filteredAgents.length ===
            0 ? (
            <div className="transfer-empty">
              <div>👥</div>

              <strong>
                Không tìm thấy Agent
              </strong>

              <p>
                Không có Agent ACTIVE
                phù hợp.
              </p>
            </div>
          ) : (
            filteredAgents.map(
              (agent) => (
                <AgentTransferCard
                  key={agent.id}
                  agent={agent}
                  status={agentStatuses?.[agent.id]}
                  transferring={
                    transferringId ===
                    agent.id
                  }
                  disabled={
                    transferringId !==
                    null
                  }
                  onTransfer={() =>
                    handleTransfer(
                      agent,
                    )
                  }
                />
              ),
            )
          )}
        </div>

        <div className="transfer-note">
          <span>💡</span>

          <p>
            Backend sẽ chỉ cho phép
            chuyển nếu Agent đang online
            và thuộc đúng Department của
            Conversation.
          </p>
        </div>
      </div>
    </div>
  );
}

interface AgentTransferCardProps {
  agent: Agent;
  status?: 'ONLINE' | 'OFFLINE';
  transferring: boolean;
  disabled: boolean;
  onTransfer: () => void;
}

function AgentTransferCard({
  agent,
  status,
  transferring,
  disabled,
  onTransfer,
}: AgentTransferCardProps) {
  return (
    <div className="transfer-agent-card">
      <div className="transfer-agent-avatar">
        {getInitial(agent.name)}

        <span />
      </div>

      <div className="transfer-agent-info">
        <div>
          <strong>
            {agent.name}
          </strong>

          <span
            className={
              status === 'ONLINE'
                ? 'agent-online-badge'
                : status === 'OFFLINE'
                  ? 'agent-offline-badge'
                  : 'agent-unknown-badge'
            }
          >
            {status === 'ONLINE'
              ? '● ONLINE'
              : status === 'OFFLINE'
                ? '● OFFLINE'
                : '● UNKNOWN'}
          </span>
        </div>

        <p>{agent.email}</p>

        <div className="transfer-agent-departments">
          {agent.agentDepartments &&
          agent.agentDepartments.length > 0 ? (
            agent.agentDepartments
              .slice(0, 3)
              .map(
                (agentDepartment) => (
                  <span
                    key={
                      agentDepartment.department.id
                    }
                  >
                    {agentDepartment.department.name}
                  </span>
                ),
              )
          ) : (
            <span>
              Chưa có Department
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="transfer-agent-button"
        disabled={disabled || status === 'OFFLINE'}
        onClick={onTransfer}
      >
        {transferring ? (
          <>
            <span className="transfer-button-spinner" />
            Đang chuyển
          </>
        ) : (
          <>
            Chuyển
            <span>→</span>
          </>
        )}
      </button>
    </div>
  );
}

function getInitial(
  name: string,
): string {
  return (
    name
      .trim()
      .charAt(0)
      .toUpperCase() || 'A'
  );
}
