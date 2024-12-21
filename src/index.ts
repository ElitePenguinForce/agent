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

import { GatewayIntentBits, Partials } from "discord.js";
import * as db from "./db/index.js";
import Agent from "./lib/client.js";

async function main() {
  console.log(`
+++++++++*******##**##*+==-------=+*###*+**********#*
++=====++*******##****#*+=+*#########%#++**********#*
+====++++++*#****#*******%#++********+=+##*###%##**#*
=====+++++++++*#*****###****************++#%*+=-----=
=====+++++++++++*######*******************+**-==+*###
=======++++++++***%##%##*******************=#####*+=-
+===++******+++***%%#%%%%%#***#####*********+#***++++
-+**+++***###*+++*#%#%%%%#%%%%#*************+#*+++***
-==---++**-----------=*%%%##%%%###**********+#**+++**
++=-----*=========----=%%%###%%%#%#####*****+#**++++*
+++-----++===========--+%%%###%%#%########***+==+*++*
***=-----*+==============+%%##%##**********+#++++=+*+
+---------=*++======++====--++==+#********-:-+++++==*
-==---------+*++=======+========--#*********+++++++=-
-=-----------*##*+++====+++++++==+#*******#+*+++++++=
+------------**#%%%#**++++++++**#**********++++++++++
+=---::-----=%%*%%%#=-=======#%##********#++*++++++++
+=::::::-+%@@%+-*%%=--------*%###%@%####%@#*+++++++++
++:::=#%#%@@@%-:.++--------=###%%#%%%%%###%%@#+++++++
++-:+##%@@%@%%+:..-=::-----==#%%%%@%%%%%%%%%#%#***##%
++-:##%@@%%@%%#-:=%%#*#*:.:=%%%%@@%%%%%%%%%%%%%%@%%##
++=-%#%@%%@@%%%*-#@@@@@@+-*%%%@@@@%%%%%%%%%%%%%%%%#**
+*=*#%%@%%%@@@%%++@@@@@@++@%%@@@%%%%%%%%@@@@@@@@%%%#*
+**##%@@%%%@@%%%#=#@@@%=*@%%@@@%%%%%%%@@@@@@@@@@@@%#*
+*##%%@%%%%@@@%%%#@@@@%*@%@@@@%%%%%%%@@@@@@@@@@@@@#**
**#%%@@%%%%@@@%%%@@@@@@@%%*=#%%%%%%%%@@@@@@@@@@%@#***
**%%%@@@%%%@@@@%%%%@@@@%+*#*##%%%%%%@@@@@@@@@@%%*****
*%%%%@@@%%%##*:+@%%@@@@++%####*#%%%@@@@@@@@@@%%#*****
*@%%%@@%%%@%#=-@@%%%%%%%%@@@%%###%@@@@@@@@@%%%*******
`);
  console.time("Bot startup");

  console.log("Connecting to database...");
  await db.connect();
  console.log("Connected to database");

  const client = new Agent({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.GuildMember, Partials.Channel],
    allowedMentions: { repliedUser: false },
  });

  await client.login();
  await client.updateCommands();

  console.timeEnd("Bot startup");
}

main();
