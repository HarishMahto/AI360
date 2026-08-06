import React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

export interface UnboxedCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  accentBorder?: string;
}

const BRAND_PURPLE = '#7b2cbf';

export const UnboxedCard: React.FC<UnboxedCardProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = BRAND_PURPLE,
  icon,
  action,
  children,
  sx,
  accentBorder,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...(accentBorder && { borderLeft: `3px solid ${accentBorder}` }),
        ...sx,
      }}
    >
      {(title || icon || action) && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon && (
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  bgcolor: alpha(badgeColor, 0.1),
                  color: badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  '& svg': { fontSize: 16 },
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              {title && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography variant="h6" fontWeight={800} color="text.primary" fontSize="16px" letterSpacing="-0.01em" lineHeight={1.2}>
                    {title}
                  </Typography>
                  {badge && (
                    <Chip
                      label={badge}
                      size="small"
                      sx={{ bgcolor: alpha(badgeColor, 0.12), color: badgeColor, fontWeight: 800, fontSize: '12px', height: 16 }}
                    />
                  )}
                </Stack>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" fontWeight={500} fontSize="14px" display="block">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
        </Stack>
      )}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Paper>
  );
};

export default UnboxedCard;
