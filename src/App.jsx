import React, { useEffect } from "react";
import { ChakraProvider, Box, Flex, Container, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import theme from "./theme";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";
import GameResult from "./components/GameResult";
import { useGameStore } from "./stores/gameStore";
import { useAIStore } from "./stores/aiStore";

// Wrap components with motion
const MotionBox = motion(Box);

function App() {
  // Get game state
  const gameMode = useGameStore((state) => state.gameMode);
  const gameResult = useGameStore((state) => state.gameResult);
  const agentProfile = useGameStore((state) => state.agentProfile);
  const initializeGame = useGameStore((state) => state.initializeGame);
  const initializeAI = useAIStore((state) => state.initializeAI);

  // Determine which screen to show
  const showSetup = !agentProfile && !gameResult;
  const showGame = agentProfile && !gameResult;
  const showResult = gameResult;

  // Initialize AI when game starts
  useEffect(() => {
    if (agentProfile && gameMode === "vsAI") {
      initializeAI();
    }
  }, [agentProfile, gameMode, initializeAI]);

  return (
    <ChakraProvider theme={theme}>
      <Box
        minH="100vh"
        bg="background.dark"
        className="app-container"
        position="relative"
        overflow="hidden"
      >
        {/* Background grid effect */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="0"
          opacity="0.15"
          pointerEvents="none"
          sx={{
            backgroundImage: `
              repeating-linear-gradient(
                var(--chakra-colors-background-dark) 0px, 
                var(--chakra-colors-background-dark) 19px, 
                var(--chakra-colors-accent-darkGreen) 20px
              ),
              repeating-linear-gradient(
                90deg,
                var(--chakra-colors-background-dark) 0px, 
                var(--chakra-colors-background-dark) 19px, 
                var(--chakra-colors-accent-darkGreen) 20px
              )
            `,
          }}
        />

        {/* Main content */}
        <Container maxW="container.xl" py={6} position="relative" zIndex="1">
          <VStack spacing={6} align="stretch">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              textAlign="center"
              mb={6}
            >
              <Box
                as="h1"
                fontSize="2xl"
                letterSpacing="3px"
                textTransform="uppercase"
                color="accent.green"
                mb={2}
              >
                Encrypted Signatures
              </Box>
              <Box fontSize="md" color="neutral.lightGray">
                A two-player strategic deduction game about uncovering double
                agents
              </Box>
            </MotionBox>

            {/* Conditional rendering based on game state */}
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="center"
              align="stretch"
              minH="70vh"
            >
              {showSetup && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  flex="1"
                >
                  <GameSetup onStartGame={initializeGame} />
                </MotionBox>
              )}

              {showGame && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  flex="1"
                >
                  <GameBoard />
                </MotionBox>
              )}

              {showResult && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  flex="1"
                >
                  <GameResult
                    result={gameResult}
                    onPlayAgain={initializeGame}
                  />
                </MotionBox>
              )}
            </Flex>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
