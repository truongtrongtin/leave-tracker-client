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
  VisuallyHidden,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
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

const newLeaveSchema = yup.object().shape({
  startAt: yup.date().required(),
  endAt: yup.date().required(),
  reason: yup.string().required(),
});

const getNextBusinessDay = () => {
  const date = new Date();
  const day = date.getDay();
  let add = 1;
  if (day === 5) add = 3; // Friday
  if (day === 6) add = 2; // Saturday
  date.setDate(date.getDate() + add);
  return date;
};

function EditLeaveModal({
  leave,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: NewLeaveProps) {
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    errors,
    control,
  } = useForm<NewLeaveInputs>({
    resolver: yupResolver(newLeaveSchema),
    defaultValues: {
      startAt: leave
        ? new Date(leave.startAt)
        : new Date(getNextBusinessDay().setHours(9, 0, 0, 0)),
      endAt: leave
        ? new Date(leave.endAt)
        : new Date(getNextBusinessDay().setHours(18, 0, 0, 0)),
    },
  });

  const handleDayPartChange = (value: DayPart) => {
    const startAt = watch("startAt");
    const endAt = watch("endAt");
    switch (value) {
      case DayPart.MORNING:
        setValue("startAt", new Date(startAt.setHours(9, 0, 0, 0)));
        setValue("endAt", new Date(endAt.setHours(14, 0, 0, 0)));
        return;
      case DayPart.AFTERNOON:
        setValue("startAt", new Date(startAt.setHours(14, 0, 0, 0)));
        setValue("endAt", new Date(endAt.setHours(18, 0, 0, 0)));
        return;
      case DayPart.ALL:
      default:
        setValue("startAt", new Date(startAt.setHours(9, 0, 0, 0)));
        setValue("endAt", new Date(endAt.setHours(18, 0, 0, 0)));
        return;
    }
  };

  const radioValue = useMemo(() => {
    const startAt = watch("startAt");
    const endAt = watch("endAt");
    if (startAt.getHours() === 9 && endAt.getHours() === 18) {
      return DayPart.ALL;
    }
    if (startAt.getHours() === 9 && endAt.getHours() === 14) {
      return DayPart.MORNING;
    }
    if (startAt.getHours() === 14 && endAt.getHours() === 18) {
      return DayPart.AFTERNOON;
    }
  }, [watch]);

  const handleChange = (value: Date) => {
    if (!value) return;
    const year = value.getFullYear();
    const month = value.getMonth();
    const date = value.getDate();

    const startAt = new Date(watch("startAt"));
    startAt.setFullYear(year);
    startAt.setMonth(month);
    startAt.setDate(date);
    setValue("startAt", startAt);

    const endAt = new Date(watch("endAt"));
    endAt.setFullYear(year);
    endAt.setMonth(month);
    endAt.setDate(date);
    setValue("endAt", endAt);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{leave ? "Edit Leave" : "Create Leave"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired isInvalid={Boolean(errors.startAt)} mt={4}>
              <FormLabel htmlFor="startAt">Date</FormLabel>
              <Controller
                name="startAt"
                control={control}
                render={({ value }) => (
                  <DatePicker
                    selected={value}
                    onChange={handleChange}
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
              <FormErrorMessage>{errors.startAt?.message}</FormErrorMessage>
            </FormControl>
            <VisuallyHidden>
              <Controller
                name="endAt"
                control={control}
                render={({ onChange, value }) => (
                  <DatePicker selected={value} onChange={onChange} />
                )}
              />
            </VisuallyHidden>
            <RadioGroup
              onChange={handleDayPartChange}
              value={radioValue}
              mt={4}
            >
              <HStack direction="row">
                <Radio value={DayPart.ALL}>All day</Radio>
                <Radio value={DayPart.MORNING}>Only morning</Radio>
                <Radio value={DayPart.AFTERNOON}>Only afternoon</Radio>
              </HStack>
            </RadioGroup>
            <FormControl isRequired isInvalid={Boolean(errors.reason)} mt={4}>
              <FormLabel htmlFor="reason">Reason</FormLabel>
              <Textarea
                ref={register}
                name="reason"
                defaultValue={leave?.reason}
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
