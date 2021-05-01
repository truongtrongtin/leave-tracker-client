import {
  Box,
  Button,
  Center,
  Modal,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { Leave } from 'pages/Leaves/Leaves';
import NewLeave, { NewLeaveInputs } from 'pages/Leaves/NewLeave';
import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { fetchData } from 'services/fetchData';
import { DateOfBirth } from 'types/dateOfBirth';
import { User } from 'types/user';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type LeaveResponse = {
  items: Leave[];
  meta: object;
  links: object;
};

type LeaveEvent = {
  id: string;
  start: Date;
  end: Date;
  title: string;
  resource: any;
};

export default function Dashboard() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onClose: onCloseCreate,
  } = useDisclosure();

  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();

  const getLeavesQuery = useQuery<LeaveResponse>('leaves', () =>
    fetchData('/leaves'),
  );

  const getDateOfBirthsQuery = useQuery('dateOfBirths', () =>
    fetchData('/users/dateOfBirth'),
  );

  const getHolidaysQuery = useQuery('holidays', () => fetchData('/holidays'));
  useQuery<User[]>('users', () => fetchData('/users'));

  const holidays =
    getHolidaysQuery.data?.map((item: any) => ({
      title: item.summary,
      start: new Date(item.start.date),
      end: new Date(item.start.date),
      resource: { type: 'holiday' },
    })) || [];

  const createLeaveMutation = useMutation(
    (newLeave: NewLeaveInputs) => {
      const { startAt, endAt, reason, userId } = newLeave;
      return fetchData('/leaves/add', {
        method: 'POST',
        body: new URLSearchParams({
          startAt,
          endAt,
          reason,
          ...(userId && { userId: userId }),
        }),
      });
    },
    {
      onSuccess: (newLeave: Leave) => {
        queryClient.setQueryData('leaves', (old: any) => {
          return { ...old, items: [newLeave, ...old.items] };
        });
        onCloseCreate();
        toast({ description: 'Successfully created', status: 'success' });
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const updateLeaveMutation = useMutation(
    (newLeave: NewLeaveInputs) => {
      const { startAt, endAt, reason, userId } = newLeave;
      return fetchData(`/leaves/${selectedLeave?.id}/edit`, {
        method: 'POST',
        body: new URLSearchParams({
          startAt,
          endAt,
          reason,
          ...(userId && { userId: userId }),
        }),
      });
    },
    {
      onSuccess: (newLeave: Leave) => {
        queryClient.setQueryData('leaves', (old: any) => {
          const newLeaves = old.items.map((leave: Leave) => {
            if (leave.id === newLeave.id) return newLeave;
            return leave;
          });
          return { ...old, items: newLeaves };
        });
        handleLeaveUnselect();
        toast({ description: 'Successfully updated', status: 'success' });
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const deleteLeaveMutation = useMutation(
    (leaveId: string) =>
      fetchData(`/leaves/${leaveId}/delete`, {
        method: 'POST',
      }),
    {
      onSuccess: (_, leaveId) => {
        queryClient.setQueryData('leaves', (old: any) => {
          const newLeaves = old.items.filter(
            (leave: Leave) => leave.id !== leaveId,
          );
          return { ...old, items: newLeaves };
        });
        handleLeaveUnselect();
        toast({ description: 'Successfully deleted', status: 'success' });
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const getLeavesById = (leaveId: string): Leave => {
    const leaveData: LeaveResponse | undefined = queryClient.getQueryData(
      'leaves',
    );
    if (!leaveData) throw Error('no leaves found');
    const leave = leaveData.items.find((leave: Leave) => leave.id === leaveId);
    if (!leave) throw Error(`can not find leave ${leaveId}`);
    return leave;
  };

  const handleLeaveUnselect = () => {
    setSelectedLeave(null);
    onCloseEdit();
  };

  const handleLeaveSelect = (leaveEvent: LeaveEvent) => {
    if (leaveEvent.resource.type !== 'leave') return;
    const leave = getLeavesById(leaveEvent.id);
    setSelectedLeave(leave);
    onOpenEdit();
  };

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

  const dateOfBirthEvents: LeaveEvent[] = (getDateOfBirthsQuery.data || [])
    .filter((dateOfBirth: DateOfBirth) => dateOfBirth.dateOfBirth)
    .map((dateOfBirth: any) => {
      const thisYearDateOfBirth = new Date(dateOfBirth.dateOfBirth);
      const thisYear = new Date().getFullYear();
      thisYearDateOfBirth.setFullYear(thisYear);
      return {
        start: new Date(thisYearDateOfBirth),
        end: new Date(thisYearDateOfBirth),
        allDay: true,
        title:
          currentUser?.id === dateOfBirth.id
            ? 'Your birthday'
            : `${dateOfBirth.firstName} ${dateOfBirth.lastName} 's birthday`,
        resource: { ...dateOfBirth, type: 'dateOfBirth' },
      };
    });

  const leaveEvents: LeaveEvent[] = (getLeavesQuery.data?.items || []).map(
    (leave: Leave) => {
      return {
        id: leave.id,
        start: new Date(leave.startAt),
        end: new Date(leave.endAt),
        title: `${
          currentUser?.id === leave.user.id
            ? 'You'
            : `${leave.user.firstName} ${leave.user.lastName}`
        } (${generateDayPart(leave)})`,
        resource: { ...leave, type: 'leave' },
      };
    },
  );

  const customEventStyle = (leaveEvent: LeaveEvent) => {
    if (leaveEvent.resource.type === 'dateOfBirth')
      return {
        style: {
          backgroundColor: 'red',
        },
      };
    if (leaveEvent.resource.type === 'holiday')
      return {
        style: {
          backgroundColor: 'green',
        },
      };
    if (leaveEvent.resource.type === 'leave') {
      const leave = getLeavesById(leaveEvent.id);
      if (leave?.user.id === currentUser?.id) {
        return {
          style: {
            backgroundColor: 'blue',
          },
        };
      }
    }
    return {};
  };

  return (
    <Box height="100%">
      <Center>
        <Button colorScheme="blue" onClick={onOpenCreate}>
          Add Leave
        </Button>
      </Center>
      <Box height="calc(100% - 40px)">
        <Calendar
          popup
          views={['month']}
          eventPropGetter={customEventStyle}
          localizer={localizer}
          events={[...leaveEvents, ...dateOfBirthEvents, ...holidays]}
          onSelectEvent={handleLeaveSelect}
        />
      </Box>
      <Modal isOpen={isOpenCreate} onClose={onCloseCreate}>
        <NewLeave
          onClose={onCloseCreate}
          isLoading={createLeaveMutation.isLoading}
          onSubmit={(newLeave) => createLeaveMutation.mutate(newLeave)}
        />
      </Modal>
      {selectedLeave && (
        <Modal isOpen={isOpenEdit} onClose={onCloseEdit}>
          <NewLeave
            leave={selectedLeave}
            onClose={handleLeaveUnselect}
            onDelete={() => deleteLeaveMutation.mutate(selectedLeave.id)}
            isLoading={updateLeaveMutation.isLoading}
            isDeleting={deleteLeaveMutation.isLoading}
            onSubmit={(newLeave) => updateLeaveMutation.mutate(newLeave)}
          />
        </Modal>
      )}
    </Box>
  );
}
