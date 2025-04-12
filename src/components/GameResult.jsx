import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

// Wrap with motion
const MotionBox = motion(Box);

// Game result component
const GameResult = ({ result, onPlayAgain }) => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      bg="background.darker"
      borderRadius="md"
      border="1px solid"
      borderColor="neutral.gray"
      p={6}
      textAlign="center"
    >
      <Box
        as="h2"
        fontSize="xl"
        color={result === "win" ? "accent.green" : "accent.red"}
        mb={4}
      >
        {result === "win" ? "Mission Accomplished" : "Mission Failed"}
      </Box>
      <Box mb={6}>
        {result === "win"
          ? "You successfully identified the double agent!"
          : "Your investigation led to the wrong conclusion."}
      </Box>
      <Box
        as="button"
        bg={result === "win" ? "accent.darkGreen" : "accent.darkRed"}
        color={result === "win" ? "accent.green" : "accent.red"}
        border="1px solid"
        borderColor={result === "win" ? "accent.green" : "accent.red"}
        px={4}
        py={2}
        borderRadius="md"
        onClick={onPlayAgain}
        textTransform="uppercase"
        letterSpacing="1px"
        _hover={{
          opacity: 0.9,
        }}
      >
        New Mission
      </Box>
    </MotionBox>
  );
};

export default GameResult;
