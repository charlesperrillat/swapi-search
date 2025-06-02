import Hapi from "@hapi/hapi";
import { fetchCategories } from "./utils/fetchCategories";
import { setCategories } from "./lib/categoryStore";
import { authRoute } from "./routes/auth";
import { searchDeatilsRoute, searchRoute } from "./routes/search";

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // Fetch categories at boot
  const categories = await fetchCategories();
  setCategories(categories);

  server.route([authRoute, searchRoute, searchDeatilsRoute]);

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Bienvenue sur l'API Star Wars !";
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

init();
