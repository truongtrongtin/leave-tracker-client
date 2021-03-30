import { Box, Button, Center, useDisclosure, useToast } from '@chakra-ui/react';
import { AppContext } from 'contexts/AppContext';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { Leave } from 'pages/Leaves/Leaves';
import NewLeaveModal, { NewLeaveInputs } from 'pages/Leaves/NewLeaveModal';
import { useContext, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { fetchData } from 'services/fetchData';

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

export default function Dashboard() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AppContext);
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

  const getLeavesQuery = useQuery('leaves', () => fetchData('/leaves'), {
    placeholderData: { items: [], meta: {}, links: {} },
  });

  const createLeaveMutation = useMutation(
    (newLeave: NewLeaveInputs) => {
      const { startAt, endAt, reason, userId } = newLeave;
      return fetchData(userId ? '/leaves/admin.add' : '/leaves/add', {
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
        setSelectedLeave(null);
        onCloseCreate();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const updateLeaveMutation = useMutation(
    (newLeave: NewLeaveInputs) =>
      fetchData(`/leaves/${selectedLeave?.id}/edit`, {
        method: 'POST',
        body: new URLSearchParams({
          startAt: newLeave.startAt,
          endAt: newLeave.endAt,
          reason: newLeave.reason,
        }),
      }),
    {
      onSuccess: (newLeave: Leave) => {
        queryClient.setQueryData('leaves', (old: any) => {
          const newLeaves = old.items.map((leave: Leave) => {
            if (leave.id === newLeave.id) return newLeave;
            return leave;
          });
          return { ...old, items: newLeaves };
        });
        setSelectedLeave(null);
        onCloseEdit();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const deleteLeaveMutation = useMutation(
    (leaveId: number) =>
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
        setSelectedLeave(null);
        onCloseEdit();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  const handleLeaveSelect = (leave: Leave) => {
    setSelectedLeave(leave);
    onOpenEdit();
  };

  const generateDayPart = (leave: Leave) => {
    const startAtHour = new Date(leave.startAt).getHours();
    const endAtHour = new Date(leave.endAt).getHours();

    if (startAtHour === 9 && endAtHour === 14) return 'morning';
    if (startAtHour === 14 && endAtHour === 18) return 'afternoon';
    if (startAtHour === 9 && endAtHour === 18) return 'all day';
  };

  const mappedLeaves = getLeavesQuery.data?.items.map((leave: Leave) => {
    return {
      ...leave,
      start: new Date(leave.startAt),
      end: new Date(leave.endAt),
      title: `${leave.user.firstName} off ${generateDayPart(leave)}`,
    };
  });

  const customEventStyle = (leave: Leave) => {
    if (leave.user.id === currentUser?.id) {
      return {
        style: {
          backgroundColor: 'green',
        },
      };
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
          eventPropGetter={customEventStyle}
          localizer={localizer}
          events={mappedLeaves}
          onSelectEvent={handleLeaveSelect}
        />
      </Box>
      <NewLeaveModal
        isOpen={isOpenCreate}
        onClose={onCloseCreate}
        isSubmiting={createLeaveMutation.isLoading}
        onSubmit={(newLeave) => createLeaveMutation.mutate(newLeave)}
      />
      {selectedLeave && (
        <NewLeaveModal
          leave={selectedLeave}
          isOpen={isOpenEdit}
          onClose={onCloseEdit}
          onDelete={() => deleteLeaveMutation.mutate(selectedLeave.id)}
          isSubmiting={updateLeaveMutation.isLoading}
          isDeleting={deleteLeaveMutation.isLoading}
          onSubmit={(newLeave) => updateLeaveMutation.mutate(newLeave)}
        />
      )}
    </Box>
  );
}
