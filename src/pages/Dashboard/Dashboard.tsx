import { Box, Button, Center, useDisclosure, useToast } from '@chakra-ui/react';
import { EventApi, EventClickArg, EventSourceFunc } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import {
  addLeaveApi,
  deleteLeaveApi,
  editLeaveApi,
  getLeavesApi,
  Leave,
} from 'api/leaves';
import { getAllHolidaysApi } from 'api/others';
import { getAllUsersApi, getAllUsersBirthdayApi, User } from 'api/users';
import NewLeaveModal from 'pages/Leaves/NewLeaveModal';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { DateOfBirth } from 'types/dateOfBirth';
import './fullCalendar.css';

export default function Dashboard() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const timer = useRef<NodeJS.Timer | null>();
  const calendarRef = useRef<FullCalendar>(null);
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');
  const users: User[] | undefined = queryClient.getQueryData('users');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeaveEvent, setSelectedLeaveEvent] = useState<EventApi | null>(
    null,
  );

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

  const getDateOfBirthsQuery = useQuery('dateOfBirths', () =>
    getAllUsersBirthdayApi(),
  );

  const getHolidaysQuery = useQuery('holidays', () => getAllHolidaysApi());
  useQuery<User[]>('users', () => getAllUsersApi());

  const createLeave = async (leave: Leave) => {
    const { startAt, endAt, reason, user } = leave;
    setIsLoading(true);
    try {
      const newLeave = await addLeaveApi({
        startAt,
        endAt,
        reason,
        userId: user.id,
      });
      const isCurrentUser = currentUser?.id === newLeave.user.id;
      calendarRef.current?.getApi().addEvent(
        {
          id: newLeave.id,
          title: `${
            isCurrentUser
              ? 'Me'
              : `${newLeave.user.firstName} ${newLeave.user.lastName}`
          } (${generateDayPart(newLeave)})`,
          start: newLeave.startAt,
          end: newLeave.endAt,
          reason: newLeave.reason,
          user: newLeave.user,
          ...(isCurrentUser && { color: 'orange' }),
        },
        'leaveEventsSource',
      );
      toast({ description: 'Successfully created', status: 'success' });
      onCloseCreate();
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message, status: 'error' });
        setIsLoading(false);
      }
    }
  };

  const updateLeave = async (newLeave: Leave) => {
    if (!selectedLeaveEvent) return;
    setIsLoading(true);
    try {
      const { id, startAt, endAt, reason, user } = newLeave;
      const leave = await editLeaveApi(id, {
        startAt,
        endAt,
        reason,
        userId: user.id,
      });
      selectedLeaveEvent.setProp(
        'title',
        `${
          currentUser?.id === leave.user.id
            ? 'Me'
            : `${leave.user.firstName} ${leave.user.lastName}`
        } (${generateDayPart(leave)})`,
      );
      selectedLeaveEvent.setDates(startAt, endAt);
      selectedLeaveEvent.setExtendedProp('user', user);
      selectedLeaveEvent.setExtendedProp('reason', reason);
      toast({ description: 'Successfully updated', status: 'success' });
      handleLeaveUnselect();
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message, status: 'error' });
        setIsLoading(false);
      }
    }
  };

  const deleteLeave = async () => {
    if (!selectedLeaveEvent) return;
    const leaveId = selectedLeaveEvent.id;
    setIsLoading(true);
    try {
      await deleteLeaveApi(leaveId);
      selectedLeaveEvent.remove();
      toast({ description: 'Successfully deleted', status: 'success' });
      handleLeaveUnselect();
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message, status: 'error' });
        setIsLoading(false);
      }
    }
  };

  const handleLeaveUnselect = () => {
    setSelectedLeaveEvent(null);
    onCloseEdit();
  };

  const handleLeaveSelect = (clickEvent: EventClickArg) => {
    if (clickEvent.event.source?.id !== 'leaveEventsSource') return;
    setSelectedLeaveEvent(clickEvent.event);
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
            ? 'My birthday'
            : `${dateOfBirth.firstName} ${dateOfBirth.lastName} 's birthday`,
      };
    });

  const holidayEvents =
    getHolidaysQuery.data?.map((item: any) => ({
      title: item.summary,
      start: new Date(item.start.date),
      end: new Date(item.start.date),
    })) || [];

  const getLeaveEvents: EventSourceFunc = useCallback(
    (info, successCallback, failureCallback) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      timer.current = setTimeout(() => {
        getLeavesApi({ from: info.startStr, to: info.endStr })
          .then((leaveResponse) => {
            successCallback(
              leaveResponse.items.map((leave) => {
                const isCurrentUser = currentUser?.id === leave.user.id;
                return {
                  id: leave.id,
                  title: `${
                    isCurrentUser
                      ? 'Me'
                      : `${leave.user.firstName} ${leave.user.lastName}`
                  } (${generateDayPart(leave)})`,
                  start: leave.startAt,
                  end: leave.endAt,
                  reason: leave.reason,
                  user: leave.user,
                  ...(isCurrentUser && { color: 'orange' }),
                };
              }),
            );
          })
          .catch((error) => {
            failureCallback(error);
          });
      }, 300);
    },
    [currentUser],
  );

  const leaveEventsSource = useMemo(
    () => ({
      id: 'leaveEventsSource',
      events: getLeaveEvents,
    }),
    [getLeaveEvents],
  );

  if (!users || !currentUser) return null;
  return (
    <Box height="100%">
      <Center>
        <Button colorScheme="blue" onClick={onOpenCreate}>
          Add Leave
        </Button>
      </Center>
      <Box height="calc(100% - 40px)">
        <FullCalendar
          ref={calendarRef}
          height="100%"
          eventClassNames="event"
          eventClick={handleLeaveSelect}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          eventSources={[
            leaveEventsSource,
            {
              events: dateOfBirthEvents,
              defaultAllDay: true,
              color: 'red',
            },
            {
              events: holidayEvents,
              defaultAllDay: true,
              color: '#3788d8',
            },
          ]}
        />
      </Box>
      <NewLeaveModal
        isOpen={isOpenCreate}
        onClose={onCloseCreate}
        isLoading={isLoading}
        onSubmit={createLeave}
        users={users}
        currentUser={currentUser}
      />
      <NewLeaveModal
        isOpen={isOpenEdit}
        leave={
          selectedLeaveEvent
            ? {
                id: selectedLeaveEvent.id,
                startAt: selectedLeaveEvent.startStr,
                endAt: selectedLeaveEvent.endStr,
                reason: selectedLeaveEvent.extendedProps.reason,
                user: selectedLeaveEvent.extendedProps.user,
              }
            : undefined
        }
        onClose={handleLeaveUnselect}
        onDelete={deleteLeave}
        isLoading={isLoading}
        onSubmit={updateLeave}
        users={users}
        currentUser={currentUser}
      />
      )
    </Box>
  );
}
