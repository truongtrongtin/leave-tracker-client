import { Spinner } from "@chakra-ui/react";
import AppContext from "AppContext";
import DashboardRoute from "components/DashboardRoute";
import Employee from "pages/Employee";
import Leaves from "pages/Leaves";
import Login from "pages/Login";
import Signup from "pages/Signup";
import React, { useEffect, useState } from "react";
import { fetchData } from "utils/fetchData";
import { Redirect, Route, Switch, useLocation } from "wouter";

function App() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchData(
          `${process.env.REACT_APP_API_URL}/auth/me`
        );
        setCurrentUser(user);
        setIsLoading(false);
      } catch (error) {
        try {
          await fetchData(`${process.env.REACT_APP_API_URL}/auth/refresh`);
          const user = await fetchData(
            `${process.env.REACT_APP_API_URL}/auth/me`
          );
          setCurrentUser(user);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
      }
    };
    checkAuth();
  }, [setLocation]);

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
    <AppContext.Provider value={{ currentUser, setCurrentUser }}>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/signup">
          <Signup />
        </Route>
        <Route path="/">
          <Redirect to="/leaves" />
        </Route>
        <DashboardRoute path="/leaves">
          <Leaves />
        </DashboardRoute>
        <DashboardRoute path="/employees">
          <Employee />
        </DashboardRoute>
        <Route>Not Found!</Route>
      </Switch>
    </AppContext.Provider>
  );
}

export default App;
