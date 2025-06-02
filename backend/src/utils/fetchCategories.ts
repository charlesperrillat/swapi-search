import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const fetchCategories = async (): Promise<string[]> => {
  try {
    const res = await axios.get("https://swapi.info/api/", { httpsAgent });
    return Object.keys(res.data);
  } catch (err) {
    console.error("Failed to fetch SWAPI categories:", err);
    return ["people", "films", "planets", "species", "starships", "vehicles"];
  }
};
