import { create } from "zustand";

// Helper function to generate a random agent profile
const generateAgentProfile = () => {
  const categories = {
    appearance: ["Blonde Hair", "Blue Eyes", "Tall", "Has Tattoo"],
    habits: ["Coffee Drinker", "Early Riser", "Chess Player", "Smokes Cigars"],
    contacts: ["Diplomat", "Journalist", "Academic", "Military"],
    locations: ["Paris", "Moscow", "Cairo", "Tokyo"],
  };

  const profile = {};

  // Select one random attribute from each category
  Object.keys(categories).forEach((category) => {
    const attributes = categories[category];
    const randomIndex = Math.floor(Math.random() * attributes.length);
    profile[category] = attributes[randomIndex];
  });

  return profile;
};

// Helper function to distribute initial knowledge
const distributeInitialKnowledge = (agentProfile) => {
  const playerKnown = [];
  const opponentKnown = [];

  // Get all categories
  const categories = Object.keys(agentProfile);

  // Randomly select only ONE category to give to the player
  const randomCategoryIndex = Math.floor(Math.random() * categories.length);
  const selectedCategory = categories[randomCategoryIndex];

  // Add the correct attribute for this category to player's known attributes
  playerKnown.push({
    category: selectedCategory,
    attribute: agentProfile[selectedCategory],
  });

  // For opponent, select a different category
  const opponentCategoryIndex = (randomCategoryIndex + 2) % categories.length; // Pick a different category
  const opponentCategory = categories[opponentCategoryIndex];

  // Add the correct attribute for the opponent's category
  opponentKnown.push({
    category: opponentCategory,
    attribute: agentProfile[opponentCategory],
  });

  return { playerKnown, opponentKnown };
};

// Initialize deduction grid with all possibilities
const initializeDeductionGrid = () => {
  const categories = {
    appearance: ["Blonde Hair", "Blue Eyes", "Tall", "Has Tattoo"],
    habits: ["Coffee Drinker", "Early Riser", "Chess Player", "Smokes Cigars"],
    contacts: ["Diplomat", "Journalist", "Academic", "Military"],
    locations: ["Paris", "Moscow", "Cairo", "Tokyo"],
  };

  const grid = {};

  Object.entries(categories).forEach(([category, attributes]) => {
    grid[category] = {};
    attributes.forEach((attribute) => {
      grid[category][attribute] = "unknown"; // 'unknown', 'confirmed', 'eliminated'
    });
  });

  return grid;
};

// Main game store
export const useGameStore = create((set, get) => ({
  // Game configuration
  gameMode: "vsAI", // 'vsAI', 'multiplayer'
  difficulty: "medium", // 'easy', 'medium', 'hard'

  // Update game configuration
  setGameConfig: (gameMode, difficulty) => {
    set({ gameMode, difficulty });
  },

  // Game state
  currentTurn: "player", // 'player', 'opponent'
  turnNumber: 1,
  playerActionPoints: 3,
  opponentActionPoints: 3,

  // Agent profile (the solution)
  agentProfile: null,

  // Player knowledge
  playerKnownAttributes: [],
  opponentKnownAttributes: [],

  // Deduction state
  playerDeductionGrid: {},
  aiDeductionGrid: {},

  // Counter-intelligence tokens
  playerBluffTokens: 2,
  opponentBluffTokens: 2,

  // Game log
  gameLog: [],

  // Animation state
  animationState: {
    type: null,
    target: null,
    result: null,
  },

  // Actions
  initializeGame: () => {
    // Generate random agent profile
    const agentProfile = generateAgentProfile();

    // Distribute initial knowledge
    const { playerKnown, opponentKnown } =
      distributeInitialKnowledge(agentProfile);

    // Reset deduction grids
    const playerGrid = initializeDeductionGrid();
    const aiGrid = initializeDeductionGrid();

    // Mark initial known attributes as confirmed in the grids
    playerKnown.forEach(({ category, attribute }) => {
      playerGrid[category][attribute] = "confirmed";
    });

    opponentKnown.forEach(({ category, attribute }) => {
      aiGrid[category][attribute] = "confirmed";
    });

    // Initialize game state
    set({
      agentProfile,
      playerKnownAttributes: playerKnown,
      opponentKnownAttributes: opponentKnown,
      playerDeductionGrid: playerGrid,
      aiDeductionGrid: aiGrid,
      currentTurn: "player",
      turnNumber: 1,
      playerActionPoints: 3,
      opponentActionPoints: 3,
      playerBluffTokens: 2,
      opponentBluffTokens: 2,
      gameLog: [
        {
          turn: 0,
          message: "Game initialized. Your mission: identify the double agent.",
        },
      ],
    });
  },

  performAction: (actionType, params) => {
    const state = get();

    // Check if it's the player's turn and they have enough action points
    if (state.currentTurn !== "player") {
      return { success: false, message: "Not your turn" };
    }

    // Define action costs
    const actionCosts = {
      verify: 1,
      scan: 2,
      crossReference: 3,
    };

    // Check if player has enough action points
    if (state.playerActionPoints < actionCosts[actionType]) {
      return { success: false, message: "Not enough action points" };
    }

    // Perform the action based on type
    let result = { success: false, message: "Invalid action" };

    switch (actionType) {
      case "verify":
        result = handleVerifyAction(params, state);
        break;
      case "scan":
        result = handleScanAction(params, state);
        break;
      case "crossReference":
        result = handleCrossReferenceAction(params, state);
        break;
    }

    // Update action points and animation state if successful
    if (result.success) {
      set({
        playerActionPoints: state.playerActionPoints - actionCosts[actionType],
        animationState: {
          type: actionType,
          target: params.target,
          result: result.data,
        },
        gameLog: [
          ...state.gameLog,
          {
            turn: state.turnNumber,
            player: "player",
            action: actionType,
            message: result.message,
          },
        ],
      });
    }

    return result;
  },

  endTurn: () => {
    set((state) => ({
      currentTurn: state.currentTurn === "player" ? "opponent" : "player",
      turnNumber:
        state.currentTurn === "opponent"
          ? state.turnNumber + 1
          : state.turnNumber,
      playerActionPoints:
        state.currentTurn === "opponent" ? 3 : state.playerActionPoints,
      opponentActionPoints:
        state.currentTurn === "player" ? 3 : state.opponentActionPoints,
      gameLog: [
        ...state.gameLog,
        {
          turn: state.turnNumber,
          message: `Turn ended. ${
            state.currentTurn === "player" ? "Opponent" : "Player"
          }'s turn begins.`,
        },
      ],
    }));

    // If it's now the opponent's turn, trigger AI action
    if (get().currentTurn === "opponent") {
      // We'll implement AI action in aiStore
    }
  },

  makeAccusation: (accusation) => {
    const state = get();

    // Verify accusation against solution
    let correct = true;
    let incorrectAttributes = [];

    Object.entries(accusation).forEach(([category, attribute]) => {
      if (state.agentProfile[category] !== attribute) {
        correct = false;
        incorrectAttributes.push({ category, attribute });
      }
    });

    // Determine win/loss
    const gameResult = correct ? "win" : "loss";

    set({
      gameResult,
      gameLog: [
        ...state.gameLog,
        {
          turn: state.turnNumber,
          player: "player",
          action: "accusation",
          message: correct
            ? "Correct accusation! You've identified the double agent."
            : `Incorrect accusation. The real double agent ${incorrectAttributes
                .map(
                  (item) =>
                    `${item.category}: ${state.agentProfile[item.category]}`
                )
                .join(", ")}`,
        },
      ],
    });

    return {
      success: true,
      gameResult,
      message:
        gameResult === "win"
          ? "You've successfully identified the double agent!"
          : "Your accusation was incorrect. Mission failed.",
    };
  },

  updatePlayerGrid: (category, attribute, status) => {
    set((state) => {
      const updatedGrid = { ...state.playerDeductionGrid };

      // Only one attribute can be confirmed per category
      if (status === "confirmed") {
        Object.keys(updatedGrid[category]).forEach((attr) => {
          if (attr !== attribute) {
            updatedGrid[category][attr] = "eliminated";
          }
        });
      }

      updatedGrid[category][attribute] = status;

      return {
        playerDeductionGrid: updatedGrid,
        gameLog: [
          ...state.gameLog,
          {
            turn: state.turnNumber,
            player: "player",
            action: "updateGrid",
            message: `Marked ${attribute} as ${status} in category ${category}.`,
          },
        ],
      };
    });
  },

  clearAnimationState: () => {
    set({ animationState: { type: null, target: null, result: null } });
  },
}));

// Helper functions for actions
const handleVerifyAction = (params, state) => {
  const { category, attribute } = params;

  // Check if the attribute is part of the agent's profile
  const isCorrect = state.agentProfile[category] === attribute;

  // Update player's deduction grid
  const updatedGrid = { ...state.playerDeductionGrid };
  updatedGrid[category][attribute] = isCorrect ? "confirmed" : "eliminated";

  // If attribute is confirmed, eliminate all others in the category
  if (isCorrect) {
    Object.keys(updatedGrid[category]).forEach((attr) => {
      if (attr !== attribute) {
        updatedGrid[category][attr] = "eliminated";
      }
    });
  }

  return {
    success: true,
    message: isCorrect
      ? `Verified: ${attribute} is part of the agent's profile.`
      : `Verified: ${attribute} is not part of the agent's profile.`,
    data: {
      isCorrect,
      category,
      attribute,
    },
  };
};

const handleScanAction = (params, state) => {
  const { category } = params;

  // Count how many attributes the player has correct in this category
  let correctCount = 0;
  const categoryGrid = state.playerDeductionGrid[category];

  Object.entries(categoryGrid).forEach(([attribute, status]) => {
    if (status === "confirmed" && state.agentProfile[category] === attribute) {
      correctCount++;
    }
  });

  return {
    success: true,
    message: `Scan results: ${correctCount}/1 correct attributes identified in ${category}.`,
    data: {
      category,
      correctCount,
    },
  };
};

const handleCrossReferenceAction = (params, state) => {
  const { category1, category2 } = params;

  // This is a simplified implementation
  // In a full game, this would provide more nuanced relationships
  const attr1 = state.agentProfile[category1];
  const attr2 = state.agentProfile[category2];

  return {
    success: true,
    message: `Cross-reference complete: Found relationship between ${category1} and ${category2}.`,
    data: {
      category1,
      category2,
      // Here we could return some clue about the relationship
      hint: `There is a connection between ${attr1} and ${attr2}.`,
    },
  };
};
