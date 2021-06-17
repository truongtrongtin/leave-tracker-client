import { Spinner } from '@chakra-ui/spinner';
import { getMeApi } from 'api/auth';
import AdminDashboardRoute from 'components/AdminDashboardRoute';
import DashboardRoute from 'components/DashboardRoute';
import Dashboard from 'pages/Dashboard';
import Employee from 'pages/Employee';
import Leaves from 'pages/Leaves';
import Login from 'pages/Login';
import Signup from 'pages/Signup';
import Holiday from 'pages/Statistics';
// import Test from 'pages/Grid';
import { useQuery } from 'react-query';
import { Redirect, Route, Switch } from 'wouter';
import { Box } from '@chakra-ui/react';
import LoggedOutRoute from 'components/LoggedOutRoute';

function App() {
  const { isLoading } = useQuery('currentUser', () => getMeApi());

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
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
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
