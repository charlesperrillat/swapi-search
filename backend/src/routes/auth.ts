import { ServerRoute } from "@hapi/hapi";

const VALID_USERNAME = "Luke";
const VALID_PASSWORD = "DadSucks";

export const authRoute: ServerRoute = {
  method: "POST",
  path: "/login",
  handler: async (request, h) => {
    const { username, password } = request.payload as {
      username: string;
      password: string;
    };

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const token = Buffer.from(`${username}:${password}`).toString("base64");
      return h.response({ token }).code(200);
    } else {
      return h.response({ message: "Invalid credentials" }).code(401);
    }
  },
};
