import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Autocomplete,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery,
  Typography,
  Chip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
const INSTRUMENT_TYPES = [
  'Trumpet', 'Piccolo Trumpet', 'Flugelhorn', 'Cornet', 'Tenor Trombone', 'Bass Trombone', 'Alto Trombone', 'Contrabass Trombone', 'French Horn', 'Tuba', 'Sousaphone', 'Euphonium', 'Baritone Horn', 'Wagner Tuba', 'Ophicleide', 'Tenor Horn', 'Mellophone'
];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const BRANDS = [
  'ACB (Austin Custom Brass)', 'Alliance', 'AR Resonance', 'Bach (Vincent Bach)', 'Best Brass', 'Blessing (E.K. Blessing)', 'Breslmair', 'Bruno Tilz', 'Curry', 'Coppergate', 'Denis Wick', 'Donat', 'Frate', 'Frost', 'Giddings & Webster', 'Giardinelli', 'Greg Black', 'GR', 'G.W. Mouthpieces', 'Hammond Design', 'Helix Brass', 'Holton (Holton-Farkas)', 'JC Custom', 'Josef Klier', 'King', 'K&G', 'La Tromba', 'Laskey', 'Legends Brass', 'Lotus', 'Marcinkiewicz', 'Meeuwsen', 'Monette', 'O\'Malley', 'Parduba', 'Patrick', 'Pickett', 'Purviance', 'Reeves', 'Robert Tucci (formerly Perantucci)', 'Rudy Mück', 'Schilke', 'Shires', 'Stork', 'Stomvi', 'Toshi', 'Vennture', 'Warburton', 'Wedge', 'Yamaha'
];

export default function FilterBar({ 
  filters, 
  setFilters, 
  availableModels = [], 
  availableBrands = [],
  availableInstrumentTypes = [],
  onReset,
  variant = 'default' // 'default' or 'hero'
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setFilters({});
    if (onReset) onReset();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '' && value !== undefined && value !== null).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const filterContainerSx = variant === 'hero' ? {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    mt: 4,
    p: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  } : {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    mb: 6,
    p: 3,
    backgroundColor: '#f7f7f7',
    borderRadius: '16px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.04)'
  };

  const filterFieldSx = {
    minWidth: { xs: '100%', sm: 150 },
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'white'
    }
  };

  const priceFieldSx = {
    minWidth: { xs: '100%', sm: 100 },
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'white'
    }
  };

  const resetButtonSx = {
    borderRadius: '8px',
    fontWeight: 600,
    textTransform: 'none',
    borderColor: '#dddddd',
    color: '#222222',
    minWidth: { xs: '100%', sm: 'auto' },
    '&:hover': {
      borderColor: '#222222',
      backgroundColor: '#f7f7f7'
    }
  };

  if (isMobile) {
    return (
      <Box sx={{ mb: 4 }}>
        {/* Mobile Filter Toggle */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#f7f7f7',
          borderRadius: '12px',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: '#4a1d3f' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#222222' }}>
              Filters
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip 
                label={activeFiltersCount} 
                size="small" 
                sx={{ 
                  backgroundColor: '#4a1d3f',
                  color: 'white',
                  fontWeight: 600
                }} 
              />
            )}
          </Box>
          <IconButton
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{ 
              color: '#4a1d3f',
              '&:hover': { backgroundColor: 'rgba(74, 29, 63, 0.1)' }
            }}
          >
            {filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Collapsible Filters */}
        <Collapse in={filtersOpen}>
          <Box sx={filterContainerSx}>
            <Autocomplete
              freeSolo
              options={availableInstrumentTypes}
              value={filters.instrument_type || ''}
              onChange={(event, newValue) => {
                setFilters(f => ({ ...f, instrument_type: newValue || '' }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Instrument"
                  sx={filterFieldSx}
                />
              )}
            />
            <Autocomplete
              freeSolo
              options={availableBrands}
              value={filters.brand || ''}
              onChange={(event, newValue) => {
                setFilters(f => ({ ...f, brand: newValue || '' }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Brand"
                  sx={filterFieldSx}
                />
              )}
            />
            <Autocomplete
              freeSolo
              options={availableModels}
              value={filters.model || ''}
              onChange={(event, newValue) => {
                setFilters(f => ({ ...f, model: newValue || '' }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Model"
                  sx={filterFieldSx}
                />
              )}
            />
            <TextField 
              label="State" 
              name="location_state" 
              select 
              onChange={handleChange} 
              value={filters.location_state || ''} 
              sx={filterFieldSx}
            >
              <MenuItem value="">All States</MenuItem>
              {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField 
              label="Condition" 
              name="condition" 
              select 
              onChange={handleChange} 
              value={filters.condition || ''} 
              sx={filterFieldSx}
            >
              <MenuItem value="">All Conditions</MenuItem>
              {CONDITIONS.map(condition => (
                <MenuItem key={condition} value={condition}>{condition}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Min Price" 
              name="price_min" 
              type="number" 
              onChange={handleChange} 
              value={filters.price_min || ''} 
              sx={priceFieldSx}
            />
            <TextField 
              label="Max Price" 
              name="price_max" 
              type="number" 
              onChange={handleChange} 
              value={filters.price_max || ''} 
              sx={priceFieldSx}
            />
            <Button 
              onClick={handleReset} 
              variant="outlined"
              sx={resetButtonSx}
            >
              Reset Filters
            </Button>
          </Box>
        </Collapse>
      </Box>
    );
  }

  // Desktop version (unchanged)
  return (
    <Box sx={filterContainerSx}>
      <Autocomplete
        freeSolo
        options={availableInstrumentTypes}
        value={filters.instrument_type || ''}
        onChange={(event, newValue) => {
          setFilters(f => ({ ...f, instrument_type: newValue || '' }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Instrument"
            sx={filterFieldSx}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={availableBrands}
        value={filters.brand || ''}
        onChange={(event, newValue) => {
          setFilters(f => ({ ...f, brand: newValue || '' }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Brand"
            sx={filterFieldSx}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={availableModels}
        value={filters.model || ''}
        onChange={(event, newValue) => {
          setFilters(f => ({ ...f, model: newValue || '' }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Model"
            sx={filterFieldSx}
          />
        )}
      />
      <TextField 
        label="State" 
        name="location_state" 
        select 
        onChange={handleChange} 
        value={filters.location_state || ''} 
        sx={filterFieldSx}
      >
        <MenuItem value="">All States</MenuItem>
        {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <TextField 
        label="Condition" 
        name="condition" 
        select 
        onChange={handleChange} 
        value={filters.condition || ''} 
        sx={filterFieldSx}
      >
        <MenuItem value="">All Conditions</MenuItem>
        {CONDITIONS.map(condition => (
          <MenuItem key={condition} value={condition}>{condition}</MenuItem>
        ))}
      </TextField>
      <TextField 
        label="Min Price" 
        name="price_min" 
        type="number" 
        onChange={handleChange} 
        value={filters.price_min || ''} 
        sx={priceFieldSx}
      />
      <TextField 
        label="Max Price" 
        name="price_max" 
        type="number" 
        onChange={handleChange} 
        value={filters.price_max || ''} 
        sx={priceFieldSx}
      />
      <Button 
        onClick={handleReset} 
        variant="outlined"
        sx={resetButtonSx}
      >
        Reset
      </Button>
    </Box>
  );
} 