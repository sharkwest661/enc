import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useGameStore } from "../stores/gameStore";

// Wrap with motion
const MotionBox = motion(Box);

const ProfileDisplay = () => {
  // Get player's known attributes from store
  const playerKnownAttributes = useGameStore(
    (state) => state.playerKnownAttributes
  );
  const playerDeductionGrid = useGameStore(
    (state) => state.playerDeductionGrid
  );

  // Create a map of confirmed attributes from the grid
  const confirmedAttributes = {};

  if (playerDeductionGrid) {
    Object.entries(playerDeductionGrid).forEach(([category, attributes]) => {
      confirmedAttributes[category] = [];

      Object.entries(attributes).forEach(([attribute, status]) => {
        if (status === "confirmed") {
          confirmedAttributes[category].push(attribute);
        }
      });
    });
  }

  // Calculate how many attributes have been confirmed
  const confirmedCount = Object.values(confirmedAttributes).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  // Calculate reveal percentage (0-100%) based on confirmed attributes
  // Total possible attributes is 4 (one per category)
  const revealPercentage = (confirmedCount / 4) * 100;

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      bg="background.darker"
      borderRadius="md"
      border="1px solid"
      borderColor="neutral.gray"
      p={4}
      w="100%"
      className="scan-effect"
    >
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading as="h3" size="sm" color="accent.green" mb={2}>
            Agent Profile
          </Heading>
          <Text fontSize="sm" color="neutral.lightGray">
            Known intelligence about the double agent
          </Text>
        </Box>

        <Divider borderColor="neutral.gray" opacity={0.3} />

        <Box position="relative">
          {/* Agent silhouette with progressive reveal */}
          <Box
            position="relative"
            height="160px"
            bg="background.dark"
            borderRadius="md"
            overflow="hidden"
            mb={3}
          >
            {/* Base silhouette */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              opacity="0.3"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                as="svg"
                width="100px"
                height="100px"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--chakra-colors-neutral-gray)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.3}
              >
                <path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3Z" />
                <path d="M19 5a7 7 0 0 0-14 0" />
                <path d="M12 12a3 3 0 0 0-3 3v6h6v-6a3 3 0 0 0-3-3Z" />
                <path d="M8 5h8" />
                <path d="M18 5h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                <path d="M5 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
                <path d="M12 17v-5" />
                <path d="M9 12h6" />
              </Box>
            </Box>

            {/* Revealed silhouette */}
            <MotionBox
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
              animate={{
                clipPath: `polygon(0 0, ${revealPercentage}% 0, ${revealPercentage}% 100%, 0 100%)`,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                as="svg"
                width="100px"
                height="100px"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--chakra-colors-accent-green)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={1.0}
              >
                <path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3Z" />
                <path d="M19 5a7 7 0 0 0-14 0" />
                <path d="M12 12a3 3 0 0 0-3 3v6h6v-6a3 3 0 0 0-3-3Z" />
                <path d="M8 5h8" />
                <path d="M18 5h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                <path d="M5 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
                <path d="M12 17v-5" />
                <path d="M9 12h6" />
              </Box>
            </MotionBox>

            {/* Scan effect */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              className="scan-effect"
              pointerEvents="none"
            />
          </Box>

          {/* Attribute categories */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={3}>
            {Object.entries(confirmedAttributes).map(
              ([category, attributes]) => (
                <GridItem key={category}>
                  <VStack align="start" spacing={1}>
                    <Text
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="1px"
                      color="neutral.lightGray"
                    >
                      {category}
                    </Text>
                    {attributes.length > 0 ? (
                      attributes.map((attribute) => (
                        <AttributeTag key={attribute} attribute={attribute} />
                      ))
                    ) : (
                      <Text
                        fontSize="sm"
                        color="neutral.gray"
                        fontStyle="italic"
                      >
                        Unknown
                      </Text>
                    )}
                  </VStack>
                </GridItem>
              )
            )}
          </Grid>
        </Box>
      </VStack>
    </MotionBox>
  );
};

// Attribute tag component for confirmed attributes
const AttributeTag = ({ attribute }) => (
  <MotionBox
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    bg="accent.darkGreen"
    color="accent.green"
    borderRadius="md"
    px={2}
    py={1}
    fontSize="sm"
    border="1px solid"
    borderColor="accent.green"
    whiteSpace="nowrap"
    overflow="hidden"
    textOverflow="ellipsis"
    maxW="100%"
  >
    {attribute}
  </MotionBox>
);

export default ProfileDisplay;
