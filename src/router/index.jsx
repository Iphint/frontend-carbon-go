import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../api/AuthContext.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Onboarding from "../pages/Onboarding.jsx";
import Home from "../pages/Home.jsx";
import SurveyLog from "../pages/SurveyLog.jsx";
import GoTracker from "../pages/GoTracker.jsx";
import Progress from "../pages/Progress.jsx";
import Rankings from "../pages/Rankings.jsx";
import Profile from "../pages/Profile.jsx";

function ProtectedRoute() {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <div className="page-loader">Loading Carbon-Go...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

function OnboardingRoute() {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <div className="page-loader">Loading Carbon-Go...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (onboardingComplete) return <Navigate to="/" replace />;
  return <Onboarding />;
}

function PublicRoute() {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <div className="page-loader">Loading Carbon-Go...</div>;
  if (user) return <Navigate to={onboardingComplete ? "/" : "/onboarding"} replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> }
    ]
  },
  { path: "/onboarding", element: <OnboardingRoute /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/survey", element: <SurveyLog /> },
          { path: "/tracker", element: <GoTracker /> },
          { path: "/progress", element: <Progress /> },
          { path: "/rankings", element: <Rankings /> },
          { path: "/profile", element: <Profile /> }
        ]
      }
    ]
  }
]);
