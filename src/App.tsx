import { Spinner } from "@chakra-ui/react";
import AppContext from "AppContext";
import { AbilityContext } from "components/Can";
import DashboardRoute from "components/DashboardRoute";
import ability, { defineRulesFor } from "config/ability";
import Dashboard from "pages/Dashboard";
import Employee from "pages/Employee";
import Holiday from "pages/Holidays";
import Leaves from "pages/Leaves";
import Login from "pages/Login";
import Signup from "pages/Signup";
import React, { useEffect, useState } from "react";
import { fetchData } from "services/fetchData";
import { Redirect, Route, Switch, useLocation } from "wouter";

function App() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // bootstrap app

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchData("/auth/me");
        setCurrentUser(user);
        ability.update(defineRulesFor(user));
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
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
    <AppContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
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
          <DashboardRoute path="/holidays">
            <Holiday />
          </DashboardRoute>
          <Route>Not Found!</Route>
        </Switch>
      </AbilityContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
