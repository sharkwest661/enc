import React, { useEffect } from "react";
import {
  Box,
  Grid,
  GridItem,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../stores/gameStore";
import { useAIStore } from "../stores/aiStore";
import ProfileDisplay from "./ProfileDisplay";
import DeductionGrid from "./DeductionGrid";
import ActionPanel from "./ActionPanel";
import BluffPanel from "./BluffPanel";
import GameLog from "./GameLog";

// Wrap components with motion
const MotionBox = motion(Box);

const GameBoard = () => {
  // Get responsive breakpoint
  const [isLargerThanMd] = useMediaQuery("(min-width: 768px)");

  // Get game state
  const currentTurn = useGameStore((state) => state.currentTurn);
  const playerActionPoints = useGameStore((state) => state.playerActionPoints);
  const playerBluffTokens = useGameStore((state) => state.playerBluffTokens);
  const turnNumber = useGameStore((state) => state.turnNumber);
  const gameMode = useGameStore((state) => state.gameMode);
  const endTurn = useGameStore((state) => state.endTurn);

  // Get AI state
  const thinkingState = useAIStore((state) => state.thinkingState);
  const calculateNextMove = useAIStore((state) => state.calculateNextMove);

  // Handle AI's turn
  useEffect(() => {
    if (gameMode === "vsAI" && currentTurn === "opponent") {
      // Trigger AI decision making
      const timer = setTimeout(() => {
        calculateNextMove();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, calculateNextMove]);

  // Layout for different screen sizes
  const desktopLayout = (
    <Grid
      templateColumns="1fr 2fr"
      templateRows="auto 1fr auto"
      gap={4}
      h="100%"
    >
      <GridItem colSpan={2} rowSpan={1}>
        <GameStatus
          currentTurn={currentTurn}
          turnNumber={turnNumber}
          playerActionPoints={playerActionPoints}
          playerBluffTokens={playerBluffTokens}
          thinkingState={thinkingState}
        />
      </GridItem>

      <GridItem colSpan={1} rowSpan={1}>
        <VStack spacing={4} h="100%">
          <ProfileDisplay />
          <BluffPanel />
          <ActionPanel />
        </VStack>
      </GridItem>

      <GridItem colSpan={1} rowSpan={1}>
        <DeductionGrid />
      </GridItem>

      <GridItem colSpan={2} rowSpan={1}>
        <GameLog />
      </GridItem>
    </Grid>
  );

  const mobileLayout = (
    <VStack spacing={4} h="100%">
      <GameStatus
        currentTurn={currentTurn}
        turnNumber={turnNumber}
        playerActionPoints={playerActionPoints}
        playerBluffTokens={playerBluffTokens}
        thinkingState={thinkingState}
      />

      <Box w="100%" flexGrow={1} overflowY="auto">
        <VStack spacing={4} align="stretch">
          <ProfileDisplay />
          <BluffPanel />
          <DeductionGrid />
          <ActionPanel />
        </VStack>
      </Box>

      <Box w="100%">
        <GameLog />
      </Box>
    </VStack>
  );

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      h="100%"
      minH="70vh"
    >
      {isLargerThanMd ? desktopLayout : mobileLayout}
    </MotionBox>
  );
};

// Game status component
const GameStatus = ({
  currentTurn,
  turnNumber,
  playerActionPoints,
  playerBluffTokens,
  thinkingState,
}) => {
  const endTurn = useGameStore((state) => state.endTurn);

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      bg="background.darker"
      borderRadius="md"
      border="1px solid"
      borderColor="neutral.gray"
      p={3}
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <Box>
            <Text fontSize="xs" color="neutral.lightGray">
              Turn
            </Text>
            <Text fontSize="md" fontWeight="bold">
              {turnNumber}
            </Text>
          </Box>

          <Box>
            <Text fontSize="xs" color="neutral.lightGray">
              Current Player
            </Text>
            <HStack>
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={currentTurn === "player" ? "accent.green" : "accent.red"}
                boxShadow={`0 0 10px ${
                  currentTurn === "player"
                    ? "var(--chakra-colors-accent-green)"
                    : "var(--chakra-colors-accent-red)"
                }`}
              />
              <Text fontSize="md" fontWeight="bold">
                {currentTurn === "player" ? "You" : "Opponent"}
                {currentTurn === "opponent" &&
                  thinkingState === "thinking" &&
                  " (Thinking...)"}
                {currentTurn === "opponent" &&
                  thinkingState === "acting" &&
                  " (Acting...)"}
              </Text>
            </HStack>
          </Box>
        </HStack>

        <HStack spacing={4}>
          <Box>
            <Text fontSize="xs" color="neutral.lightGray">
              Action Points
            </Text>
            <HStack spacing={1}>
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg={
                    i < playerActionPoints ? "accent.green" : "background.dark"
                  }
                  border="1px solid"
                  borderColor={
                    i < playerActionPoints ? "accent.green" : "neutral.gray"
                  }
                  opacity={i < playerActionPoints ? 1 : 0.5}
                />
              ))}
            </HStack>
          </Box>

          <Box>
            <Text fontSize="xs" color="neutral.lightGray">
              Bluff Tokens
            </Text>
            <HStack spacing={1}>
              {[...Array(2)].map((_, i) => (
                <Box
                  key={i}
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg={i < playerBluffTokens ? "accent.red" : "background.dark"}
                  border="1px solid"
                  borderColor={
                    i < playerBluffTokens ? "accent.red" : "neutral.gray"
                  }
                  opacity={i < playerBluffTokens ? 1 : 0.5}
                />
              ))}
            </HStack>
          </Box>

          {currentTurn === "player" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={endTurn}
              disabled={currentTurn !== "player"}
            >
              End Turn
            </Button>
          )}
        </HStack>
      </Flex>
    </MotionBox>
  );
};

export default GameBoard;
