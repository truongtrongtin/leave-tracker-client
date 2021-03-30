import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Spacer,
  Textarea,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppContext, Role, User } from 'contexts/AppContext';
import { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, useForm } from 'react-hook-form';
import { fetchData } from 'services/fetchData';
import * as yup from 'yup';
import './date-picker.css';
import { Leave } from './Leaves';

type NewLeaveProps = {
  leave?: Leave;
  isOpen: boolean;
  isSubmiting: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (newLeave: NewLeaveInputs) => void;
  onDelete?: () => void;
};

export enum DayPart {
  ALL = 'ALL',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

export type NewLeaveInputs = {
  startAt: string;
  endAt: string;
  reason: string;
  userId?: string;
};

export type FormFields = {
  userId: string;
  leaveDate: Date;
  dayPart: DayPart;
  reason: string;
};

const newLeaveSchema = yup.object().shape({
  userId: yup.string().notRequired(),
  leaveDate: yup.date().required(),
  dayPart: yup.string().required(),
  reason: yup.string().required(),
});

const getCurrentBusinessDay = () => {
  const date = new Date();
  const day = date.getDay();
  let add = 0;
  if (day === 6) add = 2; // Saturday
  if (day === 0) add = 1; // Sunday
  date.setDate(date.getDate() + add);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getInitialDayPart = (leave: Leave) => {
  const startAtHour = new Date(leave.startAt).getHours();
  const endAtHour = new Date(leave.endAt).getHours();

  if (startAtHour === 9 && endAtHour === 14) {
    return DayPart.MORNING;
  }
  if (startAtHour === 14 && endAtHour === 18) {
    return DayPart.AFTERNOON;
  }
  if (startAtHour === 9 && endAtHour === 18) {
    return DayPart.ALL;
  }
};

function NewLeaveModal({
  leave,
  isOpen,
  isSubmiting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: NewLeaveProps) {
  const { currentUser } = useContext(AppContext);
  const [users, setUsers] = useState<User[]>([]);
  const {
    register,
    handleSubmit,
    errors,
    control,
    setValue,
  } = useForm<FormFields>({
    resolver: yupResolver(newLeaveSchema),
  });

  const isEditing = Boolean(leave);
  const isAdmin = currentUser?.role === Role.ADMIN;

  const handleSubmitLogic = ({
    leaveDate,
    dayPart,
    reason,
    userId,
  }: FormFields) => {
    const startAt = new Date(leaveDate);
    const endAt = new Date(leaveDate);
    if (dayPart === DayPart.MORNING) {
      startAt.setHours(9, 0, 0, 0);
      endAt.setHours(14, 0, 0, 0);
    }
    if (dayPart === DayPart.AFTERNOON) {
      startAt.setHours(14, 0, 0, 0);
      endAt.setHours(18, 0, 0, 0);
    }
    if (dayPart === DayPart.ALL) {
      startAt.setHours(9, 0, 0, 0);
      endAt.setHours(18, 0, 0, 0);
    }
    onSubmit({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reason,
      userId,
    });
  };

  useEffect(() => {
    if (users.length) return;
    const getAllUsers = async () => {
      try {
        const users = await fetchData('/users');
        setUsers(users);
        setValue('userId', leave?.user.id);
      } catch (error) {}
    };
    getAllUsers();
  }, [setValue, users, leave]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form noValidate onSubmit={handleSubmit(handleSubmitLogic)}>
          <ModalHeader>
            {isEditing ? `${leave?.user.firstName}'s leave` : 'Create Leave'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isAdmin && (
              <FormControl isInvalid={Boolean(errors.userId)}>
                <FormLabel htmlFor="userId">User</FormLabel>
                <Select
                  ref={register}
                  name="userId"
                  placeholder="Select option"
                  defaultValue={leave?.user.id}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.userId?.message}</FormErrorMessage>
              </FormControl>
            )}
            <FormControl
              isRequired
              isInvalid={Boolean(errors.leaveDate)}
              mt={4}
            >
              <FormLabel htmlFor="leaveDate">Date</FormLabel>
              <Controller
                name="leaveDate"
                control={control}
                defaultValue={
                  leave ? new Date(leave.startAt) : getCurrentBusinessDay()
                }
                render={({ onChange, value }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    dateFormat="E MMM d, yyyy"
                    placeholderText="Select a weekday"
                    autoFocus={!Boolean(leave)}
                    filterDate={(date) =>
                      date.getDay() !== 0 &&
                      date.getDay() !== 6 &&
                      (isAdmin ||
                        date >= new Date(new Date().setHours(0, 0, 0, 0)))
                    }
                  />
                )}
              />
              <FormErrorMessage>{errors.leaveDate?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.dayPart)} mt={4}>
              <Controller
                name="dayPart"
                control={control}
                defaultValue={leave ? getInitialDayPart(leave) : DayPart.ALL}
                render={({ onChange, value }) => (
                  <RadioGroup value={value} onChange={onChange}>
                    <HStack>
                      <Radio id={DayPart.ALL} value={DayPart.ALL}>
                        All day
                      </Radio>
                      <Radio id={DayPart.MORNING} value={DayPart.MORNING}>
                        Only morning
                      </Radio>
                      <Radio id={DayPart.AFTERNOON} value={DayPart.AFTERNOON}>
                        Only afternoon
                      </Radio>
                    </HStack>
                  </RadioGroup>
                )}
              />
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.reason)} mt={4}>
              <FormLabel htmlFor="reason">Reason</FormLabel>
              <Textarea
                defaultValue={leave ? leave.reason : ''}
                ref={register}
                name="reason"
              />
              <FormErrorMessage>{errors.reason?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            {isEditing && (
              <Button
                colorScheme="red"
                mr={3}
                onClick={onDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            )}
            <Spacer />
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            {
              <Button colorScheme="blue" type="submit" isLoading={isSubmiting}>
                Submit
              </Button>
            }
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default NewLeaveModal;
