import {
  useEffect,
  useState,
} from 'react';

import {
  createAgent,
  updateAgent,
  type Agent,
  type AgentStatus,
} from '../../api/agents.api';

import './AgentModal.css';

interface AgentModalProps {
  open: boolean;
  agent?: Agent | null;
  onClose: () => void;
  onSaved: (agent: Agent) => void;
}

export default function AgentModal({
  open,
  agent,
  onClose,
  onSaved,
}: AgentModalProps) {
  const isEditing = Boolean(agent);

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [status, setStatus] =
    useState<AgentStatus>('ACTIVE');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(agent?.name ?? '');
    setEmail(agent?.email ?? '');
    setPassword('');
    setStatus(
      agent?.status ?? 'ACTIVE',
    );

    setError('');
  }, [open, agent]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (saving) {
      return;
    }

    setError('');
    onClose();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        'Vui lòng nhập tên Agent.',
      );
      return;
    }

    if (!email.trim()) {
      setError(
        'Vui lòng nhập email.',
      );
      return;
    }

    if (
      !isEditing &&
      password.length < 6
    ) {
      setError(
        'Mật khẩu phải có ít nhất 6 ký tự.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      let savedAgent: Agent;

      if (agent) {
        savedAgent =
          await updateAgent(
            agent.id,
            {
              name: name.trim(),
              email: email.trim(),
              status,
            },
          );
      } else {
        savedAgent =
          await createAgent({
            name: name.trim(),
            email: email.trim(),
            password,
          });
      }

      onSaved(savedAgent);
      onClose();
    } catch (error) {
      console.error(error);

      setError(
        isEditing
          ? 'Không thể cập nhật Agent.'
          : 'Không thể tạo Agent. Email có thể đã tồn tại.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="agent-modal-overlay"
      onMouseDown={handleClose}
    >
      <div
        className="agent-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="agent-modal-header">
          <div className="agent-modal-header-icon">
            {isEditing ? '✎' : '🎧'}
          </div>

          <div>
            <h2>
              {isEditing
                ? 'Chỉnh sửa Agent'
                : 'Thêm Agent'}
            </h2>

            <p>
              {isEditing
                ? 'Cập nhật tài khoản nhân viên hỗ trợ'
                : 'Tạo tài khoản nhân viên hỗ trợ mới'}
            </p>
          </div>

          <button
            type="button"
            className="agent-modal-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* BODY */}

        <form
          className="agent-modal-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="agent-form-error">
              <span>!</span>

              <div>
                <strong>
                  Không thể lưu Agent
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {/* NAME */}

          <div className="agent-form-group">
            <label>
              Tên Agent
              <span>*</span>
            </label>

            <div className="agent-form-input">
              <span>👤</span>

              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={name}
                disabled={saving}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          {/* EMAIL */}

          <div className="agent-form-group">
            <label>
              Email
              <span>*</span>
            </label>

            <div className="agent-form-input">
              <span>✉</span>

              <input
                type="email"
                placeholder="agent@helpdesk.com"
                value={email}
                disabled={saving}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          {/* PASSWORD CREATE ONLY */}

          {!isEditing && (
            <div className="agent-form-group">
              <label>
                Mật khẩu
                <span>*</span>
              </label>

              <div className="agent-form-input">
                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  disabled={saving}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                />
              </div>

              <small className="agent-field-help">
                Agent sử dụng email và mật khẩu
                này để đăng nhập hệ thống.
              </small>
            </div>
          )}

          {/* STATUS EDIT ONLY */}

          {isEditing && (
            <div className="agent-form-group">
              <label>
                Trạng thái Agent
              </label>

              <div className="agent-status-selector">
                <button
                  type="button"
                  disabled={saving}
                  className={
                    status === 'ACTIVE'
                      ? 'selected active-status'
                      : ''
                  }
                  onClick={() =>
                    setStatus('ACTIVE')
                  }
                >
                  <div className="status-select-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Active
                    </strong>

                    <span>
                      Có thể nhận và xử lý Ticket
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  className={
                    status === 'INACTIVE'
                      ? 'selected inactive-status'
                      : ''
                  }
                  onClick={() =>
                    setStatus('INACTIVE')
                  }
                >
                  <div className="status-select-icon">
                    ◷
                  </div>

                  <div>
                    <strong>
                      Inactive
                    </strong>

                    <span>
                      Tạm ngừng nhận Ticket
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW */}

          <div className="agent-modal-preview">
            <span className="agent-preview-label">
              Xem trước tài khoản
            </span>

            <div className="agent-preview-content">
              <div className="agent-preview-avatar">
                {getInitial(name)}

                <span
                  className={
                    status === 'ACTIVE'
                      ? 'preview-online'
                      : 'preview-offline'
                  }
                />
              </div>

              <div className="agent-preview-info">
                <strong>
                  {name.trim() ||
                    'Tên Agent'}
                </strong>

                <span>
                  {email.trim() ||
                    'agent@helpdesk.com'}
                </span>
              </div>

              <div className="agent-preview-badges">
                <span className="preview-agent-role">
                  🎧 AGENT
                </span>

                <span
                  className={
                    status === 'ACTIVE'
                      ? 'preview-active-status'
                      : 'preview-inactive-status'
                  }
                >
                  ● {status}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="agent-modal-actions">
            <button
              type="button"
              className="agent-modal-cancel"
              disabled={saving}
              onClick={handleClose}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="agent-modal-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="agent-modal-spinner" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <span>
                    {isEditing
                      ? '✓'
                      : '＋'}
                  </span>

                  {isEditing
                    ? 'Lưu thay đổi'
                    : 'Tạo Agent'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getInitial(
  value: string,
): string {
  if (!value.trim()) {
    return '?';
  }

  return value
    .trim()
    .charAt(0)
    .toUpperCase();
}
