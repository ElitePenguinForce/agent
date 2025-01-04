// Copyright (C) 2022  HordLawk & vitoUwu & PeterStark000

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import client from "./core/client/index.js";
import * as db from "./core/db/index.js";
import BackgroundTasksService from "./services/BackgroundTasksService.js";
import EventService from "./services/EventService.js";
import InteractionService from "./services/InteractionService.js";

async function main() {
  console.time("Bot startup");

  await Promise.all([
    db.connect(),
    BackgroundTasksService.load(),
    InteractionService.load(),
    EventService.load(),
  ]);

  await client.login();
  await client.updateCommands();

  console.timeEnd("Bot startup");
}

main();
