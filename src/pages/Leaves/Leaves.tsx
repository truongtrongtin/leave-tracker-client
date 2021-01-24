import React from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import LDTable from "components/LDTable/LDTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BiChevronDown, BiDotsVerticalRounded } from "react-icons/bi";
import { fetchData } from "services/fetchData";
import CreateLeaveModal from "./CreateLeaveModal";
import EditLeaveModal from "./EditLeaveModal";

export type User = {
  firstName: string;
  lastName: string;
};

export type Leave = {
  id: number;
  from: string;
  to: string;
  reason: string;
  status: string;
  user: User;
};

enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
}

function Leaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [, setIsLoading] = useState(false);

  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onClose: onCloseCreate,
  } = useDisclosure({ id: "123" });
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure({ id: "asdas" });

  useEffect(() => {
    const getAllLeaves = async () => {
      try {
        setIsLoading(true);
        const leaves = await fetchData("/leaves");
        setLeaves(leaves);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    getAllLeaves();
  }, []);

  const updateLeave = (newLeave: Leave) => {
    const newLeaves = leaves.map((leave) => {
      if (leave.id === newLeave.id) return newLeave;
      return leave;
    });
    setLeaves(newLeaves);
  };

  const changeLeaveStatus = useCallback(
    async (leave: Leave, status: LeaveStatus) => {
      if (leave.status === status) return;
      try {
        setIsLoading(true);
        const newLeave = await fetchData(`/leaves/${leave.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ status }),
        });
        const newLeaves = leaves.map((leave) => {
          if (leave.id === newLeave.id) return { ...leave, status };
          return leave;
        });
        setIsLoading(false);
        setLeaves(newLeaves);
      } catch (error) {
        setIsLoading(false);
      }
    },
    [leaves]
  );

  const deleteLeave = useCallback(
    async (leave: Leave) => {
      try {
        setIsLoading(true);
        await fetchData(`/leaves/${leave.id}`, {
          method: "DELETE",
        });
        const newLeaves = leaves.filter((l) => l.id !== leave.id);
        setIsLoading(false);
        setLeaves(newLeaves);
      } catch (error) {
        setIsLoading(false);
      }
    },
    [leaves]
  );

  const openEdit = useCallback(
    (leave) => {
      setSelectedLeave(leave);
      onOpenEdit();
    },
    [onOpenEdit]
  );

  const data = useMemo(
    () =>
      leaves.map((leave) => {
        return {
          employee: leave.user.firstName + " " + leave.user.lastName,
          from: new Date(leave.from).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          }),
          to: new Date(leave.to).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          }),
          noOfDays: "noOfDays",
          reason: leave.reason,
          status: (
            <Menu>
              <MenuButton as={Button} rightIcon={<BiChevronDown />}>
                {leave.status}
              </MenuButton>
              <MenuList>
                {Object.values(LeaveStatus).map((status) => (
                  <MenuItem
                    key={status}
                    onClick={() => changeLeaveStatus(leave, status)}
                  >
                    {status}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          ),
          action: (
            <Menu>
              <MenuButton as={IconButton} icon={<BiDotsVerticalRounded />} />
              <MenuList>
                <MenuItem onClick={() => openEdit(leave)}>Edit</MenuItem>
                <MenuItem onClick={() => deleteLeave(leave)}>Delete</MenuItem>
              </MenuList>
            </Menu>
          ),
        };
      }),
    [leaves, changeLeaveStatus, openEdit, deleteLeave]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Employee",
        accessor: "employee",
      },
      {
        Header: "From",
        accessor: "from",
      },
      {
        Header: "To",
        accessor: "to",
      },
      {
        Header: "No Of Days",
        accessor: "noOfDays",
      },
      {
        Header: "Reason",
        accessor: "reason",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Action",
        accessor: "action",
      },
    ],
    []
  );
  return (
    <Box>
      <Button onClick={onOpenCreate}>Add Leave</Button>
      <LDTable data={data} columns={columns} />
      <CreateLeaveModal
        isOpen={isOpenCreate}
        onClose={onCloseCreate}
        onFinishSubmit={(newLeave) => setLeaves([newLeave, ...leaves])}
      />
      {selectedLeave && (
        <EditLeaveModal
          leave={selectedLeave}
          isOpen={isOpenEdit}
          onClose={onCloseEdit}
          onFinishSubmit={(newLeave) => updateLeave(newLeave)}
        />
      )}
    </Box>
  );
}

export default Leaves;
