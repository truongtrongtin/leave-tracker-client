import { Avatar, Flex, Text } from "@chakra-ui/react";
import React from "react";

type EmployeeItemProps = {
  name: string;
  key: string;
  avatar: string;
};

export default function EmployeeItem({ name, avatar }: EmployeeItemProps) {
  return (
    <Flex
      padding={5}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="4px"
      boxShadow="base"
      alignItems="center"
      direction="column"
    >
      <Avatar name={name} src={avatar} size="xl" m="0 auto" />
      <Text marginTop={3} fontSize="lg" fontWeight="bold">
        {name}
      </Text>
    </Flex>
  );
}
