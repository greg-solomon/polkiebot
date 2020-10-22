export type LocationRole = {
  [name in LocationCode]: {
    roleId: string;
    text: string;
  };
};

export type LocationCode = "usw" | "use" | "eu" | "as" | "oce" | "sam" | "saf";

export type ReputationRoleKey =
  | "merchantSix"
  | "merchantFive"
  | "merchantFour"
  | "merchantThree"
  | "merchantTwo"
  | "merchantOne";
