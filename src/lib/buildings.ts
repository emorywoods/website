export interface Building {
  code: string;       // Short label, e.g. "508 WD"
  address: string;    // Full address, e.g. "508 Webster Drive"
  lat: number;
  lng: number;
  unitCount: number;  // Number of units in building (for roster seeding)
}

export const BUILDINGS: Building[] = [
  // ── Powell Lane (PL) ──────────────────────────────────────────────────────
  { code: "2057 PL", address: "2057 Powell Lane",         lat: 33.79141945771505,  lng: -84.30532740426031, unitCount: 12 },
  { code: "2065 PL", address: "2065 Powell Lane",         lat: 33.79132011233578,  lng: -84.30485262996007, unitCount: 12 },
  { code: "2094 PL", address: "2094 Powell Lane",         lat: 33.79180756407049,  lng: -84.30369599850968, unitCount: 8  },
  { code: "2101 PL", address: "2101 Powell Lane",         lat: 33.79132200794085,  lng: -84.30338452037543, unitCount: 8  },
  { code: "2119 PL", address: "2119 Powell Lane",         lat: 33.79139333911013,  lng: -84.30274146076891, unitCount: 8  },
  { code: "2122 PL", address: "2122 Powell Lane",         lat: 33.79190111200188,  lng: -84.30256639302523, unitCount: 8  },

  // ── Webster Drive (WD) ────────────────────────────────────────────────────
  { code: "508 WD",  address: "508 Webster Drive",        lat: 33.79072684930942,  lng: -84.30458084702884, unitCount: 12 },
  { code: "514 WD",  address: "514 Webster Drive",        lat: 33.79093397635977,  lng: -84.30468347045323, unitCount: 12 },
  { code: "518 WD",  address: "518 Webster Drive",        lat: 33.79116828237644,  lng: -84.30468008726332, unitCount: 8  },
  { code: "515 WD",  address: "515 Webster Drive",        lat: 33.79114736317122,  lng: -84.30414315387560, unitCount: 8  },
  { code: "539 WD",  address: "539 Webster Drive",        lat: 33.79181270013257,  lng: -84.30414190898860, unitCount: 8  },
  { code: "551 WD",  address: "551 Webster Drive",        lat: 33.79237238157857,  lng: -84.30407312744806, unitCount: 8  },
  { code: "583 WD",  address: "583 Webster Drive",        lat: 33.79301371464300,  lng: -84.30395511025152, unitCount: 8  },

  // ── North Decatur Road (ND) ───────────────────────────────────────────────
  { code: "2148 ND", address: "2148 North Decatur Road",  lat: 33.79055721094744,  lng: -84.30459889070526, unitCount: 4  },
  { code: "2158 ND", address: "2158 North Decatur Road",  lat: 33.79071477307563,  lng: -84.30378911469289, unitCount: 8  },
  { code: "2178 ND", address: "2178 North Decatur Road",  lat: 33.79081693083887,  lng: -84.30323991021177, unitCount: 8  },
  { code: "2194 ND", address: "2194 North Decatur Road",  lat: 33.79090503009456,  lng: -84.30265687382713, unitCount: 8  },
  { code: "2204 ND", address: "2204 North Decatur Road",  lat: 33.79096876141711,  lng: -84.30204902735356, unitCount: 8  },

  // ── Myrtle Lane (ML) ──────────────────────────────────────────────────────
  { code: "2095 ML", address: "2095 Myrtle Lane",         lat: 33.79237178073335,  lng: -84.30366831356070, unitCount: 8  },
  { code: "2094 ML", address: "2094 Myrtle Lane",         lat: 33.79296837398195,  lng: -84.30361591697474, unitCount: 8  },
  { code: "2115 ML", address: "2115 Myrtle Lane",         lat: 33.79240689183141,  lng: -84.30274695912225, unitCount: 8  },
  { code: "2114 ML", address: "2114 Myrtle Lane",         lat: 33.79301231140588,  lng: -84.30294883095864, unitCount: 8  },

  // ── Clairmont Circle (CC) ─────────────────────────────────────────────────
  { code: "519 CC",  address: "519 Clairmont Circle",     lat: 33.79126221798976,  lng: -84.30136955919461, unitCount: 8  },
  { code: "524 CC",  address: "524 Clairmont Circle",     lat: 33.79139426049380,  lng: -84.30193625435983, unitCount: 8  },
  { code: "533 CC",  address: "533 Clairmont Circle",     lat: 33.79169633441826,  lng: -84.30149361136036, unitCount: 8  },
  { code: "546 CC",  address: "546 Clairmont Circle",     lat: 33.79199154002301,  lng: -84.30216845719335, unitCount: 8  },
  { code: "551 CC",  address: "551 Clairmont Circle",     lat: 33.79229973479048,  lng: -84.30172615216094, unitCount: 8  },
  { code: "558 CC",  address: "558 Clairmont Circle",     lat: 33.79250221459387,  lng: -84.30234733298504, unitCount: 8  },
  { code: "567 CC",  address: "567 Clairmont Circle",     lat: 33.79279933705814,  lng: -84.30189456118848, unitCount: 8  },
  { code: "584 CC",  address: "584 Clairmont Circle",     lat: 33.79310678316485,  lng: -84.30257233848583, unitCount: 8  },
  { code: "589 CC",  address: "589 Clairmont Circle",     lat: 33.79332016017486,  lng: -84.30209333279049, unitCount: 8  },
];

export function buildingByCode(code: string): Building | undefined {
  return BUILDINGS.find((b) => b.code === code);
}

export function buildingByAddress(address: string): Building | undefined {
  return BUILDINGS.find((b) => b.address === address);
}

export function seededUnitNumbers(count: number): string[] {
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, "0"));
}
