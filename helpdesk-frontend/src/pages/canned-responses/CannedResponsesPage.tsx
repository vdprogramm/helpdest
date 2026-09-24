import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  deleteCannedResponse,
  getCannedResponses,
  type CannedResponse,
} from '../../api/canned-responses.api';

import './CannedResponsesPage.css';
import CannedResponseFormModal from '../../components/canned-responses/CannedResponseFormModal';
import Pagination from '../../components/common/Pagination';

export default function CannedResponsesPage() {
  const [responses, setResponses] =
    useState<CannedResponse[]>([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    cannedModalOpen,
    setCannedModalOpen,
  ] = useState(false);

  const [
    editingResponse,
    setEditingResponse,
  ] = useState<CannedResponse | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const loadResponses =
    useCallback(async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await getCannedResponses();

        setResponses(data);
      } catch (error) {
        console.error(error);

        setError(
          'Không thể tải danh sách câu trả lời mẫu.',
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadResponses();
  }, [loadResponses]);

  const handleDelete = async (
    response: CannedResponse,
  ) => {
    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa "${response.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(response.id);
      setError('');

      await deleteCannedResponse(
        response.id,
      );

      setResponses((current) =>
        current.filter(
          (item) =>
            item.id !== response.id,
        ),
      );
    } catch (error) {
      console.error(error);

      setError(
        'Không thể xóa câu trả lời mẫu.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  const keyword =
    search.trim().toLowerCase();

  const filteredResponses =
    responses.filter((response) => {
      if (!keyword) {
        return true;
      }

      return (
        response.title
          .toLowerCase()
          .includes(keyword) ||
        response.content
          .toLowerCase()
          .includes(keyword)
      );
    });

  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const recentlyCreated =
    responses.filter(
      (response) =>
        isRecent(
          response.createdAt,
        ),
    ).length;

  return (
    <div className="canned-page">
      {/* HEADER */}

      <div className="canned-page-header">
        <div className="canned-page-title">
          <div className="canned-page-title-icon">
            ⚡
          </div>

          <div>
            <h1>
              Canned Responses
            </h1>

            <p>
              Quản lý các câu trả lời nhanh
              dành cho Agent
            </p>
          </div>
        </div>

        <button
          type="button"
          className="create-canned-button"
          onClick={() => {
            setEditingResponse(null);
            setCannedModalOpen(true);
          }}
        >
          <span>＋</span>
          Thêm câu trả lời
        </button>
      </div>

      {/* STATS */}

      <div className="canned-stats">
        <StatCard
          icon="⚡"
          title="Tổng câu trả lời"
          value={responses.length}
          description="Mẫu đang có"
          className="canned-stat-purple"
        />

        <StatCard
          icon="✨"
          title="Mới tạo"
          value={recentlyCreated}
          description="Trong 7 ngày"
          className="canned-stat-blue"
        />

        <StatCard
          icon="💬"
          title="Hỗ trợ Chat"
          value={responses.length}
          description="Có thể sử dụng"
          className="canned-stat-green"
        />
      </div>

      {error && (
        <div className="canned-page-error">
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
              void loadResponses()
            }
          >
            Thử lại
          </button>
        </div>
      )}

      {/* PANEL */}

      <div className="canned-panel">
        <div className="canned-toolbar">
          <div className="canned-page-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Tìm tiêu đề hoặc nội dung..."
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
            className="canned-refresh"
            onClick={() =>
              void loadResponses()
            }
          >
            ↻
          </button>
        </div>

        {loading ? (
          <div className="canned-page-loading">
            <div className="canned-page-spinner" />

            <span>
              Đang tải câu trả lời...
            </span>
          </div>
        ) : filteredResponses.length ===
          0 ? (
          <div className="canned-page-empty">
            <div>💬</div>

            <h3>
              Không có câu trả lời mẫu
            </h3>

            <p>
              Tạo mẫu để Agent có thể
              phản hồi khách hàng nhanh hơn.
            </p>
          </div>
        ) : (
          <div className="canned-response-grid">
            {paginatedResponses.map(
              (response, index) => (
                <CannedCard
                  key={response.id}
                  response={response}
                  index={index}
                  deleting={
                    deletingId ===
                    response.id
                  }
                  onEdit={() => {
                    setEditingResponse(response);
                    setCannedModalOpen(true);
                  }}
                  onDelete={() =>
                    void handleDelete(
                      response,
                    )
                  }
                />
              ),
            )}
          </div>
        )}

        {!loading && filteredResponses.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredResponses.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <CannedResponseFormModal
        open={cannedModalOpen}
        response={editingResponse}
        onClose={() => {
          setCannedModalOpen(false);
          setEditingResponse(null);
        }}
        onSaved={(savedResponse) => {
          setResponses((current) => {
            const exists =
              current.some(
                (response) =>
                  response.id ===
                  savedResponse.id,
              );

            if (exists) {
              return current.map(
                (response) =>
                  response.id ===
                  savedResponse.id
                    ? savedResponse
                    : response,
              );
            }

            return [
              savedResponse,
              ...current,
            ];
          });
        }}
      />
    </div>
  );
}

interface CannedCardProps {
  response: CannedResponse;
  index: number;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function CannedCard({
  response,
  index,
  deleting,
  onEdit,
  onDelete,
}: CannedCardProps) {
  return (
    <div className="canned-response-card">
      <div
        className={`
          canned-response-icon
          canned-response-color-${
            index % 4
          }
        `}
      >
        ⚡
      </div>

      <div className="canned-response-card-header">
        <div>
          <span>
            QUICK RESPONSE
          </span>

          <h3>
            {response.title}
          </h3>
        </div>

        <div className="canned-card-actions">
          <button
            type="button"
            className="canned-edit-button"
            title="Chỉnh sửa"
            onClick={onEdit}
          >
            ✎
          </button>

          <button
            type="button"
            className="canned-delete-button"
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

      <div className="canned-response-content">
        <span>“</span>

        <p>
          {response.content}
        </p>
      </div>

      <div className="canned-card-footer">
        <span>
          📅{' '}
          {formatDate(
            response.createdAt,
          )}
        </span>

        <span className="canned-ready">
          ● Ready
        </span>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  title: string;
  value: number;
  description: string;
  className: string;
}

function StatCard({
  icon,
  title,
  value,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={`canned-stat-card ${className}`}
    >
      <div className="canned-stat-icon">
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

function isRecent(
  value: string,
): boolean {
  const created =
    new Date(value).getTime();

  const sevenDays =
    7 * 24 * 60 * 60 * 1000;

  return (
    Date.now() - created <=
    sevenDays
  );
}
