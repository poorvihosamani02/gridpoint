/**
 * Canonical Bengaluru E-Commerce Delivery Demand Dataset
 * Includes authentic latitudes, longitudes, and realistic daily orders for key tech and residential corridors.
 */
export const SAMPLE_BENGALURU_DATA = [
  { id: 'BLR-01', name: 'Koramangala Tech Hub', lat: 12.9352, lng: 77.6245, daily_orders: 4200 },
  { id: 'BLR-02', name: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408, daily_orders: 3800 },
  { id: 'BLR-03', name: 'Whitefield IT Corridor', lat: 12.9698, lng: 77.7500, daily_orders: 5200 },
  { id: 'BLR-04', name: 'Electronic City Phase 1', lat: 12.8452, lng: 77.6602, daily_orders: 4600 },
  { id: 'BLR-05', name: 'HSR Layout Sector 1-7', lat: 12.9121, lng: 77.6446, daily_orders: 3900 },
  { id: 'BLR-06', name: 'Jayanagar 4th Block', lat: 12.9308, lng: 77.5838, daily_orders: 2900 },
  { id: 'BLR-07', name: 'Malleshwaram Heritage', lat: 13.0031, lng: 77.5643, daily_orders: 2700 },
  { id: 'BLR-08', name: 'Hebbal Flyover Zone', lat: 13.0358, lng: 77.5970, daily_orders: 3100 },
  { id: 'BLR-09', name: 'Marathahalli Bridge', lat: 12.9591, lng: 77.6974, daily_orders: 3600 },
  { id: 'BLR-10', name: 'Yelahanka New Town', lat: 13.1007, lng: 77.5963, daily_orders: 2400 },
  { id: 'BLR-11', name: 'Bellandur Outer Ring', lat: 12.9260, lng: 77.6762, daily_orders: 4100 },
  { id: 'BLR-12', name: 'Sarjapur Road Junction', lat: 12.9081, lng: 77.6891, daily_orders: 3300 },
  { id: 'BLR-13', name: 'Rajajinagar Industrial', lat: 12.9982, lng: 77.5530, daily_orders: 2500 },
  { id: 'BLR-14', name: 'Banashankari Stage 2', lat: 12.9150, lng: 77.5736, daily_orders: 2800 },
  { id: 'BLR-15', name: 'Manyata Tech Park Hub', lat: 13.0489, lng: 77.6200, daily_orders: 3400 },
  { id: 'BLR-16', name: 'BTM Layout 2nd Stage', lat: 12.9166, lng: 77.6101, daily_orders: 3100 }
];

export const FLEET_INFO = {
  bikes: {
    name: 'Motorbikes / Scooters',
    desc: 'High urban agility, lowest fuel cost, ideal for quick single or dual package dispatches.',
    efficiency: '35 km/L',
    speed: '32 km/h',
    fuelPrice: '₹102 / L',
    capacity: '25 orders/trip'
  },
  vans: {
    name: 'Electric / Diesel Delivery Vans',
    desc: 'Balanced cargo capacity and speed. Standard middle-mile and neighborhood distribution vehicle.',
    efficiency: '12 km/L',
    speed: '25 km/h',
    fuelPrice: '₹90 / L',
    capacity: '120 orders/trip'
  },
  trucks: {
    name: 'Medium Freight Trucks',
    desc: 'High cargo payload, but slower transit in heavy city traffic with higher fuel burn.',
    efficiency: '5 km/L',
    speed: '18 km/h',
    fuelPrice: '₹90 / L',
    capacity: '500 orders/trip'
  }
};

export const TRAFFIC_INFO = {
  light: { label: 'Light Traffic (0.8x Transit Time)', speedMultiplier: '1.25x' },
  normal: { label: 'Normal Traffic (1.0x Baseline)', speedMultiplier: '1.00x' },
  heavy: { label: 'Heavy Traffic (1.65x Delay)', speedMultiplier: '0.61x' }
};

export const WAREHOUSE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
];
