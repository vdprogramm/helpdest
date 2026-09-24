import { useEffect, useState } from 'react';

import {
    getCannedResponses,
    type CannedResponse,
} from '../../api/canned-responses.api';

import './CannedResponseModal.css';

interface CannedResponseModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (content: string) => void;
}

export default function CannedResponseModal({
    open,
    onClose,
    onSelect,
}: CannedResponseModalProps) {
    const [responses, setResponses] = useState<CannedResponse[]>([]);
    const [search, setSearch] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        const loadResponses = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await getCannedResponses();

                setResponses(data);
            } catch (error) {
                console.error(error);

                setError(
                    'Không thể tải danh sách câu trả lời mẫu.',
                );
            } finally {
                setLoading(false);
            }
        };

        void loadResponses();
    }, [open]);

    useEffect(() => {
        if (!open) {
            setSearch('');
            setError('');
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const keyword = search
        .trim()
        .toLowerCase();

    const filteredResponses = responses.filter(
        (response) => {
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
        },
    );

    const handleSelect = (
        response: CannedResponse,
    ) => {
        onSelect(response.content);
        onClose();
    };

    return (
        <div
            className="canned-modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="canned-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="canned-modal-header">
                    <div className="canned-header-icon">
                        ⚡
                    </div>

                    <div>
                        <h2>Canned Responses</h2>

                        <p>
                            Chọn câu trả lời nhanh cho khách hàng
                        </p>
                    </div>

                    <button
                        type="button"
                        className="canned-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="canned-search-wrapper">
                    <div className="canned-search">
                        <span>⌕</span>

                        <input
                            autoFocus
                            type="text"
                            placeholder="Tìm câu trả lời mẫu..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <div className="canned-count">
                        {filteredResponses.length} mẫu
                    </div>
                </div>

                <div className="canned-content">
                    {error && (
                        <div className="canned-error">
                            <span>!</span>

                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="canned-loading">
                            <div className="canned-spinner" />

                            <span>
                                Đang tải câu trả lời...
                            </span>
                        </div>
                    ) : filteredResponses.length === 0 ? (
                        <div className="canned-empty">
                            <div>💬</div>

                            <strong>
                                Không tìm thấy câu trả lời
                            </strong>

                            <p>
                                Chưa có mẫu phù hợp với từ khóa
                                hiện tại.
                            </p>
                        </div>
                    ) : (
                        <div className="canned-list">
                            {filteredResponses.map(
                                (response, index) => (
                                    <button
                                        type="button"
                                        key={response.id}
                                        className="canned-item"
                                        onClick={() =>
                                            handleSelect(response)
                                        }
                                    >
                                        <div
                                            className={`
                        canned-item-icon
                        canned-color-${index % 4
                                                }
                      `}
                                        >
                                            ⚡
                                        </div>

                                        <div className="canned-item-content">
                                            <strong>
                                                {response.title}
                                            </strong>

                                            <p>
                                                {response.content}
                                            </p>
                                        </div>

                                        <div className="canned-use">
                                            Chọn
                                            <span>→</span>
                                        </div>
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </div>

                <div className="canned-footer">
                    <span>
                        💡 Nội dung sẽ được chèn vào ô
                        chat trước khi gửi.
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}