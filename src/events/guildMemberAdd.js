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

module.exports = {
    name: 'guildMemberAdd',
    execute: async member => {
        const guestModel = require('../models/guest.js');
        await guestModel.updateOne({_id: member.id}, {$set: {expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)}}, {
            upsert: true,
            setDefaultsOnInsert: true,
        });
    },
};