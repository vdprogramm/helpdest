import {
  useEffect,
  useState,
} from 'react';

import {
  createCustomer,
  updateCustomer,
  type Customer,
} from '../../api/customers.api';

import './CustomerModal.css';

interface CustomerModalProps {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}

export default function CustomerModal({
  open,
  customer,
  onClose,
  onSaved,
}: CustomerModalProps) {
  const isEditing = Boolean(customer);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(customer?.name ?? '');
    setEmail(customer?.email ?? '');
    setPhone(customer?.phone ?? '');
    setError('');
  }, [open, customer]);

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
      setError('Vui lòng nhập tên khách hàng.');
      return;
    }

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let savedCustomer: Customer;

      if (customer) {
        savedCustomer = await updateCustomer(
          customer.id,
          {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
        );
      } else {
        savedCustomer = await createCustomer({
          name: name.trim(),
          email: email.trim(),
          phone:
            phone.trim() || undefined,
        });
      }

      onSaved(savedCustomer);
      onClose();
    } catch (error) {
      console.error(error);

      setError(
        isEditing
          ? 'Cập nhật khách hàng thất bại.'
          : 'Tạo khách hàng thất bại. Email có thể đã tồn tại.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="customer-modal-overlay"
      onMouseDown={handleClose}
    >
      <div
        className="customer-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="customer-modal-header">
          <div className="customer-modal-icon">
            {isEditing ? '✎' : '👤'}
          </div>

          <div>
            <h2>
              {isEditing
                ? 'Chỉnh sửa khách hàng'
                : 'Thêm khách hàng'}
            </h2>

            <p>
              {isEditing
                ? 'Cập nhật thông tin khách hàng'
                : 'Tạo khách hàng mới trong hệ thống'}
            </p>
          </div>

          <button
            type="button"
            className="customer-modal-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          className="customer-modal-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="customer-form-error">
              <span>!</span>

              <div>
                <strong>
                  Không thể lưu khách hàng
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {/* NAME */}

          <div className="customer-form-group">
            <label>
              Họ và tên
              <span>*</span>
            </label>

            <div className="customer-input">
              <span>👤</span>

              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={saving}
              />
            </div>
          </div>

          {/* EMAIL */}

          <div className="customer-form-group">
            <label>
              Email
              <span>*</span>
            </label>

            <div className="customer-input">
              <span>✉</span>

              <input
                type="email"
                placeholder="customer@gmail.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={saving}
              />
            </div>
          </div>

          {/* PHONE */}

          <div className="customer-form-group">
            <label>
              Số điện thoại
              <small>Không bắt buộc</small>
            </label>

            <div className="customer-input">
              <span>☎</span>

              <input
                type="tel"
                placeholder="0912345678"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                disabled={saving}
              />
            </div>
          </div>

          {/* PREVIEW */}

          <div className="customer-preview">
            <div className="customer-preview-title">
              Xem trước
            </div>

            <div className="customer-preview-content">
              <div className="customer-preview-avatar">
                {getInitial(name)}
              </div>

              <div>
                <strong>
                  {name.trim() ||
                    'Tên khách hàng'}
                </strong>

                <span>
                  {email.trim() ||
                    'customer@email.com'}
                </span>

                <small>
                  {phone.trim() ||
                    'Chưa có số điện thoại'}
                </small>
              </div>

              <div className="customer-preview-status">
                ● Active
              </div>
            </div>
          </div>

          {/* ACTION */}

          <div className="customer-modal-actions">
            <button
              type="button"
              className="customer-cancel"
              onClick={handleClose}
              disabled={saving}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="customer-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="customer-button-spinner" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <span>
                    {isEditing ? '✓' : '＋'}
                  </span>

                  {isEditing
                    ? 'Lưu thay đổi'
                    : 'Thêm khách hàng'}
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
  name: string,
): string {
  if (!name.trim()) {
    return '?';
  }

  return name
    .trim()
    .charAt(0)
    .toUpperCase();
}
