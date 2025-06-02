let categories: string[] = [];

export const setCategories = (newCategories: string[]) => {
  categories = newCategories;
};

export const getCategories = (): string[] => {
  return categories;
};
