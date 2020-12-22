import React from "react";

export default function useCurrentUser() {
  const [currentUser, setCurrentUser] = React.useState(null);

  return [currentUser, setCurrentUser];
}
