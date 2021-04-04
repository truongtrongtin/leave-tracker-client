import { Spinner } from '@chakra-ui/spinner';
import { AbilityContext } from 'components/Can';
import DashboardRoute from 'components/DashboardRoute';
import ability from 'config/ability';
import Dashboard from 'pages/Dashboard';
import Employee from 'pages/Employee';
import Leaves from 'pages/Leaves';
import Login from 'pages/Login';
import Signup from 'pages/Signup';
import Holiday from 'pages/Statistics';
import { useQuery } from 'react-query';
import { fetchData } from 'services/fetchData';
import { Redirect, Route, Switch } from 'wouter';

function App() {
  const { isLoading } = useQuery('currentUser', () => fetchData('/auth/me'));

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
    <AbilityContext.Provider value={ability}>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/signup">
          <Signup />
        </Route>
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
        <DashboardRoute path="/statistics">
          <Holiday />
        </DashboardRoute>
        <Route>Not Found!</Route>
      </Switch>
    </AbilityContext.Provider>
  );
}

export default App;
