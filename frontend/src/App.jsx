import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import AskQuestion from './pages/AskQuestion';
import PostDetail from './pages/PostDetail';
import Assessments from './pages/Assessments';
import TakeAssessment from './pages/TakeAssessment';
import AssessmentResult from './pages/AssessmentResult';
import AssessmentHistory from './pages/AssessmentHistory';
import EmergencyHelp from './pages/EmergencyHelp';
import Resources from './pages/Resources';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/ask"
            element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <Assessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/history"
            element={
              <ProtectedRoute>
                <AssessmentHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:type/result"
            element={
              <ProtectedRoute>
                <AssessmentResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:type"
            element={
              <ProtectedRoute>
                <TakeAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <EmergencyHelp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
