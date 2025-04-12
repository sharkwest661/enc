import { create } from "zustand";

// Utility function to shuffle an array
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper function to generate a random agent profile with pattern intelligence
const generateAgentProfile = (difficulty = "medium") => {
  const categories = {
    appearance: ["Blonde Hair", "Blue Eyes", "Tall", "Has Tattoo"],
    habits: ["Coffee Drinker", "Early Riser", "Chess Player", "Smokes Cigars"],
    contacts: ["Diplomat", "Journalist", "Academic", "Military"],
    locations: ["Paris", "Moscow", "Cairo", "Tokyo"],
  };

  // Attribute relationships and patterns based on difficulty
  const patterns = {
    easy: {},
    medium: {
      Moscow: ["Military", "Chess Player"], // Moscow agents often have military contacts and play chess
      Paris: ["Diplomat", "Coffee Drinker"], // Paris agents often have diplomat contacts and drink coffee
      Cairo: ["Journalist", "Has Tattoo"], // Cairo agents often have journalist contacts and tattoos
      Tokyo: ["Academic", "Early Riser"], // Tokyo agents often have academic contacts and are early risers
    },
    hard: {
      Moscow: ["Military", "Chess Player", "Tall"],
      Paris: ["Diplomat", "Coffee Drinker", "Blue Eyes"],
      Cairo: ["Journalist", "Has Tattoo", "Blonde Hair"],
      Tokyo: ["Academic", "Early Riser", "Smokes Cigars"],
    },
    masterSpy: {
      // Special patterns with highly interdependent attributes
      Moscow: ["Military", "Chess Player", "Tall", "Smokes Cigars"],
      Paris: ["Diplomat", "Coffee Drinker", "Blue Eyes", "Has Tattoo"],
      Cairo: ["Journalist", "Has Tattoo", "Blonde Hair", "Early Riser"],
      Tokyo: ["Academic", "Early Riser", "Smokes Cigars", "Tall"],
    },
  };

  const profile = {};

  // First select a location to establish patterns
  const locations = categories.locations;
  const locationIndex = Math.floor(Math.random() * locations.length);
  const location = locations[locationIndex];
  profile.locations = location;

  // Then select other attributes, potentially following patterns
  Object.keys(categories).forEach((category) => {
    if (category !== "locations") {
      const attributes = categories[category];

      // Check if there's a pattern to follow based on difficulty
      if (
        difficulty !== "easy" &&
        patterns[difficulty][location] &&
        patterns[difficulty][location].some((attr) => attributes.includes(attr))
      ) {
        // Follow the pattern sometimes (more often on higher difficulties)
        const patternProbability = {
          medium: 0.6,
          hard: 0.8,
          masterSpy: 0.9,
        };

        const followPattern = Math.random() < patternProbability[difficulty];

        if (followPattern) {
          // Find matching attributes in pattern
          const patternAttributes = patterns[difficulty][location].filter(
            (attr) => attributes.includes(attr)
          );
          if (patternAttributes.length > 0) {
            // Select one of the matching attributes
            profile[category] =
              patternAttributes[
                Math.floor(Math.random() * patternAttributes.length)
              ];
            return;
          }
        }
      }

      // If no pattern or not following pattern, select randomly
      const randomIndex = Math.floor(Math.random() * attributes.length);
      profile[category] = attributes[randomIndex];
    }
  });

  return profile;
};

// Function to get related attributes based on patterns
const getRelatedAttributes = (category, profile) => {
  // This function would use the same patterns as generateAgentProfile
  // to provide hints about relationships between attributes

  const relatedInfo = [];

  if (category === "locations") {
    const location = profile[category];
    if (location === "Moscow") {
      relatedInfo.push(
        "Agents operating in Moscow often have military contacts."
      );
      relatedInfo.push("Moscow agents are frequently chess players.");
    } else if (location === "Paris") {
      relatedInfo.push(
        "Paris-based agents typically maintain diplomatic connections."
      );
      relatedInfo.push("Agents in Paris are known to frequent coffee shops.");
    } else if (location === "Cairo") {
      relatedInfo.push(
        "Cairo operatives often work with journalists as covers."
      );
      relatedInfo.push(
        "Many Cairo agents have distinguishing marks like tattoos."
      );
    } else if (location === "Tokyo") {
      relatedInfo.push(
        "Tokyo-based operatives frequently have academic covers."
      );
      relatedInfo.push("Agents in Tokyo often maintain early schedules.");
    }
  } else if (category === "contacts") {
    const contact = profile[category];
    if (contact === "Military") {
      relatedInfo.push(
        "Agents with military contacts often operate in Moscow."
      );
      relatedInfo.push(
        "Military contacts frequently involve chess as a meeting activity."
      );
    } else if (contact === "Diplomat") {
      relatedInfo.push(
        "Diplomatic contacts are commonly established in Paris."
      );
      relatedInfo.push(
        "Agents with diplomatic connections often meet in coffee shops."
      );
    } else if (contact === "Journalist") {
      relatedInfo.push("Journalist contacts are frequently utilized in Cairo.");
      relatedInfo.push(
        "Agents working with journalists often have distinguishing marks."
      );
    } else if (contact === "Academic") {
      relatedInfo.push("Academic contacts are most common in Tokyo.");
      relatedInfo.push(
        "Agents with academic connections typically keep early hours."
      );
    }
  }

  // Return 1-2 related pieces of information
  return shuffleArray(relatedInfo).slice(0, Math.min(2, relatedInfo.length));
};

// Helper function to distribute initial knowledge
const distributeInitialKnowledge = (agentProfile, difficulty = "medium") => {
  const playerKnown = [];
  const opponentKnown = [];

  // Get all categories
  const categories = Object.keys(agentProfile);

  // Shuffle categories
  const shuffledCategories = shuffleArray([...categories]);

  // Determine number of known attributes based on difficulty
  const numKnown = {
    easy: 3, // More starting info for easy mode
    medium: 2, // Standard amount of starting info
    hard: 1, // Less starting info for hard mode
    masterSpy: 1, // Minimal starting info for master spy
  };

  // Add the correct attributes for player's known categories
  const playerCategories = shuffledCategories.slice(0, numKnown[difficulty]);
  playerCategories.forEach((category) => {
    playerKnown.push({
      category,
      attribute: agentProfile[category],
      confidence: 100,
    });
  });

  // Add partial knowledge (uncertainty) for one additional category
  if (difficulty !== "masterSpy") {
    const remainingCategories = shuffledCategories.filter(
      (cat) => !playerCategories.includes(cat)
    );
    if (remainingCategories.length > 0) {
      const partialCategory = remainingCategories[0];
      const allAttributes = getAttributesForCategory(partialCategory);

      // Create a hint with 2-3 possible attributes including the correct one
      const correctAttribute = agentProfile[partialCategory];
      let possibleAttributes = [correctAttribute];

      // Add 1-2 incorrect attributes
      const incorrectAttributes = allAttributes.filter(
        (attr) => attr !== correctAttribute
      );
      const numAdditional = Math.floor(Math.random() * 2) + 1; // 1-2 additional

      shuffleArray(incorrectAttributes)
        .slice(0, numAdditional)
        .forEach((attr) => possibleAttributes.push(attr));

      // Shuffle the possible attributes
      possibleAttributes = shuffleArray(possibleAttributes);

      playerKnown.push({
        category: partialCategory,
        hint: `The agent may be associated with: ${possibleAttributes.join(
          ", "
        )}`,
        possibleAttributes,
        isPartialInfo: true,
      });
    }
  }

  // For opponent, select different categories
  const remainingCategories = shuffledCategories.filter(
    (cat) => !playerCategories.includes(cat)
  );

  const opponentCategories = remainingCategories.slice(
    0,
    Math.min(numKnown[difficulty], remainingCategories.length)
  );

  opponentCategories.forEach((category) => {
    opponentKnown.push({
      category,
      attribute: agentProfile[category],
      confidence: 100,
    });
  });

  return { playerKnown, opponentKnown };
};

// Helper to get all attributes for a category
const getAttributesForCategory = (category) => {
  const attributesByCategory = {
    appearance: ["Blonde Hair", "Blue Eyes", "Tall", "Has Tattoo"],
    habits: ["Coffee Drinker", "Early Riser", "Chess Player", "Smokes Cigars"],
    contacts: ["Diplomat", "Journalist", "Academic", "Military"],
    locations: ["Paris", "Moscow", "Cairo", "Tokyo"],
  };

  return attributesByCategory[category] || [];
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
      grid[category][attribute] = "unknown"; // 'unknown', 'confirmed', 'likely', 'uncertain', 'eliminated'
    });
  });

  return grid;
};

// Generate a detailed insight based on agent patterns
const getDetailedInsight = (category, state) => {
  const agentProfile = state.agentProfile;
  const relatedInfoList = getRelatedAttributes(category, agentProfile);

  if (relatedInfoList.length === 0) {
    return "No significant patterns detected.";
  }

  return relatedInfoList.join(" ");
};

// Main game store
export const useGameStore = create((set, get) => ({
  // Game configuration
  gameMode: "vsAI", // 'vsAI', 'multiplayer'
  difficulty: "medium", // 'easy', 'medium', 'hard', 'masterSpy'
  specialization: "none", // 'none', 'fieldAgent', 'profiler', 'networkAnalyst'

  // Update game configuration
  setGameConfig: (gameMode, difficulty, specialization = "none") => {
    set({ gameMode, difficulty, specialization });
  },

  // Game state
  currentTurn: "player", // 'player', 'opponent'
  turnNumber: 1,
  playerActionPoints: 3,
  opponentActionPoints: 3,
  maxTurns: 15, // Agent escapes after 15 turns
  criticalIntelTurn: 6, // Special intel appears on turn 6

  // Time pressure and events
  timeRemaining: 15, // Turns until agent escapes
  criticalEvents: [], // Special events that occur during gameplay

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

  // Targeted bluffing
  playerBluffTarget: null, // Category targeted for bluffing
  opponentBluffTarget: null,

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
    // Get current game configuration
    const difficulty = get().difficulty;
    const specialization = get().specialization;

    // Generate random agent profile based on difficulty
    const agentProfile = generateAgentProfile(difficulty);

    // Distribute initial knowledge based on difficulty
    const { playerKnown, opponentKnown } = distributeInitialKnowledge(
      agentProfile,
      difficulty
    );

    // Reset deduction grids
    const playerGrid = initializeDeductionGrid();
    const aiGrid = initializeDeductionGrid();

    // Mark initial known attributes as confirmed in the grids
    playerKnown.forEach(
      ({ category, attribute, isPartialInfo, possibleAttributes }) => {
        if (!isPartialInfo) {
          playerGrid[category][attribute] = "confirmed";

          // Eliminate other attributes in this category
          Object.keys(playerGrid[category]).forEach((attr) => {
            if (attr !== attribute) {
              playerGrid[category][attr] = "eliminated";
            }
          });
        } else if (possibleAttributes) {
          // For partial info, mark possible attributes as uncertain
          possibleAttributes.forEach((attr) => {
            playerGrid[category][attr] = "uncertain";
          });
        }
      }
    );

    opponentKnown.forEach(({ category, attribute }) => {
      aiGrid[category][attribute] = "confirmed";

      // Eliminate other attributes in this category for the AI
      Object.keys(aiGrid[category]).forEach((attr) => {
        if (attr !== attribute) {
          aiGrid[category][attr] = "eliminated";
        }
      });
    });

    // Adjust max turns based on difficulty
    const difficultyTurns = {
      easy: 18,
      medium: 15,
      hard: 12,
      masterSpy: 10,
    };

    // Determine when critical intel appears
    const criticalTurn = Math.floor(difficultyTurns[difficulty] / 2.5);

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
      playerBluffTarget: null,
      opponentBluffTarget: null,
      maxTurns: difficultyTurns[difficulty],
      timeRemaining: difficultyTurns[difficulty],
      criticalIntelTurn: criticalTurn,
      criticalEvents: [],
      gameLog: [
        {
          turn: 0,
          message: `Game initialized. Your mission: identify the double agent before they escape in ${difficultyTurns[difficulty]} turns.`,
        },
        {
          turn: 0,
          message: playerKnown.some((item) => item.isPartialInfo)
            ? "Initial intelligence includes some uncertain information. Verify before making accusations."
            : "Initial intelligence has been verified. Use it to guide your investigation.",
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
      deepInvestigation: 3, // New action type
    };

    // Check if player has enough action points
    if (state.playerActionPoints < actionCosts[actionType]) {
      return { success: false, message: "Not enough action points" };
    }

    // Apply specialization bonuses if applicable
    const specialization = state.specialization;
    const specializationBonus = getSpecializationBonus(
      actionType,
      params,
      specialization
    );

    // Perform the action based on type
    let result = { success: false, message: "Invalid action" };

    switch (actionType) {
      case "verify":
        result = handleVerifyAction(params, state, specializationBonus);
        break;
      case "scan":
        result = handleScanAction(params, state, specializationBonus);
        break;
      case "crossReference":
        result = handleCrossReferenceAction(params, state, specializationBonus);
        break;
      case "deepInvestigation":
        result = handleDeepInvestigationAction(
          params,
          state,
          specializationBonus
        );
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
            ...(result.data?.detailedInsights
              ? { detailedInsights: true }
              : {}),
          },
        ],
      });
    }

    return result;
  },

  endTurn: () => {
    set((state) => {
      const newTurn =
        state.currentTurn === "opponent"
          ? state.turnNumber + 1
          : state.turnNumber;
      const newTimeRemaining = state.maxTurns - newTurn + 1;

      // Check for critical intel
      let gameLog = [...state.gameLog];
      let criticalEvents = [...state.criticalEvents];

      if (newTurn === state.criticalIntelTurn) {
        // Generate critical intel about a randomly selected attribute
        const categories = Object.keys(state.agentProfile);
        const critCategory =
          categories[Math.floor(Math.random() * categories.length)];
        const critAttribute = state.agentProfile[critCategory];

        // Create critical intel event
        const critEvent = {
          type: "criticalIntel",
          turn: newTurn,
          category: critCategory,
          message: `CRITICAL INTEL: New information about the agent's ${critCategory} has been discovered!`,
        };

        criticalEvents.push(critEvent);

        gameLog.push({
          turn: newTurn,
          message: critEvent.message,
          criticalInfo: true,
        });

        // Give player a hint in the form of a partial confirmation
        const allAttributes = getAttributesForCategory(critCategory);
        const otherAttributes = allAttributes.filter(
          (attr) => attr !== critAttribute
        );
        const eliminatedAttribute =
          otherAttributes[Math.floor(Math.random() * otherAttributes.length)];

        gameLog.push({
          turn: newTurn,
          message: `Intelligence reports confirm the agent does NOT have attribute: ${eliminatedAttribute}`,
          criticalInfo: true,
        });
      }

      // Check for time pressure warnings
      if (newTimeRemaining <= 3 && newTimeRemaining > 0) {
        gameLog.push({
          turn: newTurn,
          message: `WARNING: The double agent may escape in ${newTimeRemaining} turn${
            newTimeRemaining > 1 ? "s" : ""
          }!`,
          urgency: true,
        });
      }

      // Check for game over due to agent escape
      if (newTimeRemaining <= 0) {
        return {
          ...state,
          gameResult: "escape",
          timeRemaining: 0,
          gameLog: [
            ...gameLog,
            {
              turn: newTurn,
              message: "The double agent has escaped. Mission failed.",
              urgency: true,
            },
          ],
        };
      }

      return {
        ...state,
        currentTurn: state.currentTurn === "player" ? "opponent" : "player",
        turnNumber: newTurn,
        timeRemaining: newTimeRemaining,
        playerActionPoints:
          state.currentTurn === "opponent" ? 3 : state.playerActionPoints,
        opponentActionPoints:
          state.currentTurn === "player" ? 3 : state.opponentActionPoints,
        criticalEvents,
        gameLog: gameLog,
        // Reset player's bluff target if turn is changing from opponent to player
        playerBluffTarget:
          state.currentTurn === "opponent" ? null : state.playerBluffTarget,
      };
    });

    // If it's now the opponent's turn, trigger AI action
    if (get().currentTurn === "opponent" && get().gameMode === "vsAI") {
      // This will be handled by the AI store
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
        incorrectAttributes.push({
          category,
          attribute,
          correctAttribute: state.agentProfile[category],
        });
      }
    });

    // Calculate how close the accusation was (for partial successes)
    const totalCategories = Object.keys(accusation).length;
    const correctCategories = totalCategories - incorrectAttributes.length;
    const accuracy = correctCategories / totalCategories;

    // Determine result type
    let gameResult = "loss";
    let resultMessage =
      "Your accusation was completely incorrect. Mission failed.";

    if (correct) {
      gameResult = "win";
      resultMessage =
        "Correct accusation! You've successfully identified the double agent.";
    } else if (accuracy >= 0.75) {
      gameResult = "partial";
      resultMessage =
        "Your accusation was very close! The operation is considered a qualified success.";
    } else if (accuracy >= 0.5) {
      gameResult = "close";
      resultMessage =
        "Your accusation was partially correct, but not enough to apprehend the agent.";
    }

    set({
      gameResult,
      gameLog: [
        ...state.gameLog,
        {
          turn: state.turnNumber,
          player: "player",
          action: "accusation",
          message: `You made an accusation with ${Math.round(
            accuracy * 100
          )}% accuracy.`,
        },
        {
          turn: state.turnNumber,
          player: "player",
          action: "result",
          message: resultMessage,
        },
        ...(incorrectAttributes.length > 0
          ? [
              {
                turn: state.turnNumber,
                player: "system",
                action: "details",
                message: `The agent's actual profile: ${incorrectAttributes
                  .map((item) => `${item.category}: ${item.correctAttribute}`)
                  .join(", ")}`,
              },
            ]
          : []),
      ],
    });

    return {
      success: true,
      gameResult,
      accuracy,
      message: resultMessage,
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

  useBluffToken: () => {
    const state = get();

    // Check if player has bluff tokens and it's opponent's turn
    if (state.playerBluffTokens <= 0) {
      return { success: false, message: "No bluff tokens remaining" };
    }

    if (state.currentTurn !== "opponent") {
      return {
        success: false,
        message: "Can only use bluff tokens during opponent's turn",
      };
    }

    // Use a bluff token
    set({
      playerBluffTokens: state.playerBluffTokens - 1,
      playerIsBluffing: true,
      gameLog: [
        ...state.gameLog,
        {
          turn: state.turnNumber,
          player: "player",
          action: "bluff",
          message: "You used a counter-intelligence token to bluff.",
        },
      ],
    });

    return { success: true, message: "Bluff token activated" };
  },

  useTargetedBluff: (category) => {
    const state = get();

    // Check if player has bluff tokens and it's opponent's turn
    if (state.playerBluffTokens <= 0) {
      return { success: false, message: "No bluff tokens remaining" };
    }

    if (state.currentTurn !== "opponent") {
      return {
        success: false,
        message: "Can only use bluff tokens during opponent's turn",
      };
    }

    // Use a bluff token and set the target category
    set({
      playerBluffTokens: state.playerBluffTokens - 1,
      playerIsBluffing: true,
      playerBluffTarget: category,
      gameLog: [
        ...state.gameLog,
        {
          turn: state.turnNumber,
          player: "player",
          action: "targetedBluff",
          message: `You deployed counter-intelligence targeting the agent's ${category}.`,
        },
      ],
    });

    return {
      success: true,
      message: "Targeted counter-intelligence activated",
    };
  },

  clearAnimationState: () => {
    set({ animationState: { type: null, target: null, result: null } });
  },
}));

// Apply specialization bonuses to actions
const getSpecializationBonus = (actionType, params, specialization) => {
  if (!specialization || specialization === "none") {
    return {};
  }

  let bonus = {};

  // Field Agent - Better at location information
  if (specialization === "fieldAgent" && params.category === "locations") {
    bonus = {
      confidenceBoost: actionType === "verify" ? 20 : 0, // +20% confidence
      extraInformation: actionType === "scan" ? true : false, // More detailed scan results
      actionDiscount: 0, // No AP discount for now
    };
  }

  // Profiler - Better at appearance and habits
  else if (
    specialization === "profiler" &&
    (params.category === "appearance" || params.category === "habits")
  ) {
    bonus = {
      confidenceBoost: actionType === "verify" ? 25 : 0, // +25% confidence
      extraInformation: actionType === "scan" ? true : false,
      actionDiscount: 0,
    };
  }

  // Network Analyst - Better at contacts
  else if (
    specialization === "networkAnalyst" &&
    params.category === "contacts"
  ) {
    bonus = {
      confidenceBoost: actionType === "verify" ? 15 : 0, // +15% confidence
      extraInformation: actionType === "scan" ? true : false,
      actionDiscount: actionType === "crossReference" ? 1 : 0, // Cross-reference costs 1 less AP
    };
  }

  return bonus;
};

// Helper functions for actions
const handleVerifyAction = (params, state, specializationBonus = {}) => {
  const { category, attribute } = params;

  // Check if the attribute is part of the agent's profile
  const isCorrect = state.agentProfile[category] === attribute;

  // Calculate confidence level based on correctness and specialization bonuses
  let confidenceLevel;
  if (isCorrect) {
    // 70-100% for correct attributes
    confidenceLevel = Math.floor(Math.random() * 30) + 70;

    // Apply specialization bonus if applicable
    confidenceLevel += specializationBonus.confidenceBoost || 0;

    // Cap at 100%
    confidenceLevel = Math.min(confidenceLevel, 100);
  } else {
    // 0-30% for incorrect attributes
    confidenceLevel = Math.floor(Math.random() * 30);
  }

  // Create intelligence report based on confidence
  let message, status;

  if (confidenceLevel >= 90) {
    message = `High confidence (${confidenceLevel}%): ${attribute} is definitely part of the agent's profile.`;
    status = "confirmed";
  } else if (confidenceLevel >= 70) {
    message = `Medium confidence (${confidenceLevel}%): ${attribute} is likely part of the agent's profile.`;
    status = "likely";
  } else if (confidenceLevel > 30) {
    message = `Low confidence (${confidenceLevel}%): Evidence about ${attribute} is inconclusive.`;
    status = "uncertain";
  } else {
    message = `High confidence (${
      100 - confidenceLevel
    }%): ${attribute} is not part of the agent's profile.`;
    status = "eliminated";
  }

  // Add specialization bonus text if applicable
  if (specializationBonus.confidenceBoost) {
    message += ` Your specialization provided additional insight.`;
  }

  // Update player's deduction grid
  const updatedGrid = { ...state.playerDeductionGrid };
  updatedGrid[category][attribute] = status;

  // If attribute is confirmed with high confidence, eliminate all others in the category
  if (status === "confirmed") {
    Object.keys(updatedGrid[category]).forEach((attr) => {
      if (attr !== attribute) {
        updatedGrid[category][attr] = "eliminated";
      }
    });
  }

  return {
    success: true,
    message: message,
    data: {
      isCorrect,
      confidence: confidenceLevel,
      status,
      category,
      attribute,
      hasSpecializationBonus: !!specializationBonus.confidenceBoost,
    },
  };
};

const handleScanAction = (params, state, specializationBonus = {}) => {
  const { category } = params;

  // Count how many attributes the player has correctly identified in this category
  let correctCount = 0;
  const categoryGrid = state.playerDeductionGrid[category];

  Object.entries(categoryGrid).forEach(([attribute, status]) => {
    if (
      (status === "confirmed" || status === "likely") &&
      state.agentProfile[category] === attribute
    ) {
      correctCount++;
    }
  });

  // For specialization bonus, provide additional context
  let additionalInfo = "";
  if (specializationBonus.extraInformation) {
    // Get related attributes based on the category
    const relatedInfo = getRelatedAttributes(
      category,
      state.agentProfile
    ).slice(0, 1);
    if (relatedInfo.length > 0) {
      additionalInfo = ` Your specialization revealed additional context: ${relatedInfo[0]}`;
    }
  }

  return {
    success: true,
    message: `Scan results: ${correctCount}/1 correct attributes identified in ${category}.${additionalInfo}`,
    data: {
      category,
      correctCount,
      additionalInfo: additionalInfo !== "",
      hasSpecializationBonus: !!specializationBonus.extraInformation,
    },
  };
};

const handleCrossReferenceAction = (
  params,
  state,
  specializationBonus = {}
) => {
  const { category1, category2 } = params;

  // Get the actual attributes from agent profile
  const attr1 = state.agentProfile[category1];
  const attr2 = state.agentProfile[category2];

  // Generate relationship insights based on the attributes
  let relationshipInsight = "";

  // Check for specific relationships in our pattern knowledge
  // Moscow -> Military/Chess Player
  if (
    (attr1 === "Moscow" &&
      (attr2 === "Military" || attr2 === "Chess Player")) ||
    (attr2 === "Moscow" && (attr1 === "Military" || attr1 === "Chess Player"))
  ) {
    relationshipInsight =
      "There appears to be a strong connection between these attributes.";
  }
  // Paris -> Diplomat/Coffee Drinker
  else if (
    (attr1 === "Paris" &&
      (attr2 === "Diplomat" || attr2 === "Coffee Drinker")) ||
    (attr2 === "Paris" && (attr1 === "Diplomat" || attr1 === "Coffee Drinker"))
  ) {
    relationshipInsight =
      "Analysis confirms a significant correlation between these attributes.";
  }
  // Cairo -> Journalist/Has Tattoo
  else if (
    (attr1 === "Cairo" && (attr2 === "Journalist" || attr2 === "Has Tattoo")) ||
    (attr2 === "Cairo" && (attr1 === "Journalist" || attr1 === "Has Tattoo"))
  ) {
    relationshipInsight =
      "Intelligence reports indicate a pattern connecting these attributes.";
  }
  // Tokyo -> Academic/Early Riser
  else if (
    (attr1 === "Tokyo" && (attr2 === "Academic" || attr2 === "Early Riser")) ||
    (attr2 === "Tokyo" && (attr1 === "Academic" || attr1 === "Early Riser"))
  ) {
    relationshipInsight =
      "Analysis shows these attributes frequently appear together in profiles.";
  } else {
    // No strong relationship found
    relationshipInsight =
      "No significant correlation detected between these attributes.";
  }

  // Add specialization bonus if applicable
  if (specializationBonus.extraInformation) {
    relationshipInsight +=
      " Your specialization provided deeper insight into this connection.";
  }

  return {
    success: true,
    message: `Cross-reference complete: ${relationshipInsight}`,
    data: {
      category1,
      category2,
      relationshipStrength: relationshipInsight.includes("No significant")
        ? "weak"
        : "strong",
      hasSpecializationBonus: !!specializationBonus.extraInformation,
    },
  };
};

const handleDeepInvestigationAction = (
  params,
  state,
  specializationBonus = {}
) => {
  const { category } = params;

  // Deep investigation has a chance of failure
  // Higher success rate with specialization
  const baseSuccessRate = 0.75; // 75% base success rate
  const specialistBonus = specializationBonus.extraInformation ? 0.15 : 0;
  const successRate = Math.min(0.95, baseSuccessRate + specialistBonus);

  const success = Math.random() < successRate;

  if (success) {
    // Get detailed insights about the category
    const detailedInsights = getDetailedInsight(category, state);

    // Get even more specific information for specialists
    let specialistInsight = "";
    if (specializationBonus.extraInformation) {
      // For specialists, sometimes reveal the exact attribute
      if (Math.random() < 0.3) {
        const correctAttribute = state.agentProfile[category];
        specialistInsight = ` Your expertise suggests the agent's ${category} involves ${correctAttribute}.`;
      }
    }

    return {
      success: true,
      message: `Deep investigation successful. ${detailedInsights}${specialistInsight}`,
      data: {
        category,
        detailedInsights: true,
        specialistInsight: specialistInsight !== "",
        hasSpecializationBonus: !!specializationBonus.extraInformation,
      },
    };
  } else {
    return {
      success: true, // Still succeeds as an action, but with no useful information
      message:
        "Your deep investigation yielded inconclusive results. All action points spent.",
      data: {
        category,
        detailedInsights: false,
        investigationFailed: true,
      },
    };
  }
};
