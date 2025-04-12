import React, { useRef, useEffect } from "react";
import { Box, VStack, Text, Heading, Flex, Divider } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../stores/gameStore";

// Wrap with motion
const MotionBox = motion(Box);

const GameLog = () => {
  // Get game log from store
  const gameLog = useGameStore((state) => state.gameLog);

  // Reference to log container for auto-scrolling
  const logEndRef = useRef(null);

  // Auto-scroll to the bottom when log updates
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [gameLog]);

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      bg="background.darker"
      borderRadius="md"
      border="1px solid"
      borderColor="neutral.gray"
      p={3}
      w="100%"
      h={{ base: "150px", md: "180px" }}
      overflowY="auto"
    >
      <VStack spacing={1} align="stretch">
        <Heading as="h3" size="xs" color="accent.green" mb={1}>
          Intelligence Report
        </Heading>

        <Divider borderColor="neutral.gray" opacity={0.3} mb={2} />

        <VStack spacing={1} align="stretch" px={1}>
          <AnimatePresence initial={false}>
            {gameLog.map((entry, index) => (
              <LogEntry key={index} entry={entry} />
            ))}
          </AnimatePresence>

          {/* Invisible element for auto-scrolling */}
          <Box ref={logEndRef} />
        </VStack>
      </VStack>
    </MotionBox>
  );
};

// Individual log entry with animation
const LogEntry = ({ entry }) => {
  // Determine entry color based on player
  const getEntryColor = () => {
    if (!entry.player) return "neutral.lightGray";
    return entry.player === "player" ? "accent.green" : "accent.red";
  };

  // Format turn information
  const getTurnInfo = () => {
    if (entry.turn === 0) return "SYSTEM";
    return `TURN ${entry.turn} • ${
      entry.player ? (entry.player === "player" ? "YOU" : "OPPONENT") : ""
    }`;
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      mb={1}
    >
      <Flex fontSize="xs">
        <Text
          color={getEntryColor()}
          fontWeight="bold"
          mr={2}
          whiteSpace="nowrap"
        >
          {getTurnInfo()}
        </Text>
        <Text color="neutral.lightGray" fontSize="xs">
          {entry.message}
        </Text>
      </Flex>
    </MotionBox>
  );
};

export default GameLog;
