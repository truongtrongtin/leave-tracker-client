import { Heading, Text } from "@chakra-ui/react";
import AppContext from "AppContext";
import { useContext } from "react";

export default function Dashboard() {
  const { currentUser } = useContext(AppContext);

  return (
    <div>
      <Heading as="h6" size="lg">
        Welcome, {`${currentUser?.firstName} ${currentUser?.lastName}`}
      </Heading>
      <Text>Today</Text>
    </div>
  );
}
