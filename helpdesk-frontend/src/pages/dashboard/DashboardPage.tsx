import {
  useEffect,
  useState,
} from 'react';

import {
  Activity,
  CheckCircle2,
  Clock3,
  Headphones,
  TicketCheck,
  Users,
} from 'lucide-react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getDashboardOverview,
  getTicketsByDepartment,
  getTicketsByPriority,
  getTicketsByDay,
  getRecentTickets,
  getAgentPerformance,
  type DashboardOverview,
  type TicketsByDepartment,
  type TicketsByPriority,
  type TicketTrend,
  type RecentTicket,
  type AgentPerformance,
} from '../../api/dashboard.api';

import './DashboardPage.css';

const PIE_COLORS = [
  '#6366f1',
  '#3b82f6',
  '#f59e0b',
  '#10b981',
  '#64748b',
];

export default function DashboardPage() {
  const [overview, setOverview] =
    useState<DashboardOverview | null>(null);

  const [departments, setDepartments] =
    useState<TicketsByDepartment[]>([]);

  const [priorities, setPriorities] =
    useState<TicketsByPriority[]>([]);

  const [ticketTrend, setTicketTrend] =
    useState<TicketTrend[]>([]);

  const [recentTickets, setRecentTickets] =
    useState<RecentTicket[]>([]);

  const [agentPerformance, setAgentPerformance] =
    useState<AgentPerformance[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          overviewData,
          departmentData,
          priorityData,
          trendData,
          recentData,
          agentData,
        ] = await Promise.all([
          getDashboardOverview(),
          getTicketsByDepartment(),
          getTicketsByPriority(),
          getTicketsByDay(),
          getRecentTickets(),
          getAgentPerformance(),
        ]);

        setOverview(overviewData);
        setDepartments(departmentData);
        setPriorities(priorityData);
        setTicketTrend(trendData);
        setRecentTickets(recentData);
        setAgentPerformance(agentData);
      } catch (error) {
        console.error(error);

        setError(
          'Không thể tải dữ liệu Dashboard.',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Đang tải Dashboard...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="dashboard-error">
        {error ||
          'Không có dữ liệu Dashboard.'}
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            HELPDESK OVERVIEW
          </span>

          <h1>Dashboard</h1>

          <p>
            Tổng quan hoạt động hỗ trợ
            khách hàng.
          </p>
        </div>

        <div className="dashboard-live">
          <span />
          Live System
        </div>
      </div>

      {/* KPI */}

      <div className="dashboard-kpis">
        <KpiCard
          title="Tổng Ticket"
          value={overview?.tickets.total ?? 0}
          icon={<TicketCheck />}
          variant="purple"
        />

        <KpiCard
          title="Đang mở"
          value={overview?.tickets.open ?? 0}
          icon={<Activity />}
          variant="blue"
        />

        <KpiCard
          title="Đang xử lý"
          value={overview?.tickets.inProgress ?? 0}
          icon={<Activity />}
          variant="blue"
        />

        <KpiCard
          title="Đang chờ"
          value={overview?.tickets.waiting ?? 0}
          icon={<Clock3 />}
          variant="orange"
        />

        <KpiCard
          title="Đã giải quyết"
          value={overview?.tickets.resolved ?? 0}
          icon={<CheckCircle2 />}
          variant="green"
        />

        <KpiCard
          title="Agent Online"
          value={overview?.agents.online ?? 0}
          icon={<Headphones />}
          variant="blue"
        />
      </div>

      {/* CHART ROW 1 */}

      <div className="dashboard-chart-grid">
        <section className="dashboard-card trend-card">
          <div className="chart-heading">
            <div>
              <h2>
                Ticket 7 ngày gần nhất
              </h2>

              <p>
                Số yêu cầu hỗ trợ được
                tạo theo ngày
              </p>
            </div>

            <span className="chart-badge">
              7 ngày
            </span>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={ticketTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="date" />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="Tickets"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-card status-card">
          <div className="chart-heading">
            <div>
              <h2>
                Ticket theo Priority
              </h2>

              <p>
                Phân bố mức độ ưu tiên
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={priorities}
                  dataKey="total"
                  nameKey="priority"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {priorities.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* CHART ROW 2 */}

      <div className="dashboard-bottom-grid">
        <section className="dashboard-card">
          <div className="chart-heading">
            <div>
              <h2>
                Ticket theo Department
              </h2>

              <p>
                Khối lượng yêu cầu của
                từng bộ phận
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={departments}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="departmentName"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Bar
                  dataKey="totalTickets"
                  name="Tickets"
                  fill="#6366f1"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-card dashboard-summary">
          <div className="chart-heading">
            <div>
              <h2>
                Tổng quan hệ thống
              </h2>

              <p>
                Dữ liệu hoạt động
                hiện tại
              </p>
            </div>
          </div>

          <SummaryItem
            icon={<Users />}
            label="Khách hàng"
            value={overview?.customers.total ?? 0}
          />

          <SummaryItem
            icon={<Headphones />}
            label="Tổng Agent"
            value={overview?.agents.total ?? 0}
          />

          <SummaryItem
            icon={<Activity />}
            label="Agent Online"
            value={overview?.agents.online ?? 0}
          />

          <SummaryItem
            icon={<TicketCheck />}
            label="Ticket đang mở"
            value={overview?.tickets.open ?? 0}
          />
        </section>
      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: string;
}

function KpiCard({
  title,
  value,
  icon,
  variant,
}: KpiCardProps) {
  return (
    <article
      className={`dashboard-kpi ${variant}`}
    >
      <div className="kpi-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function SummaryItem({
  icon,
  label,
  value,
}: SummaryItemProps) {
  return (
    <div className="summary-item">
      <div className="summary-icon">
        {icon}
      </div>

      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}