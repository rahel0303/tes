require('dotenv').config();
const { League, Team, sequelize } = require('../models');
const { getTargetLeagues, getTeamsByLeague } = require('../services/sportsDBService');

async function syncTeams() {
  try {
    const leagues = await getTargetLeagues();

    for (const league of leagues) {
      // cari league di DB via externalRef = idLeague dari SportsDB
      const dbLeague = await League.findOne({
        where: { externalRef: String(league.idLeague) },
      });

      if (!dbLeague) {
        console.warn(`[warn] League belum ada di DB: ${league.strLeague} (${league.idLeague})`);
        continue;
      }

      const teams = await getTeamsByLeague(league.strLeague);
      if (!teams?.length) {
        console.warn(`[warn] Tidak ada tim untuk liga ${league.strLeague}`);
        continue;
      }

      const mapped = teams.map((t) => ({
        leagueId: dbLeague.id, // foreign key dari DB
        name: t.strTeam?.trim() || null,
        shortName: t.strTeamShort || (t.strTeam ? t.strTeam.slice(0, 12) : null),
        logoUrl: t.strBadge || null, // pakai strBadge
        foundedYear: t.intFormedYear ? Number(t.intFormedYear) : null,
        country: t.strCountry || null,
        stadiumName: t.strStadium || null,
        stadiumCity: t.strLocation || null, // isi dengan strLocation
        stadiumCapacity: t.intStadiumCapacity ? Number(t.intStadiumCapacity) : null,
        externalRef: String(t.idTeam),
        description: t.strDescriptionEN || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await Team.bulkCreate(mapped, {
        updateOnDuplicate: [
          'leagueId',
          'name',
          'shortName',
          'badgeUrl',
          'logoUrl',
          'foundedYear',
          'country',
          'stadiumName',
          'stadiumCity',
          'stadiumCapacity',
          'description',
          'updatedAt',
        ],
      });

      console.log(`[sync] ${mapped.length} teams dari ${league.strLeague}`);
    }
  } catch (err) {
    console.error('Failed to sync teams:', err.message);
  } finally {
    await sequelize.close();
  }
}

syncTeams();
