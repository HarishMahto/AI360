// AI360 Dashboard – Studio Ghibli Art / Anime Inspired Theme
import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  accent:      '#2C7A7B', // Serene Ghibli Teal
  accentHover: '#234E52', // Deep Forest Teal
  accentSoft:  'rgba(44, 122, 123, 0.08)',
  teal:        '#319795', // Meadow Stream Teal
  violet:      '#6B46C1', // Sky Sunset Violet
  amber:       '#D69E2E', // Calcifer Gold
  success:     '#38A169', // Totoro Meadow Green
  warning:     '#DD6B20', // Terracotta Sun
  danger:      '#E53E3E', // Crimson Blossom
  text1:       '#1A2F29', // Deep Forest Charcoal
  text2:       '#4A655D', // Sage Slate
  text3:       '#839D95', // Soft Mist Sage
  bg:          '#F0F5F3', // Ghibli Mist Meadow Haze Background
  surface:     '#FFFFFF', // Crisp White Workspace Paper
  surface2:    '#E8F0EC', // Soft Sage Grey
  surface3:    '#DCE7E1', // Medium Sage Mist
  border:      'rgba(43, 108, 93, 0.12)',
  borderStrong:'rgba(43, 108, 93, 0.24)',
};

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: palette.accent, light: palette.teal, dark: palette.accentHover, contrastText: '#fff' },
    secondary:  { main: palette.text2, light: palette.text3, dark: palette.text1, contrastText: '#fff' },
    success:    { main: palette.success },
    warning:    { main: palette.warning },
    error:      { main: palette.danger },
    background: { default: palette.bg, paper: palette.surface },
    text:       { primary: palette.text1, secondary: palette.text2, disabled: palette.text3 },
    divider:    palette.border,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    700,
    h1: { fontSize: '2rem',   fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 },
    h2: { fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h3: { fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h4: { fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h5: { fontSize: '0.95rem',fontWeight: 600, letterSpacing: '-0.005em' },
    h6: { fontSize: '0.875rem',fontWeight: 600 },
    subtitle1: { fontSize: '0.875rem', fontWeight: 500, color: palette.text2 },
    subtitle2: { fontSize: '0.8rem',   fontWeight: 500, color: palette.text2 },
    body1: { fontSize: '0.875rem', lineHeight: 1.55 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5, color: palette.text2 },
    caption: { fontSize: '0.71rem', fontWeight: 500, letterSpacing: '0.04em', color: palette.text3 },
    overline: { fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { fontWeight: 600, fontSize: '0.8125rem', textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 0 }, // Square edge workspace default
  shadows: [
    'none',
    '0 1px 2px rgba(43,108,93,0.04)',
    '0 2px 8px rgba(43,108,93,0.06)',
    '0 4px 16px rgba(43,108,93,0.08)',
    '0 8px 32px rgba(43,108,93,0.10)',
    '0 12px 40px rgba(43,108,93,0.12)',
    '0 16px 48px rgba(43,108,93,0.14)',
    ...Array(18).fill('0 2px 8px rgba(43,108,93,0.06)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: palette.bg,
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.surface3} transparent`,
        },
      },
    },

    // ─── AppBar (Topbar) ────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${palette.border}`,
          boxShadow: 'none',
          color: palette.text1,
        },
      },
    },

    // ─── Drawer (Sidebar) ───────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: palette.surface2,
          borderRight: `1px solid ${palette.border}`,
          boxShadow: 'none',
        },
      },
    },

    // ─── Card (Square Edges for Workspace Cards) ──────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 0, // Square edges for workspace cards
          boxShadow: '0 1px 3px rgba(43,108,93,0.04), 0 1px 2px rgba(43,108,93,0.02)',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(43,108,93,0.09)',
            borderColor: palette.borderStrong,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': { paddingBottom: '24px' },
        },
      },
    },

    // ─── Paper (Square Edges for Workspace Boxes) ────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 0, // Square edges for workspace boxes/cards
        },
        elevation1: { boxShadow: '0 2px 8px rgba(43,108,93,0.06)' },
        elevation2: { boxShadow: '0 4px 16px rgba(43,108,93,0.08)' },
        elevation3: { boxShadow: '0 8px 32px rgba(43,108,93,0.10)' },
      },
    },

    // ─── Button (Round Edges Allowed Elsewhere) ──────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.8125rem',
          boxShadow: 'none',
          transition: 'all 0.18s ease',
          '&:active': { transform: 'scale(0.98)' },
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 14px rgba(44,122,123,0.28)' },
        },
        containedPrimary: {
          background: palette.accent,
          boxShadow: '0 1px 4px rgba(44,122,123,0.25)',
          '&:hover': { background: palette.accentHover },
        },
        outlined: {
          borderColor: palette.border,
          '&:hover': { borderColor: palette.borderStrong, background: palette.surface2 },
        },
        text: {
          '&:hover': { background: palette.surface2 },
        },
        sizeSmall: { padding: '5px 12px', fontSize: '0.75rem', borderRadius: 6 },
        sizeMedium: { padding: '7px 16px' },
        sizeLarge:  { padding: '10px 22px', fontSize: '0.875rem' },
      },
    },

    // ─── IconButton ─────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background 0.18s ease, transform 0.18s ease',
          '&:hover': { background: palette.surface2 },
          '&:active': { transform: 'scale(0.94)' },
        },
      },
    },

    // ─── TextField ──────────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: palette.surface2,
            fontSize: '0.8125rem',
            '& fieldset': { borderColor: palette.border },
            '&:hover fieldset': { borderColor: palette.borderStrong },
            '&.Mui-focused fieldset': { borderColor: palette.accent, borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.8125rem',
            color: palette.text2,
            '&.Mui-focused': { color: palette.accent },
          },
        },
      },
    },

    // ─── Select ─────────────────────────────────────────────────────────────
    MuiSelect: {
      styleOverrides: {
        select: { fontSize: '0.8125rem', padding: '7px 14px' },
      },
    },

    // ─── Chip ───────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 24,
          fontSize: '0.71rem',
          fontWeight: 600,
          border: 'none',
        },
        colorPrimary: { background: palette.accentSoft, color: palette.accent },
        colorSuccess: { background: 'rgba(56,161,105,0.10)', color: '#276749' },
        colorWarning: { background: 'rgba(221,107,32,0.10)', color: '#9C4221' },
        colorError:   { background: 'rgba(229,62,62,0.10)',   color: '#9B2C2C' },
        colorDefault: { background: palette.surface2, color: palette.text2 },
      },
    },

    // ─── Tabs ───────────────────────────────────────────────────────────────
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderBottom: `1px solid ${palette.border}`,
        },
        indicator: {
          backgroundColor: palette.accent,
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8125rem',
          color: palette.text2,
          minHeight: 40,
          padding: '8px 16px',
          transition: 'color 0.18s ease',
          '&.Mui-selected': { color: palette.text1, fontWeight: 600 },
          '&:hover': { color: palette.text1 },
        },
      },
    },

    // ─── Table (Square Edge Containers) ─────────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.71rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: palette.text2,
          borderBottom: `1px solid ${palette.border}`,
          padding: '10px 16px',
          background: palette.surface2,
        },
        body: {
          fontSize: '0.8125rem',
          borderBottom: `1px solid ${palette.border}`,
          padding: '11px 16px',
          color: palette.text1,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.15s ease',
          '&:hover': { background: 'rgba(44,122,123,0.04)' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { borderRadius: 0, border: `1px solid ${palette.border}`, boxShadow: 'none' },
      },
    },

    // ─── ListItemButton ─────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '1px 8px',
          padding: '7px 10px',
          transition: 'background 0.15s ease, color 0.15s ease',
          color: palette.text2,
          '&.Mui-selected': {
            background: palette.accentSoft,
            color: palette.accent,
            fontWeight: 600,
            '& .MuiListItemIcon-root': { color: palette.accent },
          },
          '&:hover': { background: palette.surface3, color: palette.text1 },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 34, color: palette.text3 },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: '0.8125rem', fontWeight: 500 },
      },
    },

    // ─── LinearProgress ─────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 7, backgroundColor: palette.surface3 },
        bar:  { borderRadius: 99 },
        colorPrimary: { '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${palette.accent}, ${palette.teal})` } },
      },
    },

    // ─── Tooltip ────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.text1,
          color: '#fff',
          borderRadius: 6,
          fontSize: '0.71rem',
          fontWeight: 500,
          padding: '5px 10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        },
        arrow: { color: palette.text1 },
      },
    },

    // ─── Divider ────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: { root: { borderColor: palette.border } },
    },

    // ─── Avatar ─────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 700,
          background: alpha(palette.accent, 0.12),
          color: palette.accent,
        },
      },
    },

    // ─── Badge ──────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: '0.67rem',
          fontWeight: 700,
          minWidth: 16,
          height: 16,
          borderRadius: 8,
        },
      },
    },

    // ─── Menu / Popover ─────────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: `1px solid ${palette.border}`,
          boxShadow: '0 8px 32px rgba(43,108,93,0.12)',
          padding: '4px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.8125rem',
          padding: '7px 12px',
          transition: 'background 0.15s ease',
          '&:hover': { background: palette.surface2 },
        },
      },
    },

    // ─── Dialog ─────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0, // Square edges for dialog popups in workspace
          border: `1px solid ${palette.border}`,
          boxShadow: '0 24px 80px rgba(43,108,93,0.16)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: '1rem', fontWeight: 600, padding: '20px 24px 12px' },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '12px 24px', fontSize: '0.8125rem' },
      },
    },

    // ─── Alert ──────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 0, border: `1px solid ${palette.border}`, fontSize: '0.8125rem' },
        standardSuccess: { background: 'rgba(56,161,105,0.08)',  color: '#22543D' },
        standardWarning: { background: 'rgba(221,107,32,0.08)',  color: '#7B341E' },
        standardError:   { background: 'rgba(229,62,62,0.08)',   color: '#742A2A' },
        standardInfo:    { background: palette.accentSoft, color: palette.accent },
      },
    },
  },
});

export const darkTheme  = appTheme;
export const lightTheme = appTheme;
export default appTheme;
