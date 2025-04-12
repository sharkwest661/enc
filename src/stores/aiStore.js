import { create } from "zustand";
import { useGameStore } from "./gameStore";

// AI logic store
export const useAIStore = create((set, get) => ({
  // AI state
  thinkingState: "idle", // 'idle', 'thinking', 'acting'
  focusCategory: null,
  isBluffing: false,

  // Knowledge representation
  attributeProbabilities: {},
  inferenceHistory: [],

  // Initialize AI Knowledge
  initializeAI: () => {
    const categories = {
      appearance: ["Blonde Hair", "Blue Eyes", "Tall", "Has Tattoo"],
      habits: [
        "Coffee Drinker",
        "Early Riser",
        "Chess Player",
        "Smokes Cigars",
      ],
      contacts: ["Diplomat", "Journalist", "Academic", "Military"],
      locations: ["Paris", "Moscow", "Cairo", "Tokyo"],
    };

    // Initialize probability matrix
    const probabilities = {};

    Object.entries(categories).forEach(([category, attributes]) => {
      probabilities[category] = {};
      attributes.forEach((attribute) => {
        // Start with equal probability for all attributes
        probabilities[category][attribute] = 0.25; // 1/4 for each attribute in a category
      });
    });

    // Update with knowledge from initial known attributes
    const opponentKnown = useGameStore.getState().opponentKnownAttributes;
    opponentKnown.forEach(({ category, attribute }) => {
      // Set probability to 1 for known attributes and 0 for others
      Object.keys(probabilities[category]).forEach((attr) => {
        probabilities[category][attr] = attr === attribute ? 1.0 : 0.0;
      });
    });

    set({
      attributeProbabilities: probabilities,
      inferenceHistory: [],
      thinkingState: "idle",
      focusCategory: null,
    });
  },

  // AI also has bluff tokens
  calculateNextMove: () => {
    // Start thinking process
    set({ thinkingState: "thinking" });

    // Get current game state
    const gameState = useGameStore.getState();
    const difficulty = gameState.difficulty;
    const opponentBluffTokens = gameState.opponentBluffTokens;

    // Simulate AI thinking time based on difficulty
    const thinkingTime = {
      easy: 1000,
      medium: 2000,
      hard: 3000,
    }[difficulty];

    // After "thinking", decide on an action
    setTimeout(() => {
      const action = decideBestAction(get().attributeProbabilities, gameState);

      // Decide whether to use a bluff token
      let useBluff = false;
      if (opponentBluffTokens > 0 && gameState.turnNumber > 3) {
        // More likely to use bluff tokens on higher difficulties and later in the game
        const bluffChance = {
          easy: 0.1,
          medium: 0.25,
          hard: 0.4,
        }[difficulty];

        if (Math.random() < bluffChance) {
          useBluff = true;

          // Spend a bluff token
          useGameStore.setState({
            opponentBluffTokens: opponentBluffTokens - 1,
            gameLog: [
              ...gameState.gameLog,
              {
                turn: gameState.turnNumber,
                player: "opponent",
                action: "bluff",
                message: "Opponent used a counter-intelligence token to bluff.",
              },
            ],
          });
        }
      }

      // Set acting state
      set({
        thinkingState: "acting",
        focusCategory: action.category,
        isBluffing: useBluff,
      });

      // Execute the chosen action after a brief delay
      setTimeout(() => {
        executeAIAction({ ...action, isBluffing: useBluff }, gameState);

        // Return to idle state
        set({ thinkingState: "idle", focusCategory: null, isBluffing: false });

        // End turn
        useGameStore.getState().endTurn();
      }, 1000);
    }, thinkingTime);
  },

  // Update knowledge based on new information
  updateKnowledge: (information) => {
    set((state) => {
      const updatedProbabilities = { ...state.attributeProbabilities };
      const newInferenceHistory = [...state.inferenceHistory, information];

      switch (information.type) {
        case "verify":
          updateFromVerify(updatedProbabilities, information);
          break;
        case "scan":
          updateFromScan(updatedProbabilities, information);
          break;
        case "crossReference":
          updateFromCrossReference(updatedProbabilities, information);
          break;
      }

      return {
        attributeProbabilities: updatedProbabilities,
        inferenceHistory: newInferenceHistory,
      };
    });
  },
}));

// Helper functions for AI decision making

const decideBestAction = (probabilities, gameState) => {
  // This is a simplified implementation
  // In a full game, this would use more sophisticated logic

  // Check AI action points
  const actionPoints = gameState.opponentActionPoints;

  // Find category with most uncertainty (closest to 0.5 probability)
  let mostUncertainCategory = null;
  let closestToHalf = 1.0;

  Object.entries(probabilities).forEach(([category, attributes]) => {
    // Check if we have any uncertainty in this category
    const hasUncertainty = Object.values(attributes).some(
      (prob) => prob > 0 && prob < 1
    );

    if (hasUncertainty) {
      // Find attribute with probability closest to 0.5
      Object.entries(attributes).forEach(([attribute, prob]) => {
        const distanceToHalf = Math.abs(prob - 0.5);
        if (distanceToHalf < closestToHalf) {
          closestToHalf = distanceToHalf;
          mostUncertainCategory = category;
        }
      });
    }
  });

  // If we're certain about everything, just make an accusation
  if (!mostUncertainCategory) {
    const accusation = {};
    Object.entries(probabilities).forEach(([category, attributes]) => {
      // Find attribute with highest probability
      let highestProb = 0;
      let bestAttribute = null;

      Object.entries(attributes).forEach(([attribute, prob]) => {
        if (prob > highestProb) {
          highestProb = prob;
          bestAttribute = attribute;
        }
      });

      accusation[category] = bestAttribute;
    });

    return {
      type: "accusation",
      accusation,
    };
  }

  // Choose action based on available action points
  if (actionPoints >= 3) {
    // Find another uncertain category for cross-reference
    let secondCategory = null;
    closestToHalf = 1.0;

    Object.entries(probabilities).forEach(([category, attributes]) => {
      if (category !== mostUncertainCategory) {
        // Check if we have any uncertainty in this category
        const hasUncertainty = Object.values(attributes).some(
          (prob) => prob > 0 && prob < 1
        );

        if (hasUncertainty) {
          // Find attribute with probability closest to 0.5
          Object.entries(attributes).forEach(([attribute, prob]) => {
            const distanceToHalf = Math.abs(prob - 0.5);
            if (distanceToHalf < closestToHalf) {
              closestToHalf = distanceToHalf;
              secondCategory = category;
            }
          });
        }
      }
    });

    if (secondCategory) {
      return {
        type: "crossReference",
        category1: mostUncertainCategory,
        category2: secondCategory,
      };
    }
  }

  if (actionPoints >= 2) {
    return {
      type: "scan",
      category: mostUncertainCategory,
    };
  }

  // Find most uncertain attribute in the most uncertain category
  let mostUncertainAttribute = null;
  closestToHalf = 1.0;

  Object.entries(probabilities[mostUncertainCategory]).forEach(
    ([attribute, prob]) => {
      const distanceToHalf = Math.abs(prob - 0.5);
      if (distanceToHalf < closestToHalf) {
        closestToHalf = distanceToHalf;
        mostUncertainAttribute = attribute;
      }
    }
  );

  return {
    type: "verify",
    category: mostUncertainCategory,
    attribute: mostUncertainAttribute,
  };
};

const executeAIAction = (action, gameState) => {
  const { type, isBluffing } = action;

  switch (type) {
    case "verify":
      executeVerify(action, gameState);
      break;
    case "scan":
      executeScan(action, gameState);
      break;
    case "crossReference":
      executeCrossReference(action, gameState);
      break;
    case "accusation":
      executeAccusation(action, gameState);
      break;
  }
};

// Helper functions for AI action execution

const executeVerify = (action, gameState) => {
  const { category, attribute } = action;

  // Check if the attribute is correct
  const isCorrect = gameState.agentProfile[category] === attribute;

  // Determine if the player will use a bluff token
  // This simulates the player's decision to use a bluff token
  // In a multiplayer game, this would be the player's actual choice
  let useBluff = false;
  let isBluffed = false;

  // If the player has bluff tokens available and the AI is about to uncover a correct attribute,
  // there's a chance the player might use a bluff token to mislead the AI
  if (gameState.playerBluffTokens > 0 && isCorrect) {
    // Higher chance to bluff on harder difficulty levels
    const bluffChance = {
      easy: 0.1, // 10% chance
      medium: 0.3, // 30% chance
      hard: 0.5, // 50% chance
    }[gameState.difficulty];

    if (Math.random() < bluffChance) {
      useBluff = true;
      isBluffed = true;

      // Update player's bluff tokens
      useGameStore.setState({
        playerBluffTokens: gameState.playerBluffTokens - 1,
        gameLog: [
          ...gameState.gameLog,
          {
            turn: gameState.turnNumber,
            player: "player",
            action: "bluff",
            message: "You used a counter-intelligence token to bluff.",
          },
        ],
      });
    }
  }

  // Update AI's deduction grid with potentially misleading information if bluffed
  const updatedGrid = { ...gameState.aiDeductionGrid };
  updatedGrid[category][attribute] =
    (isCorrect && !isBluffed) || (!isCorrect && isBluffed)
      ? "confirmed"
      : "eliminated";

  // If confirmed (correctly or via bluff), eliminate all other attributes in the category
  if (updatedGrid[category][attribute] === "confirmed") {
    Object.keys(updatedGrid[category]).forEach((attr) => {
      if (attr !== attribute) {
        updatedGrid[category][attr] = "eliminated";
      }
    });
  }

  // Update game state
  useGameStore.setState({
    opponentActionPoints: gameState.opponentActionPoints - 1,
    aiDeductionGrid: updatedGrid,
    gameLog: [
      ...gameState.gameLog,
      {
        turn: gameState.turnNumber,
        player: "opponent",
        action: "verify",
        message: `Opponent verified ${attribute} in ${category}.${
          isBluffed ? " (Bluffed)" : ""
        }`,
      },
    ],
  });

  // Update AI knowledge - if bluffed, AI receives incorrect information
  useAIStore.getState().updateKnowledge({
    type: "verify",
    category,
    attribute,
    isCorrect: isBluffed ? !isCorrect : isCorrect,
  });
};

const executeScan = (action, gameState) => {
  const { category } = action;

  // Count correct attributes in the category
  let correctCount = 0;
  const categoryGrid = gameState.aiDeductionGrid[category];

  Object.entries(categoryGrid).forEach(([attribute, status]) => {
    if (
      status === "confirmed" &&
      gameState.agentProfile[category] === attribute
    ) {
      correctCount++;
    }
  });

  // Update game state
  useGameStore.setState({
    opponentActionPoints: gameState.opponentActionPoints - 2,
    gameLog: [
      ...gameState.gameLog,
      {
        turn: gameState.turnNumber,
        player: "opponent",
        action: "scan",
        message: `Opponent scanned ${category}.`,
      },
    ],
  });

  // Update AI knowledge
  useAIStore.getState().updateKnowledge({
    type: "scan",
    category,
    correctCount,
  });
};

const executeCrossReference = (action, gameState) => {
  const { category1, category2 } = action;

  // Update game state
  useGameStore.setState({
    opponentActionPoints: gameState.opponentActionPoints - 3,
    gameLog: [
      ...gameState.gameLog,
      {
        turn: gameState.turnNumber,
        player: "opponent",
        action: "crossReference",
        message: `Opponent cross-referenced ${category1} and ${category2}.`,
      },
    ],
  });

  // Update AI knowledge
  useAIStore.getState().updateKnowledge({
    type: "crossReference",
    category1,
    category2,
  });
};

const executeAccusation = (action, gameState) => {
  const { accusation } = action;

  // Verify accusation against solution
  let correct = true;
  Object.entries(accusation).forEach(([category, attribute]) => {
    if (gameState.agentProfile[category] !== attribute) {
      correct = false;
    }
  });

  // Update game state with result
  useGameStore.setState({
    gameResult: correct ? "loss" : "win", // Player loses if AI is correct
    gameLog: [
      ...gameState.gameLog,
      {
        turn: gameState.turnNumber,
        player: "opponent",
        action: "accusation",
        message: correct
          ? "Opponent made a correct accusation and won the game."
          : "Opponent made an incorrect accusation and lost the game.",
      },
    ],
  });
};

// Helper functions for updating AI knowledge

const updateFromVerify = (probabilities, information) => {
  const { category, attribute, isCorrect } = information;

  if (isCorrect) {
    // Set probability to 1 for this attribute and 0 for all others in the category
    Object.keys(probabilities[category]).forEach((attr) => {
      probabilities[category][attr] = attr === attribute ? 1.0 : 0.0;
    });
  } else {
    // Set probability to a for this attribute
    probabilities[category][attribute] = 0.0;

    // Normalize remaining probabilities
    const remainingAttributes = Object.keys(probabilities[category]).filter(
      (attr) => attr !== attribute && probabilities[category][attr] > 0
    );

    remainingAttributes.forEach((attr) => {
      probabilities[category][attr] = 1.0 / remainingAttributes.length;
    });
  }
};

const updateFromScan = (probabilities, information) => {
  const { category, correctCount } = information;

  // If we already have the correct attribute, nothing to update
  const hasConfirmed = Object.values(probabilities[category]).some(
    (prob) => prob === 1.0
  );
  if (hasConfirmed) {
    return;
  }

  // If correctCount is 0, set all probabilities to 0
  // This should not happen in the game logic, but handle it just in case
  if (correctCount === 0) {
    Object.keys(probabilities[category]).forEach((attr) => {
      probabilities[category][attr] = 0.0;
    });
    return;
  }

  // Otherwise, update based on existing probabilities
  // This is a simplified update, a more sophisticated approach would be Bayesian
  const potentialAttributes = Object.keys(probabilities[category]).filter(
    (attr) => probabilities[category][attr] > 0
  );

  potentialAttributes.forEach((attr) => {
    probabilities[category][attr] = 1.0 / potentialAttributes.length;
  });
};

const updateFromCrossReference = (probabilities, information) => {
  // This is a placeholder for a more sophisticated cross-reference inference
  // In a full implementation, this would update probabilities based on the relationship
  // between categories
  const { category1, category2 } = information;

  // For now, we'll just slightly increase uncertainty in these categories
  // to simulate that the AI has received some unclear information
  [category1, category2].forEach((category) => {
    const hasConfirmed = Object.values(probabilities[category]).some(
      (prob) => prob === 1.0
    );

    if (!hasConfirmed) {
      const potentialAttributes = Object.keys(probabilities[category]).filter(
        (attr) => probabilities[category][attr] > 0
      );

      // Slightly randomize probabilities to simulate uncertainty
      const totalProb = potentialAttributes.length;
      const probPerAttr = 1.0 / totalProb;

      potentialAttributes.forEach((attr) => {
        // Add some noise to probability
        const noise = (Math.random() - 0.5) * 0.1; // ±5% noise
        probabilities[category][attr] = Math.max(
          0,
          Math.min(1, probPerAttr + noise)
        );
      });

      // Normalize to ensure sum is 1
      const sum = potentialAttributes.reduce(
        (acc, attr) => acc + probabilities[category][attr],
        0
      );
      potentialAttributes.forEach((attr) => {
        probabilities[category][attr] /= sum;
      });
    }
  });
};
