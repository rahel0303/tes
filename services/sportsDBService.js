const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

async function getTargetLeagues() {
  const res = await fetch(`${BASE_URL}/search_all_leagues.php?s=Soccer`);
  const data = await res.json();
  const leagues = data.countrys || [];
  const targetNames = [
    'English Premier League',
    'Spanish La Liga',
    'Italian Serie A',
    'German Bundesliga',
    'French Ligue 1',
    'Major League Soccer',
    'Saudi Pro League'
  ];
  return leagues.filter(l => targetNames.includes(l.strLeague));
}

module.exports = { getTargetLeagues };
