import { Box } from '@chakra-ui/react';
import LDTable from 'components/LDTable/LDTable';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { fetchData } from 'services/fetchData';
import { User } from 'types/user';

export type Leave = {
  id: string;
  startAt: string;
  endAt: string;
  reason: string;
  status: string;
  user: User;
};

function calculateLeaveDays(leave: Leave): number {
  const diffInHour =
    Math.abs(
      new Date(leave.startAt).getTime() - new Date(leave.endAt).getTime(),
    ) / 3600000;
  return diffInHour === 9 ? 1 : 0.5;
}

function Leaves() {
  const getLeavesQuery = useQuery('myLeaves', () => fetchData('/leaves/me'), {
    placeholderData: { items: [], meta: {}, links: {} },
  });

  const data = useMemo(
    () =>
      getLeavesQuery.data?.items.map((leave: Leave) => {
        return {
          startAt: new Date(leave.startAt).toLocaleString(undefined, {
            hourCycle: 'h23',
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          endAt: new Date(leave.endAt).toLocaleString(undefined, {
            hourCycle: 'h23',
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          noOfDays: calculateLeaveDays(leave),
          reason: leave.reason,
        };
      }),
    [getLeavesQuery],
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Start At',
        accessor: 'startAt',
      },
      {
        Header: 'End At',
        accessor: 'endAt',
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
    </Box>
  );
}

export default Leaves;
