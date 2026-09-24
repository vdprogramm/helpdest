import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  deleteDepartment,
  getDepartments,
  type Department,
} from '../../api/departments.api';

import './DepartmentsPage.css';
import DepartmentModal from '../../components/departments/DepartmentModal';
import ManageDepartmentAgentsModal from '../../components/departments/ManageDepartmentAgentsModal';
import Pagination from '../../components/common/Pagination';

export default function DepartmentsPage() {
  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    departmentModalOpen,
    setDepartmentModalOpen,
  ] = useState(false);

  const [
    editingDepartment,
    setEditingDepartment,
  ] = useState<Department | null>(
    null,
  );

  const [
    managingDepartment,
    setManagingDepartment,
  ] = useState<Department | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* =========================
     LOAD
  ========================= */

  const loadDepartments = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await getDepartments();

        setDepartments(data);
      } catch (error) {
        console.error(error);

        setError(
          'Không thể tải danh sách Department.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (
    department: Department,
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa Department "${department.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(department.id);
      setError('');

      await deleteDepartment(
        department.id,
      );

      setDepartments((current) =>
        current.filter(
          (item) =>
            item.id !== department.id,
        ),
      );
    } catch (error) {
      console.error(error);

      setError(
        'Không thể xóa Department. Department có thể đang được Ticket sử dụng.',
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

  const filteredDepartments =
    departments.filter(
      (department) => {
        if (!keyword) {
          return true;
        }

        return (
          department.name
            .toLowerCase()
            .includes(keyword) ||
          (
            department.description ??
            ''
          )
            .toLowerCase()
            .includes(keyword)
        );
      },
    );

  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalAssignedAgents =
    departments.reduce(
      (total, department) =>
        total +
        (
          department._count
            ?.agentDepartments ?? 0
        ),
      0,
    );

  const operatingDepartments =
    departments.filter(
      (department) =>
        (
          department._count
            ?.agentDepartments ?? 0
        ) > 0 &&
        department.status,
    ).length;

  /* =========================
     UI
  ========================= */

  return (
    <div className="departments-page">
      {/* HEADER */}

      <div className="departments-header">
        <div className="departments-title">
          <div className="departments-title-icon">
            🏢
          </div>

          <div>
            <h1>Departments</h1>

            <p>
              Quản lý phòng ban và phân công
              nhân viên hỗ trợ
            </p>
          </div>
        </div>

        <button
          type="button"
          className="create-department-button"
          onClick={() => {
            setEditingDepartment(null);
            setDepartmentModalOpen(true);
          }}
        >
          <span>＋</span>
          Thêm Department
        </button>
      </div>

      {/* STATS */}

      <div className="department-stats">
        <DepartmentStat
          icon="🏢"
          title="Departments"
          value={departments.length}
          description="Tổng phòng ban"
          className="department-stat-blue"
        />

        <DepartmentStat
          icon="🎧"
          title="Phân công Agent"
          value={totalAssignedAgents}
          description="Agent - Department"
          className="department-stat-purple"
        />

        <DepartmentStat
          icon="✓"
          title="Đang vận hành"
          value={operatingDepartments}
          description="Có Agent phụ trách"
          className="department-stat-green"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="department-error">
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
              void loadDepartments()
            }
          >
            Thử lại
          </button>
        </div>
      )}

      {/* PANEL */}

      <div className="departments-panel">
        <div className="departments-toolbar">
          <div className="department-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Tìm tên hoặc mô tả Department..."
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
            className="department-refresh"
            onClick={() =>
              void loadDepartments()
            }
          >
            ↻
          </button>
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="departments-loading">
            <div className="department-spinner" />

            <span>
              Đang tải Departments...
            </span>
          </div>
        ) : filteredDepartments.length ===
          0 ? (
          <div className="departments-empty">
            <div>🏢</div>

            <h3>
              Không tìm thấy Department
            </h3>

            <p>
              Không có phòng ban phù hợp
              với từ khóa hiện tại.
            </p>
          </div>
        ) : (
          <div className="departments-grid">
            {paginatedDepartments.map(
              (department, index) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  index={index}
                  deleting={
                    deletingId === department.id
                  }
                  onEdit={() => {
                    setEditingDepartment(
                      department,
                    );

                    setDepartmentModalOpen(
                      true,
                    );
                  }}
                  onManageAgents={() => {
                    setManagingDepartment(
                      department,
                    );
                  }}
                  onDelete={() =>
                    void handleDelete(
                      department,
                    )
                  }
                />
              ),
            )}
          </div>
        )}

        {!loading && filteredDepartments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredDepartments.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <DepartmentModal
        open={departmentModalOpen}
        department={editingDepartment}
        onClose={() => {
          setDepartmentModalOpen(false);
          setEditingDepartment(null);
        }}
        onSaved={() => {
          void loadDepartments();
        }}
      />

      <ManageDepartmentAgentsModal
        open={
          managingDepartment !== null
        }
        department={managingDepartment}
        onClose={() =>
          setManagingDepartment(null)
        }
        onChanged={loadDepartments}
      />
    </div>
  );
}

/* =========================
   DEPARTMENT CARD
========================= */

interface DepartmentCardProps {
  department: Department;
  index: number;
  deleting: boolean;
  onEdit: () => void;
  onManageAgents: () => void;
  onDelete: () => void;
}

function DepartmentCard({
  department,
  index,
  deleting,
  onEdit,
  onManageAgents,
  onDelete,
}: DepartmentCardProps) {
  const agentCount =
    department._count
      ?.agentDepartments ?? 0;

  return (
    <div className="department-card">
      <div
        className={`
          department-card-banner
          department-banner-${index % 4
          }
        `}
      />

      <div className="department-card-body">
        <div className="department-card-header">
          <div
            className={`
              department-icon
              department-icon-${index % 4
              }
            `}
          >
            {getDepartmentIcon(
              index,
            )}
          </div>

          <div className="department-card-actions">
            <button
              type="button"
              className="department-edit-button"
              title="Chỉnh sửa"
              onClick={onEdit}
            >
              ✎
            </button>

            <button
              type="button"
              className="department-delete-button"
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

        <div className="department-info">
          <h3>
            {department.name}
          </h3>

          <p>
            {department.description ||
              'Chưa có mô tả cho Department này.'}
          </p>
        </div>

        <div className="department-section-title">
          <span>Agents</span>

          <span>
            {agentCount}
          </span>
        </div>

        {agentCount === 0 ? (
          <div className="empty-agents">
            👤 Chưa có Agent trong Department
          </div>
        ) : (
          <div className="assigned-agents-summary">
            👥 {agentCount} Agent đang phụ trách
          </div>
        )}

        <button
          type="button"
          className="manage-department-agents"
          onClick={onManageAgents}
        >
          <span>👥</span>
          Quản lý Agents
          <strong>→</strong>
        </button>
      </div>
    </div>
  );
}

/* =========================
   STATS
========================= */

interface DepartmentStatProps {
  icon: string;
  title: string;
  value: number;
  description: string;
  className: string;
}

function DepartmentStat({
  icon,
  title,
  value,
  description,
  className,
}: DepartmentStatProps) {
  return (
    <div
      className={`department-stat-card ${className}`}
    >
      <div className="department-stat-icon">
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

function getDepartmentIcon(
  index: number,
): string {
  const icons = [
    '🛠',
    '💻',
    '💳',
    '📦',
  ];

  return icons[
    index % icons.length
  ];
}
