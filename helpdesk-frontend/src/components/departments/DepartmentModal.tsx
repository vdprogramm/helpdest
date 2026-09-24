import {
  useEffect,
  useState,
} from 'react';

import {
  createDepartment,
  updateDepartment,
  type Department,
} from '../../api/departments.api';

import './DepartmentModal.css';

interface DepartmentModalProps {
  open: boolean;
  department?: Department | null;
  onClose: () => void;
  onSaved: (department: Department) => void;
}

export default function DepartmentModal({
  open,
  department,
  onClose,
  onSaved,
}: DepartmentModalProps) {
  const isEditing = Boolean(department);

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(
      department?.name ?? '',
    );

    setDescription(
      department?.description ?? '',
    );

    setError('');
  }, [open, department]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        'Vui lòng nhập tên Department.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      let saved: Department;

      if (department) {
        saved =
          await updateDepartment(
            department.id,
            {
              name: name.trim(),
              description:
                description.trim(),
            },
          );
      } else {
        saved =
          await createDepartment({
            name: name.trim(),
            description:
              description.trim() ||
              undefined,
          });
      }

      onSaved(saved);
      onClose();
    } catch (error) {
      console.error(error);

      setError(
        isEditing
          ? 'Không thể cập nhật Department.'
          : 'Không thể tạo Department.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="department-modal-overlay"
      onMouseDown={handleClose}
    >
      <div
        className="department-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="department-modal-header">
          <div className="department-modal-icon">
            🏢
          </div>

          <div>
            <h2>
              {isEditing
                ? 'Chỉnh sửa Department'
                : 'Thêm Department'}
            </h2>

            <p>
              {isEditing
                ? 'Cập nhật thông tin phòng ban'
                : 'Tạo phòng ban hỗ trợ mới'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <form
          className="department-modal-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="department-modal-error">
              <span>!</span>

              <div>
                <strong>
                  Không thể lưu
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="department-form-group">
            <label>
              Tên Department
              <span>*</span>
            </label>

            <div className="department-form-input">
              <span>▦</span>

              <input
                type="text"
                placeholder="Ví dụ: Technical Support"
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

          <div className="department-form-group">
            <label>
              Mô tả
              <small>
                Không bắt buộc
              </small>
            </label>

            <textarea
              placeholder="Mô tả chức năng của Department..."
              value={description}
              disabled={saving}
              rows={4}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="department-preview">
            <div className="department-preview-icon">
              🏢
            </div>

            <div>
              <span>
                Department
              </span>

              <strong>
                {name.trim() ||
                  'Tên Department'}
              </strong>

              <p>
                {description.trim() ||
                  'Chưa có mô tả'}
              </p>
            </div>
          </div>

          <div className="department-modal-actions">
            <button
              type="button"
              className="department-modal-cancel"
              disabled={saving}
              onClick={handleClose}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="department-modal-save"
              disabled={saving}
            >
              {saving
                ? 'Đang lưu...'
                : isEditing
                  ? '✓ Lưu thay đổi'
                  : '＋ Tạo Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
