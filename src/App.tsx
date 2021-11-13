import { Box } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';
import { getMeApi } from 'api/users';
import AdminDashboardRoute from 'components/AdminDashboardRoute';
import DashboardRoute from 'components/DashboardRoute';
import LoggedOutRoute from 'components/LoggedOutRoute';
import Dashboard from 'pages/Dashboard';
import Employee from 'pages/Employee';
import Leaves from 'pages/Leaves';
import Login from 'pages/Login';
import Profile from 'pages/Profile';
import Signup from 'pages/Signup';
import Holiday from 'pages/Statistics';
import { useEffect } from 'react';
// import Test from 'pages/Grid';
import { useQuery } from 'react-query';
import { Redirect, Route, Switch } from 'wouter';
import PasswordForgot from 'pages/PasswordForgot';
import PasswordReset from 'pages/PasswordReset';

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
