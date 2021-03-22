import { Box, Heading, Text } from "@chakra-ui/react";
import AppContext from "AppContext";
import { useContext, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fetchData } from "services/fetchData";
import { Leave } from "pages/Leaves/Leaves";
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Dashboard() {
  const { currentUser } = useContext(AppContext);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAllLeaves = async () => {
      try {
        setIsLoading(true);
        const leaves = await fetchData("/leaves");
        setLeaves(leaves.items);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    getAllLeaves();
  }, []);

  const modifiedLeaves = leaves.map(({ id, reason, startAt, endAt, user }) => ({
    id,
    title: `${user.firstName} off`,
    start: startAt,
    end: endAt,
  }));

  if (isLoading) return null;
  return (
    <Box height="100%">
      <Heading as="h6" size="lg">
        Welcome, {`${currentUser?.firstName} ${currentUser?.lastName}`}
      </Heading>
      <Text>Today</Text>
      <Calendar
        popup
        localizer={localizer}
        events={modifiedLeaves}
        step={60}
        showMultiDayTimes
      />
    </Box>
  );
}
