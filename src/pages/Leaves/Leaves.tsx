import { Box, Text } from '@chakra-ui/react';
import { getMyLeavesApi, getMyLeaveSumApi, Leave } from 'api/leaves';
import LDTable from 'components/LDTable/LDTable';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

function calculateLeaveDays(leave: Leave): number {
  const diffInHour =
    Math.abs(
      new Date(leave.startAt).getTime() - new Date(leave.endAt).getTime(),
    ) / 3600000;
  return diffInHour === 9 ? 1 : 0.5;
}

function Leaves() {
  const getLeavesQuery = useQuery('myLeaves', () => getMyLeavesApi(), {
    placeholderData: { items: [], meta: {}, links: {} },
  });

  const getMyLeaveSumQuery: any = useQuery('myLeaveCount', () =>
    getMyLeaveSumApi(),
  );

  const generateDayPart = (leave: Leave): string => {
    const diffInHour =
      Math.abs(
        new Date(leave.startAt).getTime() - new Date(leave.endAt).getTime(),
      ) / 3600000;

    if (diffInHour === 5) return 'morning';
    if (diffInHour === 4) return 'afternoon';
    if (diffInHour === 9) return 'all day';
    return 'unknown';
  };

  const data = useMemo(
    () =>
      (getLeavesQuery.data?.items || []).map((leave: Leave) => {
        return {
          date: new Date(leave.startAt).toLocaleString(undefined, {
            hourCycle: 'h23',
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          dayPart: generateDayPart(leave),
          noOfDays: calculateLeaveDays(leave),
          reason: leave.reason,
        };
      }),
    [getLeavesQuery],
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
      },
      {
        Header: 'Day part',
        accessor: 'dayPart',
      },
      {
        Header: 'No Of Days',
        accessor: 'noOfDays',
      },
      {
        Header: 'Reason',
        accessor: 'reason',
      },
    ],
    [],
  );

  return (
    <Box>
      <LDTable data={data} columns={columns} />
      <Text textAlign="center" mt={5}>
        Total: {getMyLeaveSumQuery.data?.sum} days
      </Text>
    </Box>
  );
}

export default Leaves;
