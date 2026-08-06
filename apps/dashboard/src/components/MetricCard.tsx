import React from 'react';
import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
  chartData?: any[];
}

const generateMockData = () => Array.from({ length: 15 }, () => ({ value: Math.floor(Math.random() * 50) + 10 }));

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = '#0066CC',
  chartData,
}) => {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = change !== undefined ? (isPositive ? '#34C759' : '#FF3B30') : color;
  
  const data = chartData || generateMockData();

  return (
    <Card 
      className="animate-fade-up"
      sx={{ 
        borderRadius: 3.5, 
        border: '1px solid rgba(0,0,0,0.08)', 
        boxShadow: 'none', 
        bgcolor: '#FFFFFF', 
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease', 
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': { 
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', 
          borderColor: 'rgba(0,0,0,0.14)' 
        } 
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, zIndex: 1 }}>
          <Typography 
            sx={{ 
              fontSize: '0.67rem', 
              fontWeight: 600, 
              letterSpacing: '0.06em', 
              textTransform: 'uppercase', 
              color: '#6E6E73'
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: alpha(changeColor, 0.08),
                color: changeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '& svg': { fontSize: 18 }
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        
        <Box sx={{ zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography 
            sx={{ 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              letterSpacing: '-0.03em', 
              color: '#1D1D1F', 
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.2,
              mb: change !== undefined ? 0.5 : 0
            }}
          >
            {value}
          </Typography>
          
          {change !== undefined && (
            <Typography sx={{ fontSize: '0.75rem', color: changeColor, fontWeight: 500 }}>
              {isPositive ? '+' : ''}{change}% vs last month
            </Typography>
          )}
        </Box>

        {/* Sparkline Background */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            opacity: 0.1,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
                isAnimationActive={true}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
