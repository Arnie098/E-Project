export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  Learn: undefined;
  Explore: undefined;
  Assistant: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  ModuleDetail: { id: number; title: string };
  Vocabulary: undefined;
  Stories: undefined;
  Media: undefined;
  Events: undefined;
  Repository: undefined;
  Community: undefined;
  Progress: undefined;
};
