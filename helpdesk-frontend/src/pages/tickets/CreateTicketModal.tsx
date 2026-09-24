import { useEffect, useState } from 'react';

import {
    createTicket,
    type Ticket,
    type TicketPriority,
} from '../../api/tickets.api';

import {
    getCustomers,
    type Customer,
} from '../../api/customers.api';

import {
    getDepartments,
    type Department,
} from '../../api/departments.api';

import './CreateTicketModal.css';

interface CreateTicketModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (ticket: Ticket) => void;
}

export default function CreateTicketModal({
    open,
    onClose,
    onCreated,
}: CreateTicketModalProps) {
    const [subject, setSubject] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const [priority, setPriority] =
        useState<TicketPriority>('MEDIUM');

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [departments, setDepartments] = useState<Department[]>(
        [],
    );

    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        const loadFormData = async () => {
            try {
                setLoadingData(true);
                setError('');

                const [customerData, departmentData] =
                    await Promise.all([
                        getCustomers(),
                        getDepartments(),
                    ]);

                setCustomers(customerData);
                setDepartments(departmentData);
            } catch (error) {
                console.error(error);

                setError(
                    'Không thể tải Customer hoặc Department.',
                );
            } finally {
                setLoadingData(false);
            }
        };

        void loadFormData();
    }, [open]);

    const resetForm = () => {
        setSubject('');
        setCustomerId('');
        setDepartmentId('');
        setPriority('MEDIUM');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!subject.trim()) {
            setError('Vui lòng nhập tiêu đề Ticket.');
            return;
        }

        if (!customerId) {
            setError('Vui lòng chọn khách hàng.');
            return;
        }

        if (!departmentId) {
            setError('Vui lòng chọn phòng ban.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const ticket = await createTicket({
                subject: subject.trim(),
                customerId,
                departmentId,
                priority,
            });

            onCreated(ticket);

            resetForm();
            onClose();
        } catch (error) {
            console.error(error);

            setError('Tạo Ticket thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div
            className="ticket-modal-overlay"
            onMouseDown={handleClose}
        >
            <div
                className="ticket-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="ticket-modal-banner">
                    <div className="ticket-modal-icon">
                        🎫
                    </div>

                    <div>
                        <h2>Tạo Ticket mới</h2>

                        <p>
                            Tạo yêu cầu hỗ trợ mới cho khách hàng
                        </p>
                    </div>

                    <button
                        type="button"
                        className="ticket-modal-close"
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>

                {loadingData ? (
                    <div className="ticket-modal-loading">
                        <div className="loading-spinner" />

                        <span>
                            Đang tải dữ liệu...
                        </span>
                    </div>
                ) : (
                    <form
                        className="ticket-create-form"
                        onSubmit={handleSubmit}
                    >
                        {error && (
                            <div className="ticket-form-error">
                                <span>!</span>

                                {error}
                            </div>
                        )}

                        <div className="ticket-form-group">
                            <label>
                                Tiêu đề Ticket
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="Ví dụ: Không thể đăng nhập tài khoản"
                                value={subject}
                                onChange={(event) =>
                                    setSubject(event.target.value)
                                }
                                maxLength={200}
                            />
                        </div>

                        <div className="ticket-form-row">
                            <div className="ticket-form-group">
                                <label>
                                    Khách hàng
                                    <span>*</span>
                                </label>

                                <select
                                    value={customerId}
                                    onChange={(event) =>
                                        setCustomerId(event.target.value)
                                    }
                                >
                                    <option value="">
                                        -- Chọn khách hàng --
                                    </option>

                                    {customers.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.name} - {customer.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ticket-form-group">
                                <label>
                                    Phòng ban
                                    <span>*</span>
                                </label>

                                <select
                                    value={departmentId}
                                    onChange={(event) =>
                                        setDepartmentId(event.target.value)
                                    }
                                >
                                    <option value="">
                                        -- Chọn phòng ban --
                                    </option>

                                    {departments.map((department) => (
                                        <option
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="ticket-form-group">
                            <label>
                                Mức độ ưu tiên
                            </label>

                            <div className="priority-selector">
                                <PriorityOption
                                    value="LOW"
                                    label="Low"
                                    icon="●"
                                    selected={priority === 'LOW'}
                                    onClick={() => setPriority('LOW')}
                                />

                                <PriorityOption
                                    value="MEDIUM"
                                    label="Medium"
                                    icon="●"
                                    selected={priority === 'MEDIUM'}
                                    onClick={() => setPriority('MEDIUM')}
                                />

                                <PriorityOption
                                    value="HIGH"
                                    label="High"
                                    icon="●"
                                    selected={priority === 'HIGH'}
                                    onClick={() => setPriority('HIGH')}
                                />

                                <PriorityOption
                                    value="URGENT"
                                    label="Urgent"
                                    icon="🔥"
                                    selected={priority === 'URGENT'}
                                    onClick={() => setPriority('URGENT')}
                                />
                            </div>
                        </div>

                        <div className="ticket-modal-actions">
                            <button
                                type="button"
                                className="ticket-cancel-button"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className="ticket-submit-button"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="button-spinner" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <span>＋</span>
                                        Tạo Ticket
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

interface PriorityOptionProps {
    value: TicketPriority;
    label: string;
    icon: string;
    selected: boolean;
    onClick: () => void;
}

function PriorityOption({
    value,
    label,
    icon,
    selected,
    onClick,
}: PriorityOptionProps) {
    return (
        <button
            type="button"
            className={`
        priority-option
        priority-option-${value.toLowerCase()}
        ${selected ? 'selected' : ''}
      `}
            onClick={onClick}
        >
            <span>{icon}</span>
            {label}
        </button>
    );
}