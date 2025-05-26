const meta = {
  name: 'lyrics',
  desc: 'retrieves lyrics for a specified song and artist',
  method: 'get',
  category: 'entertainment',
  params: ['artist', 'song'],
};

async function onStart({ req, res }) {
  const { artist, song } = req.query;

  if (!artist || !song) {
    return res.status(400).json({
      error: 'Missing required parameters: artist and song',
      timestamp: new Date().toISOString(),
      powered_by: 'Iwato Rest API'
    });
  }

  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.lyrics) {
      return res.json({
        lyrics: data.lyrics,
        timestamp: new Date().toISOString(),
        powered_by: 'Iwato Rest API'
      });
    } else {
      return res.status(404).json({
        error: 'Lyrics not found',
        timestamp: new Date().toISOString(),
        powered_by: 'Iwato Rest API'
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      powered_by: 'Iwato Rest API'
    });
  }
}

module.exports = { meta, onStart };