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
  Textarea,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import "./date-picker.css";
import { Leave } from "./Leaves";

type NewLeaveProps = {
  leave?: Leave;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: NewLeaveInputs) => void;
};

enum DayPart {
  ALL = "ALL",
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
}

export type NewLeaveInputs = {
  startAt: Date;
  endAt: Date;
  reason: string;
};

export type FormFields = {
  leaveDate: Date;
  dayPart: DayPart;
  reason: string;
};

const newLeaveSchema = yup.object().shape({
  leaveDate: yup.date().required(),
  dayPart: yup.string().required(),
  reason: yup.string().required(),
});

const getNextBusinessDay = () => {
  const date = new Date();
  const day = date.getDay();
  let add = 1;
  if (day === 5) add = 3; // Friday
  if (day === 6) add = 2; // Saturday
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

function EditLeaveModal({
  leave,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: NewLeaveProps) {
  const { register, handleSubmit, errors, control } = useForm<FormFields>({
    resolver: yupResolver(newLeaveSchema),
  });

  const handleSubmitLogic = ({ leaveDate, dayPart, reason }: FormFields) => {
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
    onSubmit({ startAt, endAt, reason });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form noValidate onSubmit={handleSubmit(handleSubmitLogic)}>
          <ModalHeader>{leave ? "Edit Leave" : "Create Leave"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                  leave ? new Date(leave.startAt) : getNextBusinessDay()
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
                      date >= new Date()
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
                defaultValue={leave ? leave.reason : ""}
                ref={register}
                name="reason"
              />
              <FormErrorMessage>{errors.reason?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" type="submit" isLoading={isLoading}>
              Submit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default EditLeaveModal;
