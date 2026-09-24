import {
  useEffect,
  useState,
} from 'react';

import {
  createCannedResponse,
  updateCannedResponse,
  type CannedResponse,
} from '../../api/canned-responses.api';

import './CannedResponseFormModal.css';

interface CannedResponseFormModalProps {
  open: boolean;
  response?: CannedResponse | null;
  onClose: () => void;
  onSaved: (
    response: CannedResponse,
  ) => void;
}

export default function CannedResponseFormModal({
  open,
  response,
  onClose,
  onSaved,
}: CannedResponseFormModalProps) {
  const isEditing =
    Boolean(response);

  const [title, setTitle] =
    useState('');

  const [content, setContent] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(
      response?.title ?? '',
    );

    setContent(
      response?.content ?? '',
    );

    setError('');
  }, [open, response]);

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

    if (!title.trim()) {
      setError(
        'Vui lòng nhập tiêu đề.',
      );
      return;
    }

    if (!content.trim()) {
      setError(
        'Vui lòng nhập nội dung câu trả lời.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      let savedResponse:
        CannedResponse;

      if (response) {
        savedResponse =
          await updateCannedResponse(
            response.id,
            {
              title: title.trim(),
              content:
                content.trim(),
            },
          );
      } else {
        savedResponse =
          await createCannedResponse(
            {
              title: title.trim(),
              content:
                content.trim(),
            },
          );
      }

      onSaved(savedResponse);
      onClose();
    } catch (error) {
      console.error(error);

      setError(
        isEditing
          ? 'Không thể cập nhật câu trả lời mẫu.'
          : 'Không thể tạo câu trả lời mẫu.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="canned-form-overlay"
      onMouseDown={handleClose}
    >
      <div
        className="canned-form-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="canned-form-header">
          <div className="canned-form-header-icon">
            ⚡
          </div>

          <div>
            <h2>
              {isEditing
                ? 'Chỉnh sửa câu trả lời'
                : 'Thêm câu trả lời'}
            </h2>

            <p>
              {isEditing
                ? 'Cập nhật nội dung phản hồi nhanh'
                : 'Tạo phản hồi nhanh cho Agent'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          className="canned-form-body"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="canned-form-error">
              <span>!</span>

              <div>
                <strong>
                  Không thể lưu
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {/* TITLE */}

          <div className="canned-form-group">
            <label>
              Tiêu đề
              <span>*</span>
            </label>

            <div className="canned-title-input">
              <span>⚡</span>

              <input
                type="text"
                placeholder="Ví dụ: Chào khách hàng"
                value={title}
                disabled={saving}
                maxLength={100}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
              />
            </div>

            <small>
              {title.length}/100
            </small>
          </div>

          {/* CONTENT */}

          <div className="canned-form-group">
            <label>
              Nội dung phản hồi
              <span>*</span>
            </label>

            <textarea
              rows={7}
              placeholder="Ví dụ: Xin chào! Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ..."
              value={content}
              disabled={saving}
              onChange={(event) =>
                setContent(
                  event.target.value,
                )
              }
            />

            <div className="canned-content-info">
              <span>
                💡 Nội dung này sẽ
                được chèn vào ô chat
                của Agent.
              </span>

              <strong>
                {content.length} ký tự
              </strong>
            </div>
          </div>

          {/* PREVIEW */}

          <div className="canned-form-preview">
            <div className="canned-preview-heading">
              <div>
                <span>⚡</span>

                <strong>
                  Xem trước
                </strong>
              </div>

              <span className="canned-preview-ready">
                ● Ready
              </span>
            </div>

            <h3>
              {title.trim() ||
                'Tiêu đề câu trả lời'}
            </h3>

            <div className="canned-preview-message">
              <div className="canned-preview-avatar">
                A
              </div>

              <div>
                <span>
                  Agent Support
                </span>

                <p>
                  {content.trim() ||
                    'Nội dung câu trả lời sẽ hiển thị tại đây...'}
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="canned-form-actions">
            <button
              type="button"
              className="canned-form-cancel"
              disabled={saving}
              onClick={handleClose}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="canned-form-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="canned-save-spinner" />
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
                    : 'Tạo câu trả lời'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
