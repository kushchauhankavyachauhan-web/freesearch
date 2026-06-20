
// Seeded PRNG - deterministic, no external deps
function createRNG(seed) {
  let s = (seed >>> 0) || 1;
  return {
    next() {
      s ^= s << 13; s ^= s >> 17; s ^= s << 5;
      return (s >>> 0) / 0xFFFFFFFF;
    },
    int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; },
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; },
    bool(p = 0.5) { return this.next() < p; },
    pickWeighted(arr, weights) {
      const total = weights.reduce((a, b) => a + b, 0);
      let r = this.next() * total;
      for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
      return arr[arr.length - 1];
    }
  };
}

function fmt(n) { return n.toLocaleString('en-IN'); }

// ─── Component templates per category ───────────────────────────────────────

const BATTERY_USABLE = [
  "Holds 85%+ charge, cycle count below 300",
  "Recently replaced unit, full capacity",
  "No swelling detected, normal discharge curve",
  "Capacity reads 91% on diagnostic",
  "Low usage, less than 150 cycles",
];
const BATTERY_UNUSABLE = [
  "Capacity degraded below 60%, won't hold charge",
  "Visible swelling — fire risk, do not reuse",
  "Lithium leakage detected on casing",
  "Won't charge beyond 20% consistently",
  "Physical puncture, electrolyte exposure",
];
const DISPLAY_USABLE = [
  "No cracks or dead pixels, backlight intact",
  "Minor surface scratches only, full brightness",
  "Touch sensitivity 100%, no burn-in",
  "IPS panel in good condition, no bleed",
  "Good colour accuracy, no delamination",
];
const DISPLAY_UNUSABLE = [
  "Cracked glass with LCD bleed across panel",
  "Dead pixels covering >30% of display",
  "Backlight failure, screen unusable",
  "Digitizer unresponsive, deep screen crack",
  "Burn-in visible, colour distortion severe",
];
const CAMERA_USABLE = [
  "All lenses clear, autofocus functional",
  "No lens fog, OIS working correctly",
  "Sensor calibration intact",
  "Macro and wide-angle both functional",
];
const CAMERA_UNUSABLE = [
  "Lens shattered, sensor exposed",
  "OIS mechanism failed, blurry output",
  "Sensor failure, black output on test",
  "Water ingress, corrosion on module",
];
const PORT_USABLE = [
  "Pins undamaged, fast charge functional",
  "No corrosion, secure connection",
  "USB-C port intact, data transfer OK",
  "Charging validated at rated wattage",
];
const PORT_UNUSABLE = [
  "Pins bent/broken, intermittent connection",
  "Corrosion from moisture ingress",
  "Port physically damaged, won't seat cable",
  "Loose contact, charges only at certain angles",
];
const MB_USABLE = [
  "No burn marks, all ICs functional",
  "Passes power-on self test",
  "No water damage stains, capacitors intact",
  "All solder joints secure",
];
const MB_UNUSABLE = [
  "Short circuit on power rail traces",
  "Water damage — extensive corrosion",
  "Failed capacitor cluster near CPU socket",
  "BIOS chip unreadable, board won't POST",
];
const SPEAKER_USABLE = ["Clear audio output, no crackling", "Full frequency response intact"];
const SPEAKER_UNUSABLE = ["Blown driver, distorted output", "Voice coil damaged, no audio"];
const HDD_USABLE = ["SMART status: Good, no bad sectors", "Read/write speeds nominal"];
const HDD_UNUSABLE = ["SMART status: Failed, imminent failure", "Bad sector count >500, data loss risk"];
const SSD_USABLE = ["TBW remaining: 80%+, health optimal", "No read errors on full scan"];
const SSD_UNUSABLE = ["Wear indicator critical, data loss risk", "Controller failure, not detected by BIOS"];
const RAM_USABLE = ["Passes memtest, all banks OK", "No errors on 24hr burn-in"];
const RAM_UNUSABLE = ["Memory errors on test — module faulty", "Physical damage to DIMM slot contacts"];
const FAN_USABLE = ["Bearings smooth, rated RPM achieved", "No noise or wobble on spin-up"];
const FAN_UNUSABLE = ["Bearing failure, loud grinding noise", "Blade cracked, imbalance detected"];
const ADAPTER_USABLE = ["Output voltage stable within ±2%", "No overheating on load test"];
const ADAPTER_UNUSABLE = ["Output voltage fluctuating, unsafe", "Burnt transformer smell, do not use"];
const PANEL_USABLE = ["No burn-in, all pixels functional", "Backlight uniform, no hot spots"];
const PANEL_UNUSABLE = ["Backlight strips failing, dim sections", "Panel cracked, internal damage"];
const INKHEAD_USABLE = ["Nozzle test clean, all colours printing", "No clog on purge test"];
const INKHEAD_UNUSABLE = ["Nozzle clog unrecoverable", "Ink dried in chambers, replacement needed"];

function pickComp(rng, name, usableArr, unusableArr, usableProb = 0.55) {
  const usable = rng.bool(usableProb);
  return {
    name,
    usable,
    reason: rng.pick(usable ? usableArr : unusableArr),
  };
}

// ─── Category definitions ────────────────────────────────────────────────────

const CATEGORIES = [
  {
    category: 'Phone',
    count: 180,
    brands: ['Samsung','Xiaomi','Realme','OnePlus','Apple','Vivo','OPPO','Motorola','iQOO','Nothing','Infinix'],
    nameFn(rng, brand) {
      const series = rng.pick(['A-series','M-series','Galaxy S','Note series','Pro series',
        'Lite','Nord','Edge','Play','Narzo','GT series','Find series','Reno','G series']);
      return `${brand} ${series} Smartphone`;
    },
    ageRanges: ['0-1','1-2','2-4','4-6','6+'],
    ageWeights: [0.1, 0.2, 0.35, 0.25, 0.1],
    lifespanFn(rng, age) {
      if (age === '0-1') return rng.int(24, 48);
      if (age === '1-2') return rng.int(12, 30);
      if (age === '2-4') return rng.int(3, 18);
      if (age === '4-6') return rng.int(1, 8);
      return rng.int(0, 4);
    },
    hazardFn: () => 'Medium',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Battery', BATTERY_USABLE, BATTERY_UNUSABLE, 0.5),
        pickComp(rng, 'Display', DISPLAY_USABLE, DISPLAY_UNUSABLE, 0.6),
        pickComp(rng, 'Camera Module', CAMERA_USABLE, CAMERA_UNUSABLE, 0.65),
        pickComp(rng, 'Charging Port', PORT_USABLE, PORT_UNUSABLE, 0.55),
        pickComp(rng, 'Motherboard', MB_USABLE, MB_UNUSABLE, 0.7),
      ];
    },
    resaleFn(rng) { const l = rng.int(800,12000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(1000,6000))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Feature Phone',
    count: 70,
    brands: ['Nokia','Samsung','itel','Lava','Micromax','Jio','Karbonn'],
    nameFn(rng, brand) {
      return `${brand} ${rng.pick(['Classic','Dual SIM','Bar Phone','Keypad Phone','Basic Phone'])}`;
    },
    ageRanges: ['2-4','4-6','6+','8+'],
    ageWeights: [0.2, 0.35, 0.3, 0.15],
    lifespanFn(rng) { return rng.int(0, 12); },
    hazardFn: () => 'Low',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Battery', BATTERY_USABLE, BATTERY_UNUSABLE, 0.4),
        pickComp(rng, 'Keypad', ["Keys responsive, all functional","No missing keys"], ["Multiple keys stuck or missing","Pad delaminated"], 0.5),
        pickComp(rng, 'Display Module', ["Screen clear, no cracks"], ["Screen cracked or fogged"], 0.55),
        pickComp(rng, 'Charging Port', PORT_USABLE, PORT_UNUSABLE, 0.45),
      ];
    },
    resaleFn(rng) { const l = rng.int(100,600); return `₹${fmt(l)} – ₹${fmt(l+rng.int(100,400))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Laptop',
    count: 150,
    brands: ['Dell','HP','Lenovo','Asus','Acer','Apple','MSI','Samsung','LG','Toshiba'],
    nameFn(rng, brand) {
      const series = rng.pick(['Inspiron','XPS','Vostro','Latitude','Pavilion','EliteBook','ProBook',
        'ThinkPad','IdeaPad','VivoBook','ZenBook','Aspire','Nitro','MacBook Air','MacBook Pro',
        'Spectre','Envy','Stealth','Swift','Spin']);
      return `${brand} ${series} Laptop`;
    },
    ageRanges: ['0-1','1-2','2-4','4-6','6+','8+'],
    ageWeights: [0.08, 0.15, 0.3, 0.28, 0.12, 0.07],
    lifespanFn(rng, age) {
      if (age === '0-1') return rng.int(36, 72);
      if (age === '1-2') return rng.int(24, 48);
      if (age === '2-4') return rng.int(8, 28);
      if (age === '4-6') return rng.int(2, 14);
      return rng.int(0, 6);
    },
    hazardFn: () => 'Medium',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Battery', BATTERY_USABLE, BATTERY_UNUSABLE, 0.45),
        pickComp(rng, 'Display Panel', PANEL_USABLE, PANEL_UNUSABLE, 0.65),
        pickComp(rng, 'SSD/HDD', SSD_USABLE, SSD_UNUSABLE, 0.7),
        pickComp(rng, 'RAM', RAM_USABLE, RAM_UNUSABLE, 0.75),
        pickComp(rng, 'Motherboard', MB_USABLE, MB_UNUSABLE, 0.65),
        pickComp(rng, 'Cooling Fan', FAN_USABLE, FAN_UNUSABLE, 0.6),
        pickComp(rng, 'Power Adapter', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.65),
      ].slice(0, rng.int(4, 7));
    },
    resaleFn(rng) { const l = rng.int(3000,35000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(2000,15000))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Desktop PC',
    count: 70,
    brands: ['Dell','HP','Lenovo','Acer','HCL','Wipro','iBall','Zebronics'],
    nameFn(rng, brand) {
      return `${brand} ${rng.pick(['Desktop Tower','All-in-One PC','Workstation','Mini PC','Gaming PC'])}`;
    },
    ageRanges: ['2-4','4-6','6+','8+','10+'],
    ageWeights: [0.15, 0.3, 0.3, 0.15, 0.1],
    lifespanFn(rng) { return rng.int(0, 24); },
    hazardFn: () => 'High',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Motherboard', MB_USABLE, MB_UNUSABLE, 0.6),
        pickComp(rng, 'RAM', RAM_USABLE, RAM_UNUSABLE, 0.7),
        pickComp(rng, 'HDD/SSD', HDD_USABLE, HDD_UNUSABLE, 0.6),
        pickComp(rng, 'CPU Cooler', FAN_USABLE, FAN_UNUSABLE, 0.65),
        pickComp(rng, 'SMPS/Power Supply', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.55),
        pickComp(rng, 'Cabinet/Chassis', ["No rust or dents, good condition"], ["Rusted, bent panels"], 0.7),
      ];
    },
    resaleFn(rng) { const l = rng.int(1500,18000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(2000,8000))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Monitor',
    count: 75,
    brands: ['LG','Samsung','Dell','HP','BenQ','Acer','Asus','Philips','ViewSonic'],
    nameFn(rng, brand) {
      const sz = rng.pick(['21.5"','23.8"','24"','27"','32"','19"','22"']);
      const type = rng.pick(['IPS Monitor','FHD Monitor','LED Monitor','4K Monitor','Curved Monitor','VA Panel Monitor']);
      return `${brand} ${sz} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+','8+'],
    ageWeights: [0.2, 0.3, 0.35, 0.15],
    lifespanFn(rng) { return rng.int(0, 30); },
    hazardFn() { return this.rng ? 'High' : 'High'; },
    hazardFnSimple: () => 'High',
    componentsFn(rng) {
      return [
        pickComp(rng, 'LCD/LED Panel', PANEL_USABLE, PANEL_UNUSABLE, 0.6),
        pickComp(rng, 'Power Supply Board', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.6),
        pickComp(rng, 'Main Board', MB_USABLE, MB_UNUSABLE, 0.65),
        pickComp(rng, 'Stand/Chassis', ["No cracks, pivot works smoothly"], ["Base broken, cannot stand"], 0.75),
      ];
    },
    resaleFn(rng) { const l = rng.int(800,8000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(500,4000))}`; },
    eprCategory: 'Consumer Electronics',
  },
  {
    category: 'Tablet',
    count: 70,
    brands: ['Samsung','Lenovo','Apple','Realme','Xiaomi','Huawei','iBall'],
    nameFn(rng, brand) {
      const series = rng.pick(['Tab','iPad','MatePad','Pad','Slate','Tab Lite','Tab S-series','Tab M-series']);
      return `${brand} ${series} Tablet`;
    },
    ageRanges: ['0-1','1-2','2-4','4-6','6+'],
    ageWeights: [0.1, 0.2, 0.35, 0.25, 0.1],
    lifespanFn(rng, age) {
      if (age === '0-1') return rng.int(24, 48);
      if (age === '1-2') return rng.int(12, 28);
      if (age === '2-4') return rng.int(3, 16);
      return rng.int(0, 6);
    },
    hazardFn: () => 'Medium',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Battery', BATTERY_USABLE, BATTERY_UNUSABLE, 0.5),
        pickComp(rng, 'Display', DISPLAY_USABLE, DISPLAY_UNUSABLE, 0.6),
        pickComp(rng, 'Charging Port', PORT_USABLE, PORT_UNUSABLE, 0.55),
        pickComp(rng, 'Motherboard/SoC', MB_USABLE, MB_UNUSABLE, 0.65),
        pickComp(rng, 'Camera Module', CAMERA_USABLE, CAMERA_UNUSABLE, 0.6),
      ];
    },
    resaleFn(rng) { const l = rng.int(1500,15000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(1000,8000))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Charger',
    count: 80,
    brands: ['Anchor','Syska','boAt','Samsung','Xiaomi','OnePlus','Realme','Portronics','Belkin','Mi'],
    nameFn(rng, brand) {
      const watt = rng.pick(['5W','10W','18W','20W','33W','65W','100W','12W']);
      return `${brand} ${watt} USB Charger/Adapter`;
    },
    ageRanges: ['0-1','1-2','2-4','4-6'],
    ageWeights: [0.15, 0.25, 0.4, 0.2],
    lifespanFn(rng) { return rng.int(1, 24); },
    hazardFn: () => 'Low',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Transformer/Coil', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.55),
        pickComp(rng, 'USB Port', PORT_USABLE, PORT_UNUSABLE, 0.6),
        pickComp(rng, 'PCB', MB_USABLE, MB_UNUSABLE, 0.6),
      ];
    },
    resaleFn(rng) { const l = rng.int(50,400); return `₹${fmt(l)} – ₹${fmt(l+rng.int(50,250))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Power Bank',
    count: 60,
    brands: ['Mi','Ambrane','Syska','boAt','Portronics','Realme','OnePlus','URBN','Bajaj'],
    nameFn(rng, brand) {
      const cap = rng.pick(['5000mAh','10000mAh','12000mAh','20000mAh','25000mAh','30000mAh']);
      return `${brand} ${cap} Power Bank`;
    },
    ageRanges: ['0-1','1-2','2-4','4-6','6+'],
    ageWeights: [0.1, 0.2, 0.35, 0.25, 0.1],
    lifespanFn(rng) { return rng.int(1, 30); },
    hazardFn: () => 'High',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Li-ion Cell Pack', BATTERY_USABLE, BATTERY_UNUSABLE, 0.45),
        pickComp(rng, 'USB Ports', PORT_USABLE, PORT_UNUSABLE, 0.6),
        pickComp(rng, 'BMS Circuit', MB_USABLE, MB_UNUSABLE, 0.6),
        pickComp(rng, 'Casing', ["No cracks, intact shell"], ["Cracked, cell pack exposed"], 0.7),
      ];
    },
    resaleFn(rng) { const l = rng.int(150,800); return `₹${fmt(l)} – ₹${fmt(l+rng.int(100,500))}`; },
    eprCategory: 'Electrical and Electronic Equipment',
  },
  {
    category: 'Battery',
    count: 55,
    brands: ['Exide','Amaron','Luminous','Okaya','SF Sonic','Livguard','TATA Green','generic Li-ion'],
    nameFn(rng, brand) {
      const type = rng.pick(['Li-ion Battery Pack','NiMH Battery','Lead Acid Battery','LiFePO4 Cell',
        'Laptop Battery Pack','UPS Battery','Inverter Battery Cell']);
      return `${brand} ${type}`;
    },
    ageRanges: ['1-2','2-4','4-6','6+'],
    ageWeights: [0.2, 0.35, 0.3, 0.15],
    lifespanFn(rng) { return rng.int(0, 18); },
    hazardFn: () => 'High',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Cell Array', BATTERY_USABLE, BATTERY_UNUSABLE, 0.4),
        pickComp(rng, 'BMS/Protection Circuit', MB_USABLE, MB_UNUSABLE, 0.55),
        pickComp(rng, 'Connector/Terminal', PORT_USABLE, PORT_UNUSABLE, 0.6),
      ];
    },
    resaleFn(rng) { const l = rng.int(100,1200); return `₹${fmt(l)} – ₹${fmt(l+rng.int(100,600))}`; },
    eprCategory: 'Electrical and Electronic Equipment',
  },
  {
    category: 'Earphones',
    count: 75,
    brands: ['boAt','JBL','Sony','Noise','Realme','OnePlus','Samsung','Zebronics','Infinity','Sennheiser','Skullcandy'],
    nameFn(rng, brand) {
      const type = rng.pick(['TWS Earbuds','Neckband Earphones','Over-ear Headphones','Wired Earphones',
        'Sports Earbuds','ANC Headphones','Gaming Headset']);
      return `${brand} ${type}`;
    },
    ageRanges: ['0-1','1-2','2-4','4-6'],
    ageWeights: [0.15, 0.3, 0.4, 0.15],
    lifespanFn(rng) { return rng.int(1, 24); },
    hazardFn: () => 'Low',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Speaker Drivers', SPEAKER_USABLE, SPEAKER_UNUSABLE, 0.55),
        pickComp(rng, 'Battery (if wireless)', BATTERY_USABLE, BATTERY_UNUSABLE, 0.45),
        pickComp(rng, 'Cable/Connector', PORT_USABLE, PORT_UNUSABLE, 0.5),
        pickComp(rng, 'Ear Tips/Cushions', ["Soft foam intact, hygienic"], ["Foam degraded, needs replacement"], 0.5),
      ].filter((_, i) => rng.bool(0.8) || i < 2);
    },
    resaleFn(rng) { const l = rng.int(100,4000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(100,2000))}`; },
    eprCategory: 'Consumer Electronics',
  },
  {
    category: 'Smartwatch',
    count: 55,
    brands: ['Noise','boAt','Samsung','Apple','Garmin','Fire-Boltt','Amazfit','Fastrack','Titan'],
    nameFn(rng, brand) {
      const series = rng.pick(['Pro','Lite','Ultra','SE','Classic','Active','Sport','Colorfit Pro','Verge']);
      return `${brand} ${series} Smartwatch`;
    },
    ageRanges: ['0-1','1-2','2-4','4-6'],
    ageWeights: [0.2, 0.35, 0.35, 0.1],
    lifespanFn(rng) { return rng.int(2, 30); },
    hazardFn: () => 'Low',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Battery', BATTERY_USABLE, BATTERY_UNUSABLE, 0.55),
        pickComp(rng, 'AMOLED/LCD Display', DISPLAY_USABLE, DISPLAY_UNUSABLE, 0.65),
        pickComp(rng, 'Sensor Array', ["HR, SpO2, GPS all functional"], ["SpO2 sensor inaccurate, HR erratic"], 0.6),
        pickComp(rng, 'Strap/Chassis', ["Strap undamaged, clasp secure"], ["Strap torn, clasp broken"], 0.65),
      ];
    },
    resaleFn(rng) { const l = rng.int(300,8000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(500,4000))}`; },
    eprCategory: 'Consumer Electronics',
  },
  {
    category: 'Router',
    count: 40,
    brands: ['TP-Link','D-Link','Tenda','Netgear','Asus','Jio','Airtel','BSNL','Mi','iBall'],
    nameFn(rng, brand) {
      const type = rng.pick(['Wi-Fi Router','Dual-Band Router','Mesh Router','4G LTE Router',
        'ADSL Modem Router','Wi-Fi 6 Router','N300 Router','AC1200 Router']);
      return `${brand} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+','8+'],
    ageWeights: [0.25, 0.35, 0.3, 0.1],
    lifespanFn(rng) { return rng.int(0, 24); },
    hazardFn: () => 'Low',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Mainboard/SoC', MB_USABLE, MB_UNUSABLE, 0.65),
        pickComp(rng, 'Power Adapter', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.6),
        pickComp(rng, 'Antenna Array', ["All antennas functional, signal good"], ["One antenna broken, reduced range"], 0.65),
        pickComp(rng, 'WAN/LAN Ports', PORT_USABLE, PORT_UNUSABLE, 0.65),
      ];
    },
    resaleFn(rng) { const l = rng.int(200,2500); return `₹${fmt(l)} – ₹${fmt(l+rng.int(200,1500))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Printer',
    count: 40,
    brands: ['HP','Canon','Epson','Brother','Samsung','Ricoh','Pantum'],
    nameFn(rng, brand) {
      const type = rng.pick(['Inkjet Printer','Laser Printer','All-in-One Printer','Dot Matrix Printer',
        'Photo Printer','A3 Printer','MFP Scanner-Printer']);
      return `${brand} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+','8+','10+'],
    ageWeights: [0.15, 0.3, 0.3, 0.15, 0.1],
    lifespanFn(rng) { return rng.int(0, 18); },
    hazardFn: () => 'High',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Print Head/Cartridge', INKHEAD_USABLE, INKHEAD_UNUSABLE, 0.5),
        pickComp(rng, 'Feed Roller', ["Paper feeds cleanly"], ["Paper jam on every feed"], 0.55),
        pickComp(rng, 'Control Board', MB_USABLE, MB_UNUSABLE, 0.65),
        pickComp(rng, 'Power Supply', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.65),
        pickComp(rng, 'Scanner Unit (if AIO)', ["Scan glass clean, lamp OK"], ["Lamp failed, dark scans"], 0.6),
      ].slice(0, rng.int(3, 5));
    },
    resaleFn(rng) { const l = rng.int(500,5000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(500,3000))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'Keyboard/Mouse',
    count: 55,
    brands: ['Logitech','Dell','HP','Zebronics','TVS-E','Intex','iBall','Rapoo','Corsair','Razer'],
    nameFn(rng, brand) {
      const type = rng.pick(['Wireless Keyboard','Mechanical Keyboard','USB Keyboard','Gaming Keyboard',
        'Wireless Mouse','Gaming Mouse','Trackball Mouse','Optical Mouse','Combo Set']);
      return `${brand} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+','8+'],
    ageWeights: [0.2, 0.35, 0.3, 0.15],
    lifespanFn(rng) { return rng.int(0, 18); },
    hazardFn: () => 'Low',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Switches/Keys', ["All keys responsive, no chattering"], ["Several keys dead or sticky"], 0.6),
        pickComp(rng, 'USB/Wireless Receiver', ["USB connects reliably","Receiver pairs instantly"], ["USB not detected by host"], 0.65),
        pickComp(rng, 'Battery (if wireless)', BATTERY_USABLE, BATTERY_UNUSABLE, 0.55),
        pickComp(rng, 'Scroll Wheel/Sensor', ["Scroll smooth, sensor accurate"], ["Scroll jittery, sensor drift"], 0.6),
      ].slice(0, rng.int(2, 4));
    },
    resaleFn(rng) { const l = rng.int(80,1500); return `₹${fmt(l)} – ₹${fmt(l+rng.int(80,800))}`; },
    eprCategory: 'IT and Telecommunication Equipment',
  },
  {
    category: 'TV',
    count: 55,
    brands: ['LG','Samsung','Sony','Mi','TCL','Vu','OnePlus','Hisense','Panasonic','Thomson'],
    nameFn(rng, brand) {
      const sz = rng.pick(['32"','40"','43"','50"','55"','65"','24"','75"']);
      const type = rng.pick(['Smart TV','4K OLED TV','QLED TV','Full HD LED TV','Android TV','Google TV']);
      return `${brand} ${sz} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+','8+','10+'],
    ageWeights: [0.15, 0.3, 0.3, 0.15, 0.1],
    lifespanFn(rng) { return rng.int(0, 36); },
    hazardFn: () => 'High',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Display Panel', PANEL_USABLE, PANEL_UNUSABLE, 0.55),
        pickComp(rng, 'Main Board/SoC', MB_USABLE, MB_UNUSABLE, 0.65),
        pickComp(rng, 'Power Supply Board', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.6),
        pickComp(rng, 'Speakers', SPEAKER_USABLE, SPEAKER_UNUSABLE, 0.65),
        pickComp(rng, 'Remote Control', ["All buttons functional, IR transmitter OK"], ["IR emitter dead, buttons sticky"], 0.6),
      ];
    },
    resaleFn(rng) { const l = rng.int(1500,20000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(1000,8000))}`; },
    eprCategory: 'Consumer Electronics',
  },
  {
    category: 'Appliance',
    count: 50,
    brands: ['Havells','Usha','Bajaj','Crompton','Syska','Orient','Philips','Panasonic','Wipro','Anchor'],
    nameFn(rng, brand) {
      const type = rng.pick(['Table Fan','Ceiling Fan','Room Air Cooler','Water Heater',
        'Electric Kettle','Mixer Grinder','Iron','Exhaust Fan','Air Purifier','LED Bulb Pack']);
      return `${brand} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+','8+','10+'],
    ageWeights: [0.15, 0.25, 0.3, 0.2, 0.1],
    lifespanFn(rng) { return rng.int(0, 30); },
    hazardFn() { return 'Medium'; },
    componentsFn(rng) {
      return [
        pickComp(rng, 'Motor/Heating Element', FAN_USABLE, FAN_UNUSABLE, 0.55),
        pickComp(rng, 'PCB/Controls', MB_USABLE, MB_UNUSABLE, 0.6),
        pickComp(rng, 'Power Cord', ADAPTER_USABLE, ADAPTER_UNUSABLE, 0.65),
        pickComp(rng, 'Casing/Body', ["No cracks, all clips intact"], ["Melted/cracked casing"], 0.7),
      ];
    },
    resaleFn(rng) { const l = rng.int(100,2500); return `₹${fmt(l)} – ₹${fmt(l+rng.int(100,1500))}`; },
    eprCategory: 'Electrical and Electronic Equipment',
  },
  {
    category: 'Camera',
    count: 35,
    brands: ['Canon','Nikon','Sony','GoPro','Fujifilm','Olympus','Kodak','DJI'],
    nameFn(rng, brand) {
      const type = rng.pick(['DSLR Camera','Mirrorless Camera','Point-and-Shoot Camera',
        'Action Camera','Webcam','Security Camera Module','Bridge Camera']);
      return `${brand} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+','8+'],
    ageWeights: [0.2, 0.3, 0.3, 0.2],
    lifespanFn(rng) { return rng.int(0, 36); },
    hazardFn: () => 'Medium',
    componentsFn(rng) {
      return [
        pickComp(rng, 'Image Sensor', CAMERA_USABLE, CAMERA_UNUSABLE, 0.6),
        pickComp(rng, 'Battery Pack', BATTERY_USABLE, BATTERY_UNUSABLE, 0.5),
        pickComp(rng, 'Lens Assembly', ["Optics clear, focus motor OK"], ["Lens fungus/fog, AF failure"], 0.6),
        pickComp(rng, 'LCD Screen', DISPLAY_USABLE, DISPLAY_UNUSABLE, 0.65),
        pickComp(rng, 'Memory Card Slot', PORT_USABLE, PORT_UNUSABLE, 0.7),
      ].slice(0, rng.int(3, 5));
    },
    resaleFn(rng) { const l = rng.int(500,25000); return `₹${fmt(l)} – ₹${fmt(l+rng.int(500,10000))}`; },
    eprCategory: 'Consumer Electronics',
  },
  {
    category: 'Circuit Board',
    count: 25,
    brands: ['generic','Arduino','Raspberry Pi','ESP','STM','Texas Instruments','Infineon','Microchip'],
    nameFn(rng, brand) {
      const type = rng.pick(['PCB Module','Microcontroller Board','Development Board',
        'Power Module PCB','Industrial Controller Board','IoT Module']);
      return `${brand} ${type}`;
    },
    ageRanges: ['2-4','4-6','6+'],
    ageWeights: [0.3, 0.4, 0.3],
    lifespanFn(rng) { return rng.int(0, 24); },
    hazardFn: () => 'High',
    componentsFn(rng) {
      return [
        pickComp(rng, 'ICs/Chips', MB_USABLE, MB_UNUSABLE, 0.6),
        pickComp(rng, 'Capacitors', ["ESR within spec, no bulge"], ["Bulged/leaking capacitors detected"], 0.65),
        pickComp(rng, 'Connectors', PORT_USABLE, PORT_UNUSABLE, 0.6),
      ];
    },
    resaleFn(rng) { const l = rng.int(50,1200); return `₹${fmt(l)} – ₹${fmt(l+rng.int(50,600))}`; },
    eprCategory: 'Electrical and Electronic Equipment',
  },
];

// ─── Generator ───────────────────────────────────────────────────────────────

function generateDataset() {
  const rng = createRNG(42);
  const dataset = [];
  let id = 1;

  for (const tpl of CATEGORIES) {
    for (let i = 0; i < tpl.count; i++) {
      const brand = rng.pick(tpl.brands);
      const ageWeights = tpl.ageWeights || Array(tpl.ageRanges.length).fill(1);
      const age = rng.pickWeighted(tpl.ageRanges, ageWeights);
      const lifespan = tpl.lifespanFn(rng, age);
      let hazard = 'Medium';
      if (tpl.hazardFn) hazard = tpl.hazardFn();
      else if (tpl.hazardFnSimple) hazard = tpl.hazardFnSimple();

      const entry = {
        id: `dev-${String(id).padStart(4, '0')}`,
        deviceName: tpl.nameFn(rng, brand),
        category: tpl.category,
        ageRangeYears: age,
        predictedLifespanMonthsRemaining: Math.max(0, lifespan),
        hazardLevel: hazard,
        components: tpl.componentsFn(rng),
        estimatedResaleValueINR: tpl.resaleFn(rng),
        eprCategory: tpl.eprCategory,
        brandName: brand,
      };
      dataset.push(entry);
      id++;
    }
  }

  return dataset;
}

const DATASET = generateDataset();
export default DATASET;
export { DATASET };
