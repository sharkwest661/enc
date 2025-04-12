import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Select,
  Heading,
  Divider,
  useToast,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as VerifyIcon,
  Scan as ScanIcon,
  Network as CrossReferenceIcon,
  AlertTriangle as AccusationIcon,
} from "lucide-react";
import { useGameStore } from "../stores/gameStore";

// Motion components
const MotionBox = motion(Box);

const ActionPanel = () => {
  // Get game state
  const currentTurn = useGameStore((state) => state.currentTurn);
  const playerActionPoints = useGameStore((state) => state.playerActionPoints);
  const performAction = useGameStore((state) => state.performAction);
  const makeAccusation = useGameStore((state) => state.makeAccusation);
  const playerDeductionGrid = useGameStore(
    (state) => state.playerDeductionGrid
  );

  // Toast for notifications
  const toast = useToast();

  // Local state for action form
  const [actionType, setActionType] = useState("verify");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [selectedCategory2, setSelectedCategory2] = useState("");
  const [showAccusationForm, setShowAccusationForm] = useState(false);
  const [accusation, setAccusation] = useState({});

  // Categories and attributes from deduction grid
  const categories = Object.keys(playerDeductionGrid || {});

  // Determine available attributes for the selected category
  const availableAttributes = selectedCategory
    ? Object.keys(playerDeductionGrid[selectedCategory] || {})
    : [];

  // Calculate action costs
  const actionCosts = {
    verify: 1,
    scan: 2,
    crossReference: 3,
    accusation: 0,
  };

  // Handle action type change
  const handleActionTypeChange = (type) => {
    setActionType(type);
    setSelectedCategory("");
    setSelectedAttribute("");
    setSelectedCategory2("");
  };

  // Handle action execution
  const handleExecuteAction = () => {
    // Validate inputs based on action type
    if (actionType === "verify" && (!selectedCategory || !selectedAttribute)) {
      toast({
        title: "Invalid action",
        description: "Please select both category and attribute to verify",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (actionType === "scan" && !selectedCategory) {
      toast({
        title: "Invalid action",
        description: "Please select a category to scan",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (
      actionType === "crossReference" &&
      (!selectedCategory ||
        !selectedCategory2 ||
        selectedCategory === selectedCategory2)
    ) {
      toast({
        title: "Invalid action",
        description:
          "Please select two different categories to cross-reference",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Check if player has enough action points
    if (playerActionPoints < actionCosts[actionType]) {
      toast({
        title: "Not enough action points",
        description: `This action requires ${actionCosts[actionType]} action points`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Execute action based on type
    let result;
    switch (actionType) {
      case "verify":
        result = performAction("verify", {
          category: selectedCategory,
          attribute: selectedAttribute,
        });
        break;
      case "scan":
        result = performAction("scan", { category: selectedCategory });
        break;
      case "crossReference":
        result = performAction("crossReference", {
          category1: selectedCategory,
          category2: selectedCategory2,
        });
        break;
    }

    // Display action result
    if (result?.success) {
      toast({
        title: "Action successful",
        description: result.message,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      // Reset form
      setSelectedCategory("");
      setSelectedAttribute("");
      setSelectedCategory2("");
    } else if (result?.message) {
      toast({
        title: "Action failed",
        description: result.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Handle accusation
  const handleMakeAccusation = () => {
    // Toggle accusation form
    if (!showAccusationForm) {
      setShowAccusationForm(true);

      // Initialize accusation with confirmed attributes from grid
      const initialAccusation = {};

      Object.entries(playerDeductionGrid).forEach(([category, attributes]) => {
        // Find confirmed attribute in this category
        const confirmedAttribute = Object.entries(attributes).find(
          ([attr, status]) => status === "confirmed"
        );

        if (confirmedAttribute) {
          initialAccusation[category] = confirmedAttribute[0];
        } else {
          initialAccusation[category] = "";
        }
      });

      setAccusation(initialAccusation);
      return;
    }

    // Validate accusation
    const isComplete = Object.values(accusation).every((value) => value !== "");

    if (!isComplete) {
      toast({
        title: "Incomplete accusation",
        description: "Please select an attribute for each category",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Submit accusation
    const result = makeAccusation(accusation);

    // Display result (game will transition to result screen)
    toast({
      title:
        result.gameResult === "win"
          ? "Accusation correct!"
          : "Accusation incorrect!",
      description: result.message,
      status: result.gameResult === "win" ? "success" : "error",
      duration: 5000,
      isClosable: true,
      position: "top",
    });

    // Reset form
    setShowAccusationForm(false);
  };

  // Update accusation form
  const handleAccusationChange = (category, attribute) => {
    setAccusation((prev) => ({
      ...prev,
      [category]: attribute,
    }));
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
    >
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading as="h3" size="sm" color="accent.green" mb={2}>
            Actions
          </Heading>
          <Text fontSize="sm" color="neutral.lightGray">
            Use action points to gather intelligence
          </Text>
        </Box>

        <Divider borderColor="neutral.gray" opacity={0.3} />

        {/* Action buttons */}
        <HStack spacing={2} justify="space-between">
          <ActionButton
            isActive={actionType === "verify"}
            onClick={() => handleActionTypeChange("verify")}
            icon={<VerifyIcon size={18} />}
            label="Verify"
            cost={1}
            disabled={currentTurn !== "player"}
          />

          <ActionButton
            isActive={actionType === "scan"}
            onClick={() => handleActionTypeChange("scan")}
            icon={<ScanIcon size={18} />}
            label="Scan"
            cost={2}
            disabled={currentTurn !== "player"}
          />

          <ActionButton
            isActive={actionType === "crossReference"}
            onClick={() => handleActionTypeChange("crossReference")}
            icon={<CrossReferenceIcon size={18} />}
            label="Cross-ref"
            cost={3}
            disabled={currentTurn !== "player"}
          />
        </HStack>

        <AnimatePresence mode="wait">
          {/* Action form based on selected action type */}
          {!showAccusationForm && (
            <MotionBox
              key={actionType}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {actionType === "verify" && (
                <VStack spacing={3} align="stretch">
                  <Select
                    placeholder="Select category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    bg="background.dark"
                    borderColor="neutral.gray"
                    _hover={{ borderColor: "accent.green" }}
                    disabled={currentTurn !== "player"}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Select attribute"
                    value={selectedAttribute}
                    onChange={(e) => setSelectedAttribute(e.target.value)}
                    bg="background.dark"
                    borderColor="neutral.gray"
                    _hover={{ borderColor: "accent.green" }}
                    disabled={!selectedCategory || currentTurn !== "player"}
                  >
                    {availableAttributes.map((attribute) => (
                      <option key={attribute} value={attribute}>
                        {attribute}
                      </option>
                    ))}
                  </Select>

                  <Text fontSize="xs" color="neutral.lightGray">
                    Verify if a specific attribute is part of the agent's
                    profile.
                  </Text>
                </VStack>
              )}

              {actionType === "scan" && (
                <VStack spacing={3} align="stretch">
                  <Select
                    placeholder="Select category to scan"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    bg="background.dark"
                    borderColor="neutral.gray"
                    _hover={{ borderColor: "accent.green" }}
                    disabled={currentTurn !== "player"}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>

                  <Text fontSize="xs" color="neutral.lightGray">
                    Scan a category to learn how many attributes you've
                    correctly identified.
                  </Text>
                </VStack>
              )}

              {actionType === "crossReference" && (
                <VStack spacing={3} align="stretch">
                  <Select
                    placeholder="Select first category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    bg="background.dark"
                    borderColor="neutral.gray"
                    _hover={{ borderColor: "accent.green" }}
                    disabled={currentTurn !== "player"}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Select second category"
                    value={selectedCategory2}
                    onChange={(e) => setSelectedCategory2(e.target.value)}
                    bg="background.dark"
                    borderColor="neutral.gray"
                    _hover={{ borderColor: "accent.green" }}
                    disabled={!selectedCategory || currentTurn !== "player"}
                  >
                    {categories
                      .filter((category) => category !== selectedCategory)
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </Select>

                  <Text fontSize="xs" color="neutral.lightGray">
                    Cross-reference two categories to discover relationships
                    between attributes.
                  </Text>
                </VStack>
              )}

              <Button
                variant="primary"
                w="100%"
                mt={3}
                onClick={handleExecuteAction}
                disabled={currentTurn !== "player"}
              >
                Execute Action
              </Button>
            </MotionBox>
          )}

          {/* Accusation form */}
          {showAccusationForm && (
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <VStack spacing={3} align="stretch">
                <Text fontWeight="bold" color="accent.red">
                  Final Accusation
                </Text>

                {categories.map((category) => (
                  <Select
                    key={category}
                    placeholder={`Select ${category}`}
                    value={accusation[category] || ""}
                    onChange={(e) =>
                      handleAccusationChange(category, e.target.value)
                    }
                    bg="background.dark"
                    borderColor="neutral.gray"
                    _hover={{ borderColor: "accent.red" }}
                  >
                    {Object.keys(playerDeductionGrid[category] || {}).map(
                      (attribute) => (
                        <option key={attribute} value={attribute}>
                          {attribute}
                        </option>
                      )
                    )}
                  </Select>
                ))}

                <Text fontSize="xs" color="accent.red">
                  Warning: An incorrect accusation will result in immediate
                  mission failure.
                </Text>

                <HStack>
                  <Button
                    variant="danger"
                    flex="1"
                    onClick={handleMakeAccusation}
                  >
                    Confirm Accusation
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => setShowAccusationForm(false)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Accusation button */}
        {!showAccusationForm && (
          <Button
            variant="danger"
            leftIcon={<AccusationIcon size={16} />}
            onClick={handleMakeAccusation}
            mt={2}
            disabled={currentTurn !== "player"}
          >
            Make Accusation
          </Button>
        )}
      </VStack>
    </MotionBox>
  );
};

// Action button component
const ActionButton = ({ isActive, onClick, icon, label, cost, disabled }) => (
  <MotionBox
    as="button"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    p={3}
    borderRadius="md"
    border="1px solid"
    borderColor={isActive ? "accent.green" : "neutral.gray"}
    bg={isActive ? "accent.darkGreen" : "background.dark"}
    color={isActive ? "accent.green" : "neutral.lightGray"}
    onClick={onClick}
    disabled={disabled}
    opacity={disabled ? 0.5 : 1}
    cursor={disabled ? "not-allowed" : "pointer"}
    flex="1"
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    transition={{ duration: 0.1 }}
  >
    <Box mb={1}>{icon}</Box>
    <Text fontSize="xs" fontWeight="bold">
      {label}
    </Text>
    <Badge
      bg={isActive ? "accent.green" : "neutral.gray"}
      color="background.dark"
      mt={1}
      fontSize="10px"
    >
      {cost} AP
    </Badge>
  </MotionBox>
);

export default ActionPanel;
