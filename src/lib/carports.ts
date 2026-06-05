export interface CarportBuilding {
  code: string;
  address: string;
  lat: number;
  lng: number;
  spaces: number[]; // explicit space numbers
  bearing: number;
}

export const CARPORTS: CarportBuilding[] = [
  // 524CC / 2204ND area
  { code: "CP-524CC-A",  address: "Carport 524CC",  lat: 33.7912780926549,   lng: -84.302189272415,    spaces: [114,115,116,117,118,119,120], bearing: 100 },
  { code: "CP-524CC-B",  address: "Carport 524CC",  lat: 33.79127697810434,  lng: -84.30235825157644,  spaces: [127,128,129,130,131,132,133], bearing: 100 },

  // 2178ND / 2194ND area
  { code: "CP-2178ND-A", address: "Carport 2178ND", lat: 33.79114780907114,  lng: -84.30292112213976,  spaces: [140,141,142,143,144,145,146], bearing: 100 },
  { code: "CP-2178ND-B", address: "Carport 2178ND", lat: 33.79112217436563,  lng: -84.30308138412222,  spaces: [153,154,155,156,157,158,159], bearing: 100 },

  // 519CC / 533CC area — 14 spaces split across two buildings
  { code: "CP-519CC-A",  address: "Carport 519CC",  lat: 33.79148012698686,  lng: -84.30115613943988,  spaces: [82,83,84,85,86,87,88],        bearing: 15 },
  { code: "CP-519CC-B",  address: "Carport 519CC",  lat: 33.79159543917286,  lng: -84.30120239011777,  spaces: [89,90,91,92,93,94,95],        bearing: 15 },

  // 546CC / 558CC area — 12 spaces split across two buildings
  { code: "CP-546CC-A",  address: "Carport 546CC",  lat: 33.79227974989038,  lng: -84.30247126679339,  spaces: [99,100,101,102,103,104],       bearing: 15 },
  { code: "CP-546CC-B",  address: "Carport 546CC",  lat: 33.79216606698876,  lng: -84.30243572752532,  spaces: [105,106,107,108,109,110],      bearing: 15 },

  // 515WD / 2158ND area
  { code: "CP-515WD-A",  address: "Carport 515WD",  lat: 33.79106906000388,  lng: -84.30367244413294,  spaces: [166,167,168,169,170,171,172],  bearing: 100 },
  { code: "CP-515WD-B",  address: "Carport 515WD",  lat: 33.791054085947216, lng: -84.30385072529526,  spaces: [179,180,181,182,183,184,185],  bearing: 100 },

  // 583WD area
  { code: "CP-583WD-A",  address: "Carport 583WD",  lat: 33.7934400694025,   lng: -84.30373246892283,  spaces: [7,8,9,10,11],                 bearing: 0 },
  { code: "CP-583WD-B",  address: "Carport 583WD",  lat: 33.793302154180026, lng: -84.30374859009176,  spaces: [18,19,20,21,22],              bearing: 0 },
];

export function carportByCode(code: string): CarportBuilding | undefined {
  return CARPORTS.find((c) => c.code === code);
}

export function seededSpaceNumbers(spaces: number[]): string[] {
  return spaces.map(String);
}
