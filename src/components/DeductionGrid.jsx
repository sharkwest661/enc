import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Grid,
  GridItem,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  useMediaQuery,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../stores/gameStore";

// Wrap with motion
const MotionBox = motion(Box);

const DeductionGrid = () => {
  // Get screen size
  const [isLargerThanMd] = useMediaQuery("(min-width: 768px)");

  // Get deduction grid from store
  const playerDeductionGrid = useGameStore(
    (state) => state.playerDeductionGrid
  );
  const updatePlayerGrid = useGameStore((state) => state.updatePlayerGrid);

  // Categories for the deduction grid
  const categories = Object.keys(playerDeductionGrid || {});

  // Handle grid cell click to update status
  const handleCellClick = (category, attribute) => {
    const currentStatus = playerDeductionGrid[category][attribute];

    // Cycle through statuses: unknown -> confirmed -> eliminated -> unknown
    let newStatus;
    switch (currentStatus) {
      case "unknown":
        newStatus = "confirmed";
        break;
      case "confirmed":
        newStatus = "eliminated";
        break;
      case "eliminated":
        newStatus = "unknown";
        break;
      default:
        newStatus = "unknown";
    }

    updatePlayerGrid(category, attribute, newStatus);
  };

  // Render grid for desktop
  if (isLargerThanMd) {
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
        h="100%"
        overflowY="auto"
      >
        <VStack spacing={4} align="stretch">
          <Box>
            <Heading as="h3" size="sm" color="accent.green" mb={2}>
              Deduction Matrix
            </Heading>
            <Text fontSize="sm" color="neutral.lightGray">
              Track your deductions by clicking on cells to mark them
            </Text>
          </Box>

          <Grid templateColumns={`repeat(${categories.length}, 1fr)`} gap={4}>
            {categories.map((category) => (
              <GridItem key={category}>
                <VStack align="stretch" spacing={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="1px"
                  >
                    {category}
                  </Text>

                  {Object.entries(playerDeductionGrid[category]).map(
                    ([attribute, status]) => (
                      <GridCell
                        key={attribute}
                        category={category}
                        attribute={attribute}
                        status={status}
                        onClick={() => handleCellClick(category, attribute)}
                      />
                    )
                  )}
                </VStack>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </MotionBox>
    );
  }

  // Render tabs for mobile
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
    >
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading as="h3" size="sm" color="accent.green" mb={2}>
            Deduction Matrix
          </Heading>
          <Text fontSize="sm" color="neutral.lightGray">
            Track your deductions by clicking on cells to mark them
          </Text>
        </Box>

        <Tabs variant="soft-rounded" colorScheme="green" size="sm">
          <TabList>
            {categories.map((category) => (
              <Tab
                key={category}
                _selected={{
                  color: "accent.green",
                  bg: "accent.darkGreen",
                  fontWeight: "bold",
                }}
                color="neutral.lightGray"
              >
                {category}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {categories.map((category) => (
              <TabPanel key={category} p={2}>
                <VStack align="stretch" spacing={3} mt={2}>
                  {Object.entries(playerDeductionGrid[category]).map(
                    ([attribute, status]) => (
                      <GridCell
                        key={attribute}
                        category={category}
                        attribute={attribute}
                        status={status}
                        onClick={() => handleCellClick(category, attribute)}
                      />
                    )
                  )}
                </VStack>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </MotionBox>
  );
};

// Grid cell component with status animations
const GridCell = ({ category, attribute, status, onClick }) => {
  // Define variants for different statuses
  const variants = {
    unknown: {
      backgroundColor: "var(--chakra-colors-background-darker)",
      color: "var(--chakra-colors-neutral-lightGray)",
      borderColor: "var(--chakra-colors-neutral-gray)",
    },
    confirmed: {
      backgroundColor: "var(--chakra-colors-accent-darkGreen)",
      color: "var(--chakra-colors-accent-green)",
      borderColor: "var(--chakra-colors-accent-green)",
    },
    eliminated: {
      backgroundColor: "var(--chakra-colors-accent-darkRed)",
      color: "var(--chakra-colors-accent-red)",
      borderColor: "var(--chakra-colors-accent-red)",
    },
  };

  return (
    <MotionBox
      initial="unknown"
      animate={status}
      variants={variants}
      transition={{ duration: 0.2 }}
      borderRadius="md"
      border="1px solid"
      p={2}
      textAlign="center"
      fontSize="sm"
      cursor="pointer"
      onClick={onClick}
      position="relative"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      _hover={{
        opacity: 0.9,
      }}
    >
      <Text>{attribute}</Text>

      {/* Strikethrough for eliminated items */}
      {status === "eliminated" && (
        <MotionBox
          position="absolute"
          top="50%"
          left="-5%"
          right="-5%"
          height="1px"
          backgroundColor="var(--chakra-colors-accent-red)"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        />
      )}
    </MotionBox>
  );
};

export default DeductionGrid;
