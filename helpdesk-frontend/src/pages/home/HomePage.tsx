import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Headphones,
  LockKeyhole,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users,
  Zap,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Decorative background */}
      <div className="home-glow home-glow-one" />
      <div className="home-glow home-glow-two" />

      {/* HEADER */}
      <header className="home-header">
        <Link
          to="/"
          className="home-brand"
        >
          <div className="home-brand-icon">
            <Headphones size={25} />
          </div>

          <div>
            <strong>
              HelpDesk
            </strong>

            <span>
              Support Center
            </span>
          </div>
        </Link>

        <nav className="home-nav">
          <a href="#features">
            Tính năng
          </a>

          <a href="#workflow">
            Quy trình
          </a>

          <Link
            to="/support"
            className="support-link"
          >
            <MessageCircleMore
              size={18}
            />

            Support
          </Link>

          <Link
            to="/login"
            className="login-link"
          >
            <LockKeyhole
              size={17}
            />

            Đăng nhập
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <main>
        <section className="home-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />

              Nền tảng hỗ trợ khách hàng
              thông minh
            </div>

            <h1>
              Quản lý hỗ trợ
              khách hàng
              <span>
                {' '}nhanh chóng
                và hiệu quả.
              </span>
            </h1>

            <p className="hero-description">
              HelpDesk giúp doanh nghiệp
              quản lý yêu cầu hỗ trợ,
              phân công nhân viên và
              trò chuyện trực tiếp với
              khách hàng trên một nền
              tảng duy nhất.
            </p>

            <div className="hero-actions">
              <Link
                to="/support"
                className="hero-primary"
              >
                <MessageCircleMore
                  size={20}
                />

                Yêu cầu hỗ trợ

                <ArrowRight
                  size={19}
                />
              </Link>

              <Link
                to="/login"
                className="hero-secondary"
              >
                <LockKeyhole
                  size={19}
                />

                Đăng nhập nhân viên
              </Link>
            </div>

            <div className="hero-points">
              <span>
                <CheckCircle2
                  size={17}
                />
                Hỗ trợ realtime
              </span>

              <span>
                <CheckCircle2
                  size={17}
                />
                Quản lý Ticket
              </span>

              <span>
                <CheckCircle2
                  size={17}
                />
                Phân công Agent
              </span>
            </div>
          </div>

          {/* HERO MOCKUP */}
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div>
                  <span className="preview-label">
                    HELPDESK OVERVIEW
                  </span>

                  <h3>
                    Trung tâm hỗ trợ
                  </h3>
                </div>

                <div className="online-badge">
                  <span />
                  Live
                </div>
              </div>

              <div className="preview-stats">
                <div className="preview-stat purple">
                  <div className="preview-stat-icon">
                    <TicketCheck />
                  </div>

                  <div>
                    <span>
                      Tickets
                    </span>
                    <strong>
                      128
                    </strong>
                  </div>
                </div>

                <div className="preview-stat blue">
                  <div className="preview-stat-icon">
                    <MessageCircleMore />
                  </div>

                  <div>
                    <span>
                      Đang xử lý
                    </span>
                    <strong>
                      24
                    </strong>
                  </div>
                </div>

                <div className="preview-stat green">
                  <div className="preview-stat-icon">
                    <Users />
                  </div>

                  <div>
                    <span>
                      Agents
                    </span>
                    <strong>
                      12
                    </strong>
                  </div>
                </div>
              </div>

              <div className="preview-conversation">
                <div className="conversation-top">
                  <div className="customer-avatar">
                    NA
                  </div>

                  <div>
                    <strong>
                      Nguyễn Anh
                    </strong>

                    <span>
                      Technical Support
                    </span>
                  </div>

                  <div className="conversation-status">
                    Đang hỗ trợ
                  </div>
                </div>

                <div className="chat-preview">
                  <div className="chat-message customer">
                    Tôi cần hỗ trợ về tài
                    khoản của mình.
                  </div>

                  <div className="chat-message agent">
                    Xin chào! Tôi sẽ hỗ
                    trợ bạn ngay.
                  </div>

                  <div className="typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-card floating-one">
              <div className="floating-icon">
                <Zap size={20} />
              </div>

              <div>
                <strong>
                  Phản hồi nhanh
                </strong>
                <span>
                  Realtime Support
                </span>
              </div>
            </div>

            <div className="floating-card floating-two">
              <div className="floating-check">
                <CheckCircle2
                  size={20}
                />
              </div>

              <div>
                <strong>
                  Ticket #128
                </strong>
                <span>
                  Đã giải quyết
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="home-statistics">
          <div>
            <strong>
              24/7
            </strong>
            <span>
              Tiếp nhận yêu cầu
            </span>
          </div>

          <div>
            <strong>
              Realtime
            </strong>
            <span>
              Chat trực tiếp
            </span>
          </div>

          <div>
            <strong>
              Smart
            </strong>
            <span>
              Phân công Agent
            </span>
          </div>

          <div>
            <strong>
              Secure
            </strong>
            <span>
              Phân quyền hệ thống
            </span>
          </div>
        </section>

        {/* FEATURES */}
        <section
          className="features-section"
          id="features"
        >
          <div className="section-heading">
            <span>
              TÍNH NĂNG NỔI BẬT
            </span>

            <h2>
              Mọi thứ cần thiết cho
              một hệ thống Helpdesk
            </h2>

            <p>
              Từ tiếp nhận yêu cầu đến
              phân công và xử lý, tất cả
              được quản lý tập trung.
            </p>
          </div>

          <div className="feature-grid">
            <FeatureCard
              icon={<TicketCheck />}
              title="Ticket Management"
              description="Theo dõi và quản lý toàn bộ yêu cầu hỗ trợ của khách hàng."
              className="feature-purple"
            />

            <FeatureCard
              icon={
                <MessageCircleMore />
              }
              title="Realtime Chat"
              description="Khách hàng và Agent trao đổi trực tiếp theo thời gian thực."
              className="feature-blue"
            />

            <FeatureCard
              icon={<Users />}
              title="Agent Management"
              description="Quản lý Agent và phân công nhân viên theo từng bộ phận."
              className="feature-orange"
            />

            <FeatureCard
              icon={<BarChart3 />}
              title="Dashboard"
              description="Theo dõi tình trạng Ticket và hoạt động hỗ trợ trực quan."
              className="feature-green"
            />

            <FeatureCard
              icon={<Zap />}
              title="Smart Assignment"
              description="Hỗ trợ phân công yêu cầu cho Agent phù hợp đang trực tuyến."
              className="feature-pink"
            />

            <FeatureCard
              icon={<ShieldCheck />}
              title="Role Security"
              description="Phân quyền rõ ràng giữa Admin, Agent và khách hàng."
              className="feature-cyan"
            />
          </div>
        </section>

        {/* WORKFLOW */}
        <section
          className="workflow-section"
          id="workflow"
        >
          <div className="section-heading">
            <span>
              QUY TRÌNH HỖ TRỢ
            </span>

            <h2>
              Đơn giản từ yêu cầu
              đến giải quyết
            </h2>
          </div>

          <div className="workflow-list">
            <Workflow
              number="01"
              icon={
                <MessageCircleMore />
              }
              title="Gửi yêu cầu"
              description="Khách hàng nhập thông tin và mô tả vấn đề cần hỗ trợ."
            />

            <div className="workflow-arrow">
              →
            </div>

            <Workflow
              number="02"
              icon={<TicketCheck />}
              title="Tạo Ticket"
              description="Hệ thống ghi nhận yêu cầu và tạo Ticket hỗ trợ."
            />

            <div className="workflow-arrow">
              →
            </div>

            <Workflow
              number="03"
              icon={<Headphones />}
              title="Agent xử lý"
              description="Agent tiếp nhận và trò chuyện realtime với khách hàng."
            />

            <div className="workflow-arrow">
              →
            </div>

            <Workflow
              number="04"
              icon={
                <CheckCircle2 />
              }
              title="Hoàn thành"
              description="Vấn đề được giải quyết và yêu cầu được đóng."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="home-cta">
          <div>
            <span className="cta-badge">
              <Clock3 size={16} />
              Support Center
            </span>

            <h2>
              Bạn đang cần
              hỗ trợ?
            </h2>

            <p>
              Gửi yêu cầu ngay để được
              kết nối với bộ phận hỗ trợ
              phù hợp.
            </p>
          </div>

          <Link
            to="/support"
            className="cta-button"
          >
            Bắt đầu hỗ trợ
            <ArrowRight size={20} />
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-brand">
          <div className="home-brand-icon">
            <Headphones size={22} />
          </div>

          <div>
            <strong>
              HelpDesk
            </strong>

            <span>
              Support Center
            </span>
          </div>
        </div>

        <p>
          © 2026 HelpDesk Management
          System
        </p>

        <div className="footer-links">
          <Link to="/support">
            Support
          </Link>

          <Link to="/login">
            Staff Login
          </Link>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className: string;
}

function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={`feature-card ${className}`}
    >
      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <div className="feature-more">
        Khám phá
        <ArrowRight size={16} />
      </div>
    </article>
  );
}

interface WorkflowProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Workflow({
  number,
  icon,
  title,
  description,
}: WorkflowProps) {
  return (
    <article className="workflow-card">
      <span className="workflow-number">
        {number}
      </span>

      <div className="workflow-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </article>
  );
}
