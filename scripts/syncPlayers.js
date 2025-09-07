/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const { Team, Player } = require('../models');

// ===================== CONFIG =====================
const BASE = process.env.ALLSPORTS_BASE || 'https://apiv2.allsportsapi.com/football';
const KEY =
  process.env.ALLSPORTS_API_KEY ||
  'd8d60662060e6a1664ff545f0ef3636de0bf8c9322f4a1bf72db18f34d41ffe7';

// AllSports leagueId → DB internal leagueId (lihat screenshot kamu: 1..7)
const LEAGUE_MAP = {
  152: 1, // English Premier League
  302: 2, // Spanish La Liga
  207: 3, // Italian Serie A
  175: 4, // German Bundesliga
  168: 5, // French Ligue 1
  332: 6, // MLS
  278: 7, // Saudi Pro League
};

// daftar liga yang akan ditarik dari AllSports
const ALLSPORTS_LEAGUES = [278, 152, 302, 207, 175, 168, 332];

// ===================== OVERRIDES (fallback by teamId) =====================
// Format: { dbName: 'Nama tepat di DB.Teams.name', apiTeamId: number }
const OVERRIDES = [
  { dbName: 'Al-Najma Unaizah', apiTeamId: 12632 },
  { dbName: 'Sporting Kansas City', apiTeamId: 7967 },
  { dbName: 'San Jose Earthquakes', apiTeamId: 7966 },
  { dbName: 'New York Red Bulls', apiTeamId: 7958 },
  { dbName: 'New England Revolution', apiTeamId: 7956 },
  { dbName: 'Angers', apiTeamId: 3827 },
  { dbName: 'Lyon', apiTeamId: 3815 },
  { dbName: 'Marseille', apiTeamId: 83 },
  { dbName: 'Paris SG', apiTeamId: 100 },
  { dbName: 'Bayern Munich', apiTeamId: 72 },
  { dbName: 'Borussia Monchengladbach', apiTeamId: 77 },
  { dbName: 'Hamburg', apiTeamId: 3912 },
  { dbName: 'Mainz', apiTeamId: 3939 },
  { dbName: 'Inter Milan', apiTeamId: 79 },
  { dbName: 'Athletic Bilbao', apiTeamId: 7258 },
  { dbName: 'Deportivo Alaves', apiTeamId: 7275 },
  { dbName: 'Leganes', apiTeamId: 7266 },
];

// ===================== HELPERS =====================

// hapus diakritik TANPA package
function stripDiacritics(str = '') {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const STOPWORDS = new Set([
  'fc',
  'cf',
  'ac',
  'sc',
  'sv',
  'afc',
  'club',
  'clubde',
  'clubdefutbol',
  'futbol',
  'football',
  'de',
  'ud',
  'utd',
  'cd',
  'c.f.',
  's.c.',
  'u.d.',
  'u.t.d',
  'c.d.',
]);

function normalizeName(s = '') {
  let x = stripDiacritics(String(s).toLowerCase());
  x = x
    .replace(/&/g, ' and ')
    .replace(/[-–—.,']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = x.split(' ').filter((w) => !STOPWORDS.has(w));
  return parts.join(' ');
}

function toDateOrNull(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIntOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function getTeamsWithPlayers(leagueId) {
  const url = `${BASE}/?met=Teams&leagueId=${leagueId}&APIkey=${KEY}`;
  const { data } = await axios.get(url, { timeout: 25_000 });
  return data?.result || [];
}

async function getTeamWithPlayersById(teamId) {
  const url = `${BASE}/?met=Teams&teamId=${teamId}&APIkey=${KEY}`;
  const { data } = await axios.get(url, { timeout: 25_000 });
  // response tetap array "result" (1 tim), samakan bentuknya
  return Array.isArray(data?.result) ? data.result[0] : null;
}

// ===================== MATCH (NO FIRST-WORD FALLBACK) =====================
// HANYA exact match setelah normalisasi.
// Jika tidak cocok → return null (biarkan unmatched).
function matchTeamId(dbTeams, apiTeamName) {
  const target = normalizeName(apiTeamName);
  const hit = dbTeams.find((t) => normalizeName(t.name) === target);
  return hit ? hit.id : null;
}

function slug(s = '') {
  return normalizeName(s).replace(/\s+/g, '-');
}

// ===================== UPSERT HELPERS =====================
async function upsertPlayersAndCoaches({ dbTeamId, apiTeam }) {
  if (!dbTeamId || !apiTeam) return;

  // ---- Players ----
  const players = Array.isArray(apiTeam.players) ? apiTeam.players : [];
  for (const p of players) {
    try {
      await Player.upsert({
        fullName: p.player_name || null,
        nationality: p.player_country || null,
        primaryPosition: p.player_type || null, // Goalkeepers/Defenders/Midfielders/Forwards
        thumbUrl: p.player_image || null,
        externalRef: String(p.player_key), // wajib unik
        bornAt: toDateOrNull(p.player_birthdate),
        shirtNumber: toIntOrNull(p.player_number),
        teamId: dbTeamId,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
    } catch (e) {
      console.error('[player upsert failed]', p?.player_name, e.message);
    }
  }

  // ---- Coach (as Manager) ----
  const coaches = Array.isArray(apiTeam.coaches) ? apiTeam.coaches : [];
  for (const c of coaches) {
    const ext = `coach:${apiTeam.team_key}:${slug(c.coach_name || 'unknown')}`;
    try {
      await Player.upsert({
        fullName: c.coach_name || 'Unknown',
        nationality: c.coach_country || null,
        primaryPosition: 'Manager',
        thumbUrl: null,
        externalRef: ext,
        bornAt: null,
        shirtNumber: null,
        teamId: dbTeamId,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
    } catch (e) {
      console.error('[coach upsert failed]', c?.coach_name, e.message);
    }
  }
}

async function syncTeamByApiTeamId(dbTeamId, apiTeamId) {
  try {
    const apiTeam = await getTeamWithPlayersById(apiTeamId);
    if (!apiTeam) {
      console.warn(`[fallback] teamId=${apiTeamId} tidak ditemukan di API`);
      return false;
    }
    await upsertPlayersAndCoaches({ dbTeamId, apiTeam });
    console.log(`[fallback] sukses sync teamId=${apiTeamId} → dbTeamId=${dbTeamId}`);
    return true;
  } catch (e) {
    console.error('[fallback] gagal', apiTeamId, e.message);
    return false;
  }
}

// ===================== MAIN =====================
async function run() {
  for (const asLeagueId of ALLSPORTS_LEAGUES) {
    const dbLeagueId = LEAGUE_MAP[asLeagueId];
    if (!dbLeagueId) {
      console.warn(`[skip] map DB untuk AllSports league=${asLeagueId} belum ada`);
      continue;
    }

    console.log(`\n=== Sync AllSports=${asLeagueId} → DB.leagueId=${dbLeagueId} ===`);
    const apiTeams = await getTeamsWithPlayers(asLeagueId);

    const dbTeams = await Team.findAll({ where: { leagueId: dbLeagueId } });
    console.log(`DB teams: ${dbTeams.length}, API teams: ${apiTeams.length}`);

    // Buat index untuk DB teams by normalized name
    const dbByNorm = new Map(dbTeams.map((t) => [normalizeName(t.name), t.id]));

    // Track tim yang SUDAH sukses via endpoint liga
    const successDbTeamIds = new Set();

    // 1) Jalankan via endpoint liga
    for (const apiTeam of apiTeams) {
      const dbTeamId = matchTeamId(dbTeams, apiTeam.team_name);
      if (!dbTeamId) {
        console.warn(
          `[unmatched] league=${asLeagueId} teamKey=${apiTeam.team_key} name="${apiTeam.team_name}"`
        );
        continue;
      }
      await upsertPlayersAndCoaches({ dbTeamId, apiTeam });
      successDbTeamIds.add(dbTeamId);
    }

    // 2) Fallback untuk tim-tim khusus (OVERRIDES) di liga ini:
    //    - Cari override yang nama DB-nya ada di daftar DB teams liga ini
    //    - Hanya jalankan kalau tim itu BELUM sukses di langkah (1)
    const relevantOverrides = OVERRIDES.filter((o) => dbByNorm.has(normalizeName(o.dbName)));
    for (const o of relevantOverrides) {
      const dbTeamId = dbByNorm.get(normalizeName(o.dbName));
      if (successDbTeamIds.has(dbTeamId)) continue; // sudah sukses dari langkah (1)
      await syncTeamByApiTeamId(dbTeamId, o.apiTeamId);
    }
  }

  console.log('\n=== Selesai sync players & coaches (dengan fallback khusus) ===');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
