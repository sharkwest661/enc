import { extendTheme } from "@chakra-ui/react";

// Theme based on the Visual Style Guide
// Encrypted Signatures - Neo-noir digital espionage theme

// Define all basic values first
const colors = {
  background: {
    dark: "#0a0a0a", // Nearly black base for all screens
    darker: "#0f0f0f", // Slightly lighter black for UI components
  },
  accent: {
    green: "#00ff66", // Primary accent for confirmed/active elements
    red: "#ff1a1a", // Secondary accent for eliminated/inactive elements
    darkGreen: "#003311", // Background for confirmed items
    darkRed: "#330000", // Background for eliminated items
  },
  neutral: {
    gray: "#444444", // Borders and subtle UI elements
    lightGray: "#777777", // Default text color
  },
};

const fonts = {
  body: "'Courier New', monospace",
  heading: "'Courier New', monospace",
  mono: "'Courier New', monospace",
};

// Define global styles
const styles = {
  global: {
    body: {
      bg: colors.background.dark,
      color: colors.neutral.lightGray,
      fontFamily: fonts.body,
      lineHeight: "tall",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: fonts.heading,
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: colors.neutral.lightGray,
    },
    a: {
      color: colors.accent.green,
      textDecoration: "none",
      _hover: {
        textDecoration: "underline",
      },
    },
    "*::selection": {
      backgroundColor: colors.accent.darkGreen,
      color: colors.accent.green,
    },
    // Adding keyframes and scan effect
    "@keyframes scan": {
      "0%": { left: "-50%" },
      "100%": { left: "100%" },
    },
    ".scan-effect": {
      position: "relative",
      overflow: "hidden",
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "50%",
        height: "100%",
        background: `linear-gradient(
          to right,
          transparent 0%,
          rgba(0, 255, 102, 0.15) 50%,
          transparent 100%
        )`,
        animation: "scan 5s linear infinite",
      },
    },
  },
};

// Component theme customizations
const components = {
  Button: {
    baseStyle: {
      fontFamily: fonts.body,
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderRadius: "5px",
    },
    variants: {
      primary: {
        bg: colors.accent.darkGreen,
        color: colors.accent.green,
        border: "1px solid",
        borderColor: colors.accent.green,
        _hover: {
          bg: colors.accent.darkGreen,
          opacity: 0.9,
        },
      },
      secondary: {
        bg: colors.background.darker,
        color: colors.neutral.lightGray,
        border: "1px solid",
        borderColor: colors.neutral.gray,
        _hover: {
          borderColor: colors.accent.green,
          color: colors.accent.green,
        },
      },
      danger: {
        bg: colors.accent.darkRed,
        color: colors.accent.red,
        border: "1px solid",
        borderColor: colors.accent.red,
        _hover: {
          opacity: 0.9,
        },
      },
    },
    defaultProps: {
      variant: "secondary",
    },
  },
  Container: {
    baseStyle: {
      bg: colors.background.darker,
      border: "1px solid",
      borderColor: colors.neutral.gray,
      borderRadius: "5px",
      padding: "15px",
    },
  },
  Text: {
    variants: {
      terminal: {
        fontFamily: fonts.mono,
        color: colors.accent.green,
      },
    },
  },
  Heading: {
    baseStyle: {
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
  },
};

// Export the theme
const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default theme;
