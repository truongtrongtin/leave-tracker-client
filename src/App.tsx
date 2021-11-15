import { Box, Spinner } from '@chakra-ui/react';
import { getMeApi } from 'api/users';
import AdminDashboardRoute from 'components/AdminDashboardRoute';
import DashboardRoute from 'components/DashboardRoute';
import LoggedOutRoute from 'components/LoggedOutRoute';
import Dashboard from 'pages/Dashboard';
import Employee from 'pages/Employee';
import Leaves from 'pages/Leaves';
import Login from 'pages/Login';
import PasswordForgot from 'pages/PasswordForgot';
import PasswordReset from 'pages/PasswordReset';
import Profile from 'pages/Profile';
import Signup from 'pages/Signup';
import Holiday from 'pages/Statistics';
import { useEffect } from 'react';
// import Test from 'pages/Grid';
import { useQuery } from 'react-query';
import { Redirect, Route, Switch } from 'wouter';

function App() {
  const { isLoading } = useQuery('currentUser', () => getMeApi());

  useEffect(() => {
    const websocket = new WebSocket(process.env.REACT_APP_SOCKET_URL!);
    websocket.onopen = () => {
      console.log('connected');
    };

    return () => {
      websocket.close();
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
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <DashboardRoute path="/profile">
        <Profile />
      </DashboardRoute>
      <DashboardRoute path="/dashboard">
        <Dashboard />
      </DashboardRoute>
      <DashboardRoute path="/leaves">
        <Leaves />
      </DashboardRoute>
      <DashboardRoute path="/employees">
        <Employee />
      </DashboardRoute>
      <AdminDashboardRoute path="/statistics">
        <Holiday />
      </AdminDashboardRoute>
      <AdminDashboardRoute path="/test">
        {/* <Test /> */}
        <Box
          display="grid"
          gridTemplateRows="50px 100px"
          gridTemplateColumns="1fr 1fr 2fr"
          gridGap="1px"
        >
          <Box backgroundColor="red" textAlign="center">
            1
          </Box>
          <Box backgroundColor="red" textAlign="center">
            2
          </Box>
          <Box backgroundColor="red" textAlign="center">
            3
          </Box>
          <Box backgroundColor="red" textAlign="center">
            4
          </Box>
          <Box backgroundColor="red" textAlign="center">
            5
          </Box>
          <Box backgroundColor="red" textAlign="center">
            6
          </Box>
        </Box>
      </AdminDashboardRoute>
      <Route>Not Found!</Route>
    </Switch>
  );
}

export default App;
