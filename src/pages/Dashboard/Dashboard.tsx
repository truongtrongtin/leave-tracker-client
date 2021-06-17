import {
  Box,
  Button,
  Center,
  Modal,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import FullCalendar, { EventApi, EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  addLeaveApi,
  deleteLeaveApi,
  editLeaveApi,
  getAllLeavesApi,
  Leave,
  LeaveResponse,
} from 'api/leaves';
import { getAllHolidaysApi } from 'api/others';
import { getAllUsersApi, getAllUsersBirthdayApi, User } from 'api/users';
import NewLeave, { NewLeaveInputs } from 'pages/Leaves/NewLeave';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DateOfBirth } from 'types/dateOfBirth';
import './fullCalendar.css';

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

  const getLeavesQuery = useQuery('leaves', () => getAllLeavesApi());

  const getDateOfBirthsQuery = useQuery('dateOfBirths', () =>
    getAllUsersBirthdayApi(),
  );

  const getHolidaysQuery = useQuery('holidays', () => getAllHolidaysApi());
  useQuery<User[]>('users', () => getAllUsersApi());

  const createLeaveMutation = useMutation(
    (newLeave: NewLeaveInputs) => {
      const { startAt, endAt, reason, userId } = newLeave;
      return addLeaveApi({
        startAt,
        endAt,
        reason,
        ...(userId && { userId }),
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
      const { id, startAt, endAt, reason, userId } = newLeave;
      return editLeaveApi(id, {
        startAt,
        endAt,
        reason,
        ...(userId && { userId }),
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
    (leaveId: string) => deleteLeaveApi(leaveId),
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
    const leaveData: LeaveResponse | undefined =
      queryClient.getQueryData('leaves');
    if (!leaveData) throw Error('no leaves found');
    const leave = leaveData.items.find((leave: Leave) => leave.id === leaveId);
    if (!leave) throw Error(`can not find leave ${leaveId}`);
    return leave;
  };

  const handleLeaveUnselect = () => {
    setSelectedLeave(null);
    onCloseEdit();
  };

  const handleLeaveSelect = (event: EventApi) => {
    const { type } = event._def.extendedProps;
    if (type !== 'leaves') return;
    const leave = getLeavesById(event._def.publicId);
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

  const dateOfBirthEvents = (getDateOfBirthsQuery.data || [])
    .filter((dateOfBirth: DateOfBirth) => dateOfBirth.dateOfBirth)
    .map((dateOfBirth: any) => {
      const thisYearDateOfBirth = new Date(dateOfBirth.dateOfBirth);
      const thisYear = new Date().getFullYear();
      thisYearDateOfBirth.setFullYear(thisYear);
      return {
        start: new Date(thisYearDateOfBirth),
        end: new Date(thisYearDateOfBirth),
        title:
          currentUser?.id === dateOfBirth.id
            ? 'Your birthday'
            : `${dateOfBirth.firstName} ${dateOfBirth.lastName} 's birthday`,
        type: 'birthdays',
      };
    });

  const leaveEvents: EventInput[] = (getLeavesQuery.data?.items || []).map(
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
        user: leave.user,
        type: 'leaves',
      };
    },
  );

  const holidayEvents =
    getHolidaysQuery.data?.map((item: any) => ({
      title: item.summary,
      start: new Date(item.start.date),
      end: new Date(item.start.date),
      resource: { type: 'holiday' },
    })) || [];

  return (
    <Box height="100%">
      <Center>
        <Button colorScheme="blue" onClick={onOpenCreate}>
          Add Leave
        </Button>
      </Center>
      <Box height="100%">
        <FullCalendar
          height="100%"
          eventClassNames="event"
          eventClick={(eventInfo) => handleLeaveSelect(eventInfo.event)}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          eventSources={[
            { events: leaveEvents, defaultAllDay: true },
            {
              events: dateOfBirthEvents,
              backgroundColor: 'red',
              defaultAllDay: true,
            },
            {
              events: holidayEvents,
              backgroundColor: 'green',
              defaultAllDay: true,
            },
          ]}
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
