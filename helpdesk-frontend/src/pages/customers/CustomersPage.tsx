import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  deleteCustomer,
  getCustomers,
  type Customer,
} from '../../api/customers.api';

import './CustomersPage.css';
import CustomerModal from '../../components/customers/CustomerModal';
import Pagination from '../../components/common/Pagination';

export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [customerModalOpen, setCustomerModalOpen] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* =========================
     LOAD
  ========================= */

  const loadCustomers = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await getCustomers();

        setCustomers(data);
      } catch (error) {
        console.error(error);

        setError(
          'Không thể tải danh sách khách hàng.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (
    customer: Customer,
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa khách hàng "${customer.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(customer.id);
      setError('');

      await deleteCustomer(
        customer.id,
      );

      setCustomers((current) =>
        current.filter(
          (item) =>
            item.id !== customer.id,
        ),
      );
    } catch (error) {
      console.error(error);

      setError(
        'Không thể xóa khách hàng. Khách hàng có thể đang liên quan đến Ticket.',
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

  const filteredCustomers =
    customers.filter((customer) => {
      if (!keyword) {
        return true;
      }

      return (
        customer.name
          .toLowerCase()
          .includes(keyword) ||
        customer.email
          .toLowerCase()
          .includes(keyword) ||
        (
          customer.phone ?? ''
        )
          .toLowerCase()
          .includes(keyword)
      );
    });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const customersWithPhone =
    customers.filter(
      (customer) =>
        Boolean(customer.phone),
    ).length;

  const newCustomers =
    customers.filter(
      (customer) =>
        isRecentCustomer(
          customer.createdAt,
        ),
    ).length;

  /* =========================
     UI
  ========================= */

  return (
    <div className="customers-page">
      {/* HEADER */}

      <div className="customers-header">
        <div className="customers-title">
          <div className="customers-title-icon">
            👥
          </div>

          <div>
            <h1>Customers</h1>

            <p>
              Quản lý thông tin khách hàng
              sử dụng hệ thống Helpdesk
            </p>
          </div>
        </div>

        <button
          type="button"
          className="create-customer-button"
          onClick={() => {
            setEditingCustomer(null);
            setCustomerModalOpen(true);
          }}
        >
          <span>＋</span>
          Thêm khách hàng
        </button>
      </div>

      {/* STATS */}

      <div className="customer-stats">
        <CustomerStat
          icon="👥"
          label="Tổng khách hàng"
          value={customers.length}
          className="customer-stat-blue"
        />

        <CustomerStat
          icon="📞"
          label="Có số điện thoại"
          value={customersWithPhone}
          className="customer-stat-purple"
        />

        <CustomerStat
          icon="✨"
          label="Khách hàng mới"
          value={newCustomers}
          className="customer-stat-green"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="customer-error">
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
              void loadCustomers()
            }
          >
            Thử lại
          </button>
        </div>
      )}

      {/* PANEL */}

      <div className="customers-panel">
        <div className="customers-toolbar">
          <div className="customer-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Tìm tên, email hoặc số điện thoại..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          <button
            type="button"
            className="customer-refresh"
            title="Làm mới"
            onClick={() =>
              void loadCustomers()
            }
          >
            ↻
          </button>
        </div>

        {loading ? (
          <div className="customers-loading">
            <div className="customer-spinner" />

            <span>
              Đang tải khách hàng...
            </span>
          </div>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>KHÁCH HÀNG</th>
                  <th>EMAIL</th>
                  <th>ĐIỆN THOẠI</th>
                  <th>NGÀY TẠO</th>
                  <th>TRẠNG THÁI</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {paginatedCustomers.map(
                  (customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-main">
                          <div className="customer-table-avatar">
                            {getInitial(
                              customer.name,
                            )}
                          </div>

                          <div>
                            <strong>
                              {customer.name}
                            </strong>

                            <span>
                              #
                              {customer.id
                                .slice(0, 8)
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="customer-email">
                          <span>✉</span>

                          {
                            customer.email
                          }
                        </div>
                      </td>

                      <td>
                        {customer.phone ? (
                          <div className="customer-phone">
                            <span>☎</span>

                            {
                              customer.phone
                            }
                          </div>
                        ) : (
                          <span className="customer-no-data">
                            Chưa cập nhật
                          </span>
                        )}
                      </td>

                      <td>
                        {formatDate(
                          customer.createdAt,
                        )}
                      </td>

                      <td>
                        <span className="customer-active-badge">
                          ● Active
                        </span>
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="customer-edit-button"
                            title="Chỉnh sửa"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setCustomerModalOpen(true);
                            }}
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="customer-delete-button"
                            title="Xóa"
                            disabled={
                              deletingId ===
                              customer.id
                            }
                            onClick={() =>
                              void handleDelete(
                                customer,
                              )
                            }
                          >
                            {deletingId ===
                            customer.id
                              ? '...'
                              : '×'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}

                {filteredCustomers.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="customers-empty"
                    >
                      <div>👥</div>

                      <strong>
                        Không tìm thấy khách hàng
                      </strong>

                      <p>
                        Không có khách hàng phù hợp
                        với từ khóa hiện tại.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCustomers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <CustomerModal
        open={customerModalOpen}
        customer={editingCustomer}
        onClose={() => {
          setCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSaved={(savedCustomer) => {
          setCustomers((current) => {
            const exists = current.some(
              (customer) =>
                customer.id === savedCustomer.id,
            );

            if (exists) {
              return current.map((customer) =>
                customer.id === savedCustomer.id
                  ? savedCustomer
                  : customer,
              );
            }

            return [
              savedCustomer,
              ...current,
            ];
          });
        }}
      />
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

interface CustomerStatProps {
  icon: string;
  label: string;
  value: number;
  className: string;
}

function CustomerStat({
  icon,
  label,
  value,
  className,
}: CustomerStatProps) {
  return (
    <div
      className={`customer-stat-card ${className}`}
    >
      <div className="customer-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
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

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(new Date(value));
}

function isRecentCustomer(
  value: string,
): boolean {
  const createdAt =
    new Date(value).getTime();

  const now = Date.now();

  const sevenDays =
    7 * 24 * 60 * 60 * 1000;

  return (
    now - createdAt <= sevenDays
  );
}
