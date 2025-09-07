require('dotenv').config();
const { League, sequelize } = require('../models');
const { getTargetLeagues } = require('../services/sportsDBService');

async function syncLeagues() {
  try {
    const leagues = await getTargetLeagues();

    if (!leagues.length) {
      console.warn(
        '[syncLeagues] API OK tapi tidak ada liga terambil. Cek TARGET_IDS dan koneksi DB.'
      );
    }

    const mapped = leagues.map((l) => ({
      name: l.strLeague,
      country: l.strCountry || null,
      externalRef: String(l.idLeague),
      logoUrl: l.strBadge || l.strLogo || null,
      // createdAt/updatedAt akan diisi otomatis jika timestamps=true (default)
    }));

    await League.bulkCreate(mapped, { ignoreDuplicates: true });

    console.log(`[syncLeagues] Synced ${mapped.length} leagues`);
  } catch (err) {
    console.error(
      '[syncLeagues] Failed:',
      err?.response?.status || err.message,
      err?.response?.data || ''
    );
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncLeagues();
