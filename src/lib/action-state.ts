export type ActionState = {
  error?: string;
  success?: string;
  id?: string;
  fields?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};
