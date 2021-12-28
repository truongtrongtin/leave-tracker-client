import { Spinner } from '@chakra-ui/react';
import { getMeApi } from 'api/users';
import DashboardLayout from 'layouts/DashboardLayout';
import Dashboard from 'pages/Dashboard';
import Employee from 'pages/Employee';
import Test from 'pages/Grid';
import Leaves from 'pages/Leaves';
import Login from 'pages/Login';
import PasswordForgot from 'pages/PasswordForgot';
import PasswordReset from 'pages/PasswordReset';
import Profile from 'pages/Profile';
import Signup from 'pages/Signup';
import Statistics from 'pages/Statistics';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import AdminRoute from 'routes/AdminRoute';
import LoggedInRoute from 'routes/LoggedInRoute';
import LoggedOutRoute from 'routes/LoggedOutRoute';
import { Redirect, Route, Switch } from 'wouter';

function App() {
  const { isLoading } = useQuery('currentUser', () => getMeApi());

  useEffect(() => {
    const websocket = new WebSocket(process.env.REACT_APP_SOCKET_URL!);
    websocket.onopen = () => {
      console.log('websocket connected');
    };
  }, []);

  useEffect(() => {
    // remove facebook redirect fragment
    if (window.location.hash === '#_=_') {
      window.history.replaceState
        ? window.history.replaceState(
            '',
            '',
            window.location.href.split('#')[0],
          )
        : (window.location.hash = '');
    }
  }, []);

  useEffect(() => {
    function changeFavicon(text: string) {
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.height = 64;
      canvas.width = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = '60px sans-serif';
      ctx.textBaseline = 'ideographic';
      ctx.fillStyle = 'green';
      ctx.fillText(text, 0, 64);

      const link = document.createElement('link');
      const oldLinks = document.querySelectorAll('link[rel="icon"]');
      oldLinks.forEach((e) => {
        if (e.parentNode) e.parentNode.removeChild(e);
      });
      link.id = 'dynamic-favicon';
      link.rel = 'icon';
      link.href = canvas.toDataURL();
      document.head.appendChild(link);
    }

    function updateDailyDate() {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const millisTillNewDay = nextMidnight.getTime() - now.getTime();

      changeFavicon(`${now.getDate()}`);
      setTimeout(() => updateDailyDate(), millisTillNewDay);
    }
    updateDailyDate();
  });

  if (isLoading) {
    return (
      <Spinner
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
      />
    );
  }

  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <LoggedOutRoute path="/login">
        <Login />
      </LoggedOutRoute>
      <LoggedOutRoute path="/signup">
        <Signup />
      </LoggedOutRoute>
      <Route path="/forgot">
        <PasswordForgot />
      </Route>
      <Route path="/password-reset">
        <PasswordReset />
      </Route>
      <LoggedInRoute path="/profile">
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      </LoggedInRoute>
      <LoggedInRoute path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </LoggedInRoute>
      <LoggedInRoute path="/leaves">
        <DashboardLayout>
          <Leaves />
        </DashboardLayout>
      </LoggedInRoute>
      <LoggedInRoute path="/employees">
        <DashboardLayout>
          <Employee />
        </DashboardLayout>
      </LoggedInRoute>
      <AdminRoute path="/statistics">
        <DashboardLayout>
          <Statistics />
        </DashboardLayout>
      </AdminRoute>
      <AdminRoute path="/test">
        <Test />
      </AdminRoute>
      <Route>Not Found!</Route>
    </Switch>
  );
}

export default App;
