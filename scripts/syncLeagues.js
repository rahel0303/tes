const { League, sequelize } = require('../models');
const { getTargetLeagues } = require('../services/sportsDBService');

async function syncLeagues() {
  try {
    const leagues = await getTargetLeagues();
    const mapped = leagues.map(l => ({
      name: l.strLeague,
      country: l.strCountry,
      externalRef: l.idLeague,
      logoUrl: l.strBadge || l.strLogo || null
    }));
    await League.bulkCreate(mapped, { ignoreDuplicates: true });
    console.log(`Synced ${mapped.length} leagues`);
  } catch (err) {
    console.error('Failed to sync leagues', err.message);
    throw err;
  } finally {
    await sequelize.close();
  }
}

syncLeagues();
