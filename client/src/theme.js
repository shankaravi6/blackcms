import { createTheme } from "@mui/material/styles";

const colorTokens = {
  drops: {
    110: "#f2f2f2",
    120: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colorTokens.drops[500],
    },
    secondary: {
      main: colorTokens.drops[100],
    },
    neutral: colorTokens.drops,
    error: {
      main: "#FF4C4C",
    },
    warning: {
      main: "#FFA500",
    },
    info: {
      main: "#3B82F6",
    },
    success: {
      main: "#22C55E",
    },
    background: {
      default: colorTokens.drops[900],
      paper: colorTokens.drops[800],
    },
    text: {
      primary: colorTokens.drops[100],
      secondary: colorTokens.drops[400],
    },
  },
  typography: {
    fontFamily: ["Satoshi", "sans-serif"].join(","),
    fontSize: 12,
    h1: {
      fontFamily: ["Satoshi", "sans-serif"].join(","),
      fontSize: 48,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    h2: {
      fontFamily: ["Satoshi", "sans-serif"].join(","),
      fontSize: 36,
      fontWeight: "semibold",
      color: "#FFFFFF",
    },
    h3: {
      fontFamily: ["Satoshi", "sans-serif"].join(","),
      fontSize: 24,
      fontWeight: "medium",
      color: "#FFFFFF",
    },
    h4: {
      fontFamily: ["Satoshi", "sans-serif"].join(","),
      fontSize: 18,
      fontWeight: "medium",
      color: colorTokens.drops[300],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          border: `1px solid ${colorTokens.drops[100]}`,
          color: colorTokens.drops[800],
          backgroundColor: colorTokens.drops[110],
          textTransform: "none",
          padding: "auto",
          "&:hover": {
            backgroundColor: colorTokens.drops[300],
            border: `1px solid ${colorTokens.drops[300]}`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colorTokens.drops[800],
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
          padding: "16px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: colorTokens.drops[950],
          borderRadius: "4px",
          border: `1px solid ${colorTokens.drops[700]}`,
          color: colorTokens.drops[200],
          padding: "auto",
          transition: "border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            borderColor: colorTokens.drops[600],
          },
          "&.Mui-focused": {
            borderColor: colorTokens.drops[500],
          },
          "&.Mui-disabled": {
            backgroundColor: colorTokens.drops[900],
            borderColor: colorTokens.drops[700],
            color: colorTokens.drops[600],
          },
        },
        input: {
          "&::placeholder": {
            color: colorTokens.drops[400],
            opacity: 1,
          },
          "&:focus::placeholder": {
            color: colorTokens.drops[500],
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colorTokens.drops[500], // Setting the label color to #f2f2f2
          "&.Mui-focused": {
            color: colorTokens.drops[110], // Ensure focused state retains the same color
          },
          "&.Mui-disabled": {
            color: colorTokens.drops[400], // Optionally, adjust for disabled state
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: colorTokens.drops[700],
          borderRadius: "4px",
          border: `1px solid ${colorTokens.drops[600]}`,
          color: colorTokens.drops[100],
          padding: "8px 12px",
        },
      },
    },
  },
});
