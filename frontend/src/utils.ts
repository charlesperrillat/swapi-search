export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatKeyName = (key: string) => {
  if (!key) return "";
  const formattedKeyName =
    key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
  return formattedKeyName;
};

export const getIdFromUrl = (url: string): string => {
  const urlParts = url.split("/").filter(Boolean);
  return urlParts[urlParts.length - 1];
};
