import React, { useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Heading,
  Divider,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";
import { useGameStore } from "../stores/gameStore";

// Wrap with motion
const MotionBox = motion(Box);

const BluffPanel = () => {
  // Get game state
  const playerBluffTokens = useGameStore((state) => state.playerBluffTokens);
  const useBluffToken = useGameStore((state) => state.useBluffToken);
  const currentTurn = useGameStore((state) => state.currentTurn);

  // Toast for notifications
  const toast = useToast();

  // Handle using a bluff token
  const handleUseBluffToken = () => {
    // Can only use bluff tokens on opponent's turn
    if (currentTurn === "player") {
      toast({
        title: "Cannot use bluff token",
        description:
          "You can only use bluff tokens when your opponent is asking you questions.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const result = useBluffToken();

    if (result.success) {
      toast({
        title: "Bluff token used",
        description:
          "You can now mislead your opponent with false information.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } else {
      toast({
        title: "Failed to use bluff token",
        description: result.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      bg="background.darker"
      borderRadius="md"
      border="1px solid"
      borderColor="neutral.gray"
      p={4}
      w="100%"
      mb={4}
    >
      <VStack spacing={3} align="stretch">
        <Heading as="h3" size="sm" color="accent.red">
          Counter-Intelligence
        </Heading>

        <Divider borderColor="neutral.gray" opacity={0.3} />

        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm">
              Bluff tokens allow you to lie when answering your opponent's
              questions
            </Text>
            <HStack>
              <Text fontSize="sm">Available tokens:</Text>
              {[...Array(2)].map((_, i) => (
                <Badge
                  key={i}
                  colorScheme={i < playerBluffTokens ? "red" : "gray"}
                  variant="solid"
                  px={2}
                  borderRadius="full"
                >
                  {i < playerBluffTokens ? "Active" : "Used"}
                </Badge>
              ))}
            </HStack>
          </VStack>

          <Button
            leftIcon={<Shield size={18} />}
            colorScheme="red"
            size="sm"
            onClick={handleUseBluffToken}
            isDisabled={playerBluffTokens <= 0 || currentTurn === "player"}
            variant="outline"
          >
            Use Bluff Token
          </Button>
        </HStack>

        {currentTurn === "player" && (
          <Text fontSize="xs" color="neutral.gray" fontStyle="italic">
            You can only use bluff tokens during your opponent's turn
          </Text>
        )}

        {playerBluffTokens <= 0 && (
          <HStack color="accent.red" fontSize="xs">
            <AlertTriangle size={14} />
            <Text>No bluff tokens remaining</Text>
          </HStack>
        )}
      </VStack>
    </MotionBox>
  );
};

export default BluffPanel;
