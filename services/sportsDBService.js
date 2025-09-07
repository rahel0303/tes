// services/sportsDBService.js
const axios = require('axios');
const Bottleneck = require('bottleneck');

const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${process.env.SPORTSDB_KEY || 3}`;

// ✅ Alirkan rata: 1 request setiap ~2.1 detik (≈ 28–29/min)
// plus tetap jaga 30/min sebagai hard cap
const limiter = new Bottleneck({
  reservoir: 30,
  reservoirRefreshAmount: 30,
  reservoirRefreshInterval: 60_000,
  maxConcurrent: 1,
  minTime: 2100, // <-- kunci agar tidak burst (1 req/2.1s)
  highWater: 2000, // antrean aman
  strategy: Bottleneck.strategy.BLOCK, // block kalau penuh, bukan overflow
});

// helper sleep
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retry 429/5xx dengan backoff + jeda ekstra untuk 429
async function getWithRetry(url, tries = 4) {
  let attempt = 0;
  while (true) {
    try {
      const { data } = await limiter.schedule(() => axios.get(url, { timeout: 15_000 }));
      return data;
    } catch (e) {
      const st = e?.response?.status;
      attempt++;
      if (!(st === 429 || (st >= 500 && st < 600)) || attempt >= tries) throw e;
      const base = st === 429 ? 15_000 : 1_000;
      const wait = Math.min(30_000, base * 2 ** (attempt - 1)) + Math.random() * 500;
      await sleep(wait);
    }
  }
}

async function getTargetLeagues() {
  const ids = ['4328', '4335', '4332', '4331', '4334', '4346', '4668'];
  const results = [];
  for (const id of ids) {
    const data = await getWithRetry(`${BASE_URL}/lookupleague.php?id=${id}`);
    results.push(data);
  }
  return results.map((r) => r?.leagues?.[0]).filter(Boolean);
}

async function getTeamsByLeague(leagueName) {
  const data = await getWithRetry(
    `${BASE_URL}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`
  );
  return data?.teams || [];
}

async function getPlayersByTeam(teamId) {
  const data = await getWithRetry(
    `https://www.thesportsdb.com/api/v1/json/123/lookup_all_players.php?id=${teamId}`
  );
  return data?.player || [];
}

async function getVenueFanartsByName(venueName) {
  const url = `https://www.thesportsdb.com/api/v1/json/123/searchvenues.php?v=${encodeURIComponent(
    venueName
  )}`;
  const data = await getWithRetry(url);
  const venues = data?.venues || [];
  if (!venues.length) return [];
  const target =
    venues.find((v) => (v?.strVenue || '').trim() === String(venueName).trim()) || venues[0];

  const keys = ['strFanart1', 'strFanart2', 'strFanart3', 'strFanart4'];
  return keys.map((k) => target?.[k]?.trim()).filter(Boolean);
}

module.exports = { getTargetLeagues, getTeamsByLeague, getPlayersByTeam, getVenueFanartsByName };
