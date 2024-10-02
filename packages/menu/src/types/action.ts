export interface Action {
  group?: string;
  groupName?: string;
  icon?: React.ReactNode;
  items?: Action[];
  keywords?: string[];
  label?: string;
  shortcut?: string;
  value?: string;
}

export type actionGroup = {
  group?: string;
  value?: string;
};

export type setAction = (actionGroup: actionGroup) => void;
