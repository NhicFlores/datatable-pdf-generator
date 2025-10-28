// US States with object-based enum pattern (excluding Hawaii and Alaska)
export const USStates = {
  ALABAMA: "Alabama",
  ARIZONA: "Arizona",
  ARKANSAS: "Arkansas", 
  CALIFORNIA: "California",
  COLORADO: "Colorado",
  CONNECTICUT: "Connecticut",
  DELAWARE: "Delaware",
  FLORIDA: "Florida",
  GEORGIA: "Georgia",
  IDAHO: "Idaho",
  ILLINOIS: "Illinois",
  INDIANA: "Indiana",
  IOWA: "Iowa",
  KANSAS: "Kansas",
  KENTUCKY: "Kentucky",
  LOUISIANA: "Louisiana",
  MAINE: "Maine",
  MARYLAND: "Maryland",
  MASSACHUSETTS: "Massachusetts",
  MICHIGAN: "Michigan",
  MINNESOTA: "Minnesota",
  MISSISSIPPI: "Mississippi",
  MISSOURI: "Missouri",
  MONTANA: "Montana",
  NEBRASKA: "Nebraska",
  NEVADA: "Nevada",
  NEW_HAMPSHIRE: "New Hampshire",
  NEW_JERSEY: "New Jersey",
  NEW_MEXICO: "New Mexico",
  NEW_YORK: "New York",
  NORTH_CAROLINA: "North Carolina",
  NORTH_DAKOTA: "North Dakota",
  OHIO: "Ohio",
  OKLAHOMA: "Oklahoma",
  OREGON: "Oregon",
  PENNSYLVANIA: "Pennsylvania",
  RHODE_ISLAND: "Rhode Island",
  SOUTH_CAROLINA: "South Carolina",
  SOUTH_DAKOTA: "South Dakota",
  TENNESSEE: "Tennessee",
  TEXAS: "Texas",
  UTAH: "Utah",
  VERMONT: "Vermont",
  VIRGINIA: "Virginia",
  WASHINGTON: "Washington",
  WEST_VIRGINIA: "West Virginia",
  WISCONSIN: "Wisconsin",
  WYOMING: "Wyoming"
} as const;

// Extract type from the object
export type USState = (typeof USStates)[keyof typeof USStates];

// Array for iteration (backwards compatibility)
export const US_STATES = Object.values(USStates);

// Type guard for runtime validation
export const isUSState = (value: string): value is USState => {
  return Object.values(USStates).includes(value as USState);
};

// Helper function for UI display options
export const getUSStateOptions = () => {
  return Object.entries(USStates).map(([key, value]) => ({
    label: value, // Already properly formatted
    value,
    key, // In case you need the key for other purposes
  }));
};

// Helper to get state by key
export const getStateByKey = (key: keyof typeof USStates): USState => {
  return USStates[key];
};

// Helper to find state key by value
export const getStateKey = (value: string): keyof typeof USStates | undefined => {
  const entry = Object.entries(USStates).find(([, stateValue]) => stateValue === value);
  return entry ? (entry[0] as keyof typeof USStates) : undefined;
};