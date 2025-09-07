require('dotenv').config();

const { Op } = require('sequelize');
const { Team, StadiumImage, sequelize } = require('../models');
const { getVenueFanartsByName } = require('../services/sportsDBService');

async function syncForTeam(team) {
  if (!team.stadiumName) {
    console.warn(`[skip] ${team.name}: stadiumName kosong`);
    return { inserted: 0 };
  }

  const fanarts = await getVenueFanartsByName(team.stadiumName);
  if (!fanarts.length) {
    console.log(`[info] ${team.name}: fanart tidak ditemukan untuk "${team.stadiumName}"`);
    return { inserted: 0 };
  }

  let order = 1;
  let inserted = 0;
  for (const url of fanarts) {
    const [, created] = await StadiumImage.findOrCreate({
      where: { teamId: team.id, imageUrl: url },
      defaults: { source: 'TheSportsDB:fanart', sortOrder: order },
    });
    if (created) inserted++;
    order++;
  }

  return { inserted };
}

async function run() {
  const args = process.argv.slice(2);
  const getArg = (key) => {
    const hit = args.find((a) => a.startsWith(`--${key}=`));
    return hit ? hit.split('=')[1] : null;
  };

  const teamIdArg = getArg('teamId');
  const limit = Number(getArg('limit')) || 1000;

  await sequelize.authenticate();

  let where = { stadiumName: { [Op.ne]: null } };
  let teams = [];

  if (teamIdArg) {
    teams = await Team.findAll({
      where: { id: Number(teamIdArg) },
      attributes: ['id', 'name', 'stadiumName'],
    });
  } else {
    teams = await Team.findAll({
      where,
      attributes: ['id', 'name', 'stadiumName'],
      order: [['id', 'ASC']],
      limit,
    });
  }

  console.log(`[start] sync stadium images for ${teams.length} team(s)`);

  let total = 0;
  for (const t of teams) {
    try {
      console.log(`→ ${t.id} ${t.name} (stadium="${t.stadiumName}")`);
      const { inserted } = await syncForTeam(t);
      total += inserted;
    } catch (e) {
      console.error(`[error] ${t.name}:`, e?.message || e);
    }
  }

  console.log(`[done] Inserted ${total} stadium image(s) total`);
  await sequelize.close();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await sequelize.close();
  process.exit(1);
});
