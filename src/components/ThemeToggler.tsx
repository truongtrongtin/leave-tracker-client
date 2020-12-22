import React from "react";
import { useColorMode, Box, IconButton } from "@chakra-ui/react";
import { FaMoon, FaRegSun } from "react-icons/fa";

export default function ThemeToggler() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box textAlign="right" py={4} mr={12}>
      <IconButton
        aria-label="darkmode-toggler"
        size="lg"
        icon={colorMode === "light" ? <FaMoon /> : <FaRegSun />}
        onClick={toggleColorMode}
        variant="ghost"
      />
    </Box>
  );
}
