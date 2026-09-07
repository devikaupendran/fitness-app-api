import app from "./app.js";

import {
  connectDatabase
} from "./config/database.js";

import {
  env
} from "./config/env.js";

async function bootstrap() {

  try {

    await connectDatabase();

    app.listen(
      env.port,
      () => {

        console.log(
          `Fitness API running on port ${env.port}`
        );

      }
    );

  } catch (error) {

    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
}

bootstrap();