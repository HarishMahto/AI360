// AI360 – Executive Layout (Compact Space-Filling Layout)
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ExecutiveLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#FAFAFA' }}>
      <Sidebar role="EXECUTIVE" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <Topbar title="Executive Overview" subtitle="Organization-wide AI intelligence" collapsed={collapsed} />
        <Box component={motion.main} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} sx={{ flex: 1, overflowY: 'auto', p: 0, bgcolor: '#FAFAFA' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
