import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  badgeColor?: string;
  sx?: SxProps<Theme>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  icon,
  action,
  badgeColor = '#0066CC',
  sx,
}) => {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: alpha(badgeColor, 0.08),
                color: badgeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '& svg': { fontSize: 18 },
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography 
                variant="h4" 
                sx={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  letterSpacing: '-0.025em', 
                  color: '#1D1D1F' 
                }}
              >
                {title}
              </Typography>
              {badge && (
                <Chip
                  label={badge}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.67rem',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    bgcolor: alpha(badgeColor, 0.10),
                    color: badgeColor,
                  }}
                />
              )}
            </Stack>
            {subtitle && (
              <Typography 
                sx={{ 
                  fontSize: '0.8125rem', 
                  color: '#6E6E73', 
                  mt: 0.5 
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default PageHeader;
