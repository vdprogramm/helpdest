import {
  useNavigate,
} from 'react-router-dom';

import './UnauthorizedPage.css';

export default function UnauthorizedPage() {
  const navigate =
    useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          🔒
        </div>

        <span className="unauthorized-code">
          403
        </span>

        <h1>
          Không có quyền truy cập
        </h1>

        <p>
          Tài khoản hiện tại không có
          quyền truy cập chức năng này.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/dashboard',
            )
          }
        >
          ← Về Dashboard
        </button>
      </div>
    </div>
  );
}
