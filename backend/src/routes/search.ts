import { ServerRoute } from "@hapi/hapi";
import axios from "axios";
import https from "https";
import { getCategories } from "../lib/categoryStore";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const expectedToken = Buffer.from("Luke:DadSucks").toString("base64");

export const searchRoute: ServerRoute = {
  method: "GET",
  path: "/search",
  handler: async (request, h) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (token !== expectedToken) {
      return h.response({ message: "Unauthorized" }).code(401);
    }

    const query = request.query.q as string;

    if (!query) {
      return h.response({ error: "Missing query parameter: q" }).code(400);
    }

    try {
      const categories = getCategories();

      const results = await Promise.all(
        categories.map(async (category) => {
          const res = await axios.get(
            `https://swapi.dev/api/${category}/?search=${query}`,
            {
              httpsAgent,
            }
          );
          return {
            category,
            results: res.data.results,
          };
        })
      );

      return { query, results };
    } catch (error) {
      console.error("SWAPI fetch error:", error);
      return h.response({ error: "Failed to fetch data from SWAPI" }).code(500);
    }
  },
};

export const searchDeatilsRoute: ServerRoute = {
  method: "GET",
  path: `/search/details/{type}/{id}`,
  handler: async (request, h) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (token !== expectedToken) {
      return h.response({ message: "Unauthorized" }).code(401);
    }

    const type = request.params.type;
    const id = request.params.id;

    if (!type) {
      return h.response({ error: "Missing type parameter" }).code(400);
    }
    if (!id) {
      return h.response({ error: "Missing id parameter" }).code(400);
    }
    try {
      const res = await axios.get(`https://swapi.info/api/${type}/${id}`, {
        httpsAgent,
      });
      return res.data;
    } catch (error) {
      console.error("SWAPI fetch error:", error);
      return h.response({ error: "Failed to fetch data from SWAPI" }).code(500);
    }
  },
};
