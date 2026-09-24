import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { destroyChatSocket } from '../../socket/chat.socket';

import './MainLayout.css';

export default function MainLayout() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        destroyChatSocket();
        localStorage.removeItem('accessToken');
        navigate('/login', { replace: true });
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">H</div>

                    <div>
                        <h2>Helpdesk</h2>
                        <span>Support Center</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    {(() => {
                        const menuItems = [
                            { label: 'Dashboard', path: '/dashboard', icon: '▦', roles: ['ADMIN'] },
                            { label: 'Tickets', path: '/tickets', icon: '🎫', roles: ['ADMIN', 'AGENT'] },
                            { label: 'Conversations', path: '/conversations', icon: '💬', roles: ['AGENT'] },
                            { label: 'Customers', path: '/customers', icon: '👤', roles: ['ADMIN'] },
                            { label: 'Agents', path: '/agents', icon: '🎧', roles: ['ADMIN'] },
                            { label: 'Departments', path: '/departments', icon: '🏢', roles: ['ADMIN'] },
                            { label: 'Canned Responses', path: '/canned-responses', icon: '⚡', roles: ['ADMIN'] },
                        ];

                        const visibleMenuItems = menuItems.filter(
                            (item) => user && item.roles.includes(user.role)
                        );

                        return visibleMenuItems.map((item) => (
                            <NavLink key={item.path} to={item.path} className="menu-item">
                                <span>{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ));
                    })()}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div>
                        <h3>Helpdesk Management</h3>
                        <p>Quản lý và hỗ trợ khách hàng</p>
                    </div>

                    <div className="topbar-actions">
                        <button className="notification-button">
                            ♢
                            <span className="notification-dot" />
                        </button>

                        <div className="admin-profile">
                            <div className="admin-avatar">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            <div>
                                <strong>{user?.name || 'User'}</strong>
                                <span>{user?.role || 'UNKNOWN'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="page-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}