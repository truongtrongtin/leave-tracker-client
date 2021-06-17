import { Text } from '@chakra-ui/layout';
import { getAllUsersLeaveSumApi } from 'api/leaves';
import { useQuery } from 'react-query';

export default function Statistic() {
  const getUsersLeavesCountQuery = useQuery('haha', () =>
    getAllUsersLeaveSumApi(new Date().getFullYear()),
  );

  return (
    <div>
      <Text>All member's leaves in 2021</Text>
      {getUsersLeavesCountQuery.data?.map((user: any) => (
        <span key={user.id}>
          {user.first_name} {user.last_name} ----- {user.sum} day(s)
          <br />
        </span>
      ))}
    </div>
  );
}
