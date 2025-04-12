import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  Text,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useGameStore } from "../stores/gameStore";

// Wrap components with motion
const MotionBox = motion(Box);

const GameSetup = ({ onStartGame }) => {
  // Game setup state
  const [gameMode, setGameMode] = useState("vsAI");
  const [difficulty, setDifficulty] = useState("medium");

  // Store actions
  const setGameConfig = useGameStore((state) => state.setGameConfig);

  // Handle start game
  const handleStartGame = () => {
    // Update store with game configuration
    setGameConfig(gameMode, difficulty);

    // Initialize game
    onStartGame();
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
      p={6}
      className="scan-effect"
    >
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h2" size="md" color="accent.green" mb={2}>
            Mission Briefing
          </Heading>
          <Text>
            Intelligence reports indicate a double agent has infiltrated the
            agency. Your mission is to identify this individual through
            strategic deduction and careful analysis.
          </Text>
        </Box>

        <Box>
          <Heading as="h3" size="sm" mb={3} color="neutral.lightGray">
            Operation Mode
          </Heading>
          <RadioGroup onChange={setGameMode} value={gameMode}>
            <Stack direction="column" spacing={3}>
              <Radio
                value="vsAI"
                colorScheme="green"
                sx={{
                  ".chakra-radio__control": {
                    borderColor: "neutral.gray",
                    _checked: {
                      bg: "accent.darkGreen",
                      borderColor: "accent.green",
                    },
                  },
                }}
              >
                <Text>Solo Operation (vs AI)</Text>
              </Radio>
              <Radio
                value="multiplayer"
                isDisabled
                colorScheme="green"
                sx={{
                  ".chakra-radio__control": {
                    borderColor: "neutral.gray",
                    _checked: {
                      bg: "accent.darkGreen",
                      borderColor: "accent.green",
                    },
                  },
                }}
              >
                <Text>Joint Operation (Multiplayer) - Coming Soon</Text>
              </Radio>
            </Stack>
          </RadioGroup>
        </Box>

        {gameMode === "vsAI" && (
          <Box>
            <Heading as="h3" size="sm" mb={3} color="neutral.lightGray">
              Difficulty Level
            </Heading>
            <RadioGroup onChange={setDifficulty} value={difficulty}>
              <Stack direction="column" spacing={3}>
                <Radio
                  value="easy"
                  colorScheme="green"
                  sx={{
                    ".chakra-radio__control": {
                      borderColor: "neutral.gray",
                      _checked: {
                        bg: "accent.darkGreen",
                        borderColor: "accent.green",
                      },
                    },
                  }}
                >
                  <Text>
                    Easy - Opponent makes logical errors and slow decisions
                  </Text>
                </Radio>
                <Radio
                  value="medium"
                  colorScheme="green"
                  sx={{
                    ".chakra-radio__control": {
                      borderColor: "neutral.gray",
                      _checked: {
                        bg: "accent.darkGreen",
                        borderColor: "accent.green",
                      },
                    },
                  }}
                >
                  <Text>Medium - Opponent makes occasional mistakes</Text>
                </Radio>
                <Radio
                  value="hard"
                  colorScheme="green"
                  sx={{
                    ".chakra-radio__control": {
                      borderColor: "neutral.gray",
                      _checked: {
                        bg: "accent.darkGreen",
                        borderColor: "accent.green",
                      },
                    },
                  }}
                >
                  <Text>Hard - Opponent utilizes optimal strategy</Text>
                </Radio>
              </Stack>
            </RadioGroup>
          </Box>
        )}

        <HStack justify="center" mt={4}>
          <Button
            variant="primary"
            onClick={handleStartGame}
            minW="150px"
            h="50px"
            fontSize="md"
          >
            Begin Operation
          </Button>
        </HStack>
      </VStack>
    </MotionBox>
  );
};

export default GameSetup;
