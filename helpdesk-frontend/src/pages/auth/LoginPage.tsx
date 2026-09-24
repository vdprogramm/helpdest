import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';

import { login } from '../../api/auth.api';

import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) {
      return;
    }

    if (user.role === 'ADMIN') {
      navigate('/dashboard', {
        replace: true,
      });
    } else if (user.role === 'AGENT') {
      navigate('/conversations', {
        replace: true,
      });
    }
  }, [navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const result = await login({
        email,
        password,
      });

      localStorage.setItem(
        'accessToken',
        result.accessToken,
      );

      const currentUser =
        getCurrentUser();

      if (currentUser?.role === 'ADMIN') {
        navigate('/dashboard', {
          replace: true,
        });
      } else if (
        currentUser?.role === 'AGENT'
      ) {
        navigate('/conversations', {
          replace: true,
        });
      } else {
        localStorage.removeItem(
          'accessToken',
        );

        setError(
          'Tài khoản không có quyền truy cập.',
        );
      }
    } catch {
      setError(
        'Email hoặc mật khẩu không chính xác',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            H
          </div>

          <h1>Helpdesk</h1>

          <p>
            Đăng nhập vào hệ thống quản lý hỗ trợ
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="admin@helpdesk.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Đang đăng nhập...'
              : 'Đăng nhập'}
          </button>

        </form>

        <div className="login-footer">
          Helpdesk Management System
        </div>

      </div>
    </div>
  );
}