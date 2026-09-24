import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';

import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';

import DashboardPage from '../pages/dashboard/DashboardPage';

import TicketsPage from '../pages/tickets/TicketsPage';

import TicketDetailPage from '../pages/tickets/TicketDetailPage';

import ConversationsPage from '../pages/conversations/ConversationsPage';

import CustomersPage from '../pages/customers/CustomersPage';

import AgentsPage from '../pages/agents/AgentsPage';

import DepartmentsPage from '../pages/departments/DepartmentsPage';

import CannedResponsesPage from '../pages/canned-responses/CannedResponsesPage';

import UnauthorizedPage from '../pages/errors/UnauthorizedPage';

import CustomerChatPage from '../pages/customer-chat/CustomerChatPage';

import HomePage from '../pages/home/HomePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/unauthorized"
          element={
            <UnauthorizedPage />
          }
        />

        <Route
          path="/support"
          element={
            <CustomerChatPage />
          }
        />

        {/* LOGIN REQUIRED */}
        <Route
          element={
            <ProtectedRoute />
          }
        >
          <Route
            element={
              <MainLayout />
            }
          >
            <Route
              path="/dashboard"
              element={
                <DashboardPage />
              }
            />

            <Route
              path="/tickets"
              element={
                <TicketsPage />
              }
            />

            <Route
              path="/tickets/:id"
              element={
                <TicketDetailPage />
              }
            />
          </Route>
        </Route>

        {/* AGENT */}
        <Route
          element={
            <ProtectedRoute
              roles={['AGENT']}
            />
          }
        >
          <Route
            element={
              <MainLayout />
            }
          >
            <Route
              path="/conversations"
              element={
                <ConversationsPage />
              }
            />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route
          element={
            <ProtectedRoute
              roles={['ADMIN']}
            />
          }
        >
          <Route
            element={
              <MainLayout />
            }
          >
            <Route
              path="/customers"
              element={
                <CustomersPage />
              }
            />

            <Route
              path="/agents"
              element={
                <AgentsPage />
              }
            />

            <Route
              path="/departments"
              element={
                <DepartmentsPage />
              }
            />

            <Route
              path="/canned-responses"
              element={
                <CannedResponsesPage />
              }
            />
          </Route>
        </Route>

        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}