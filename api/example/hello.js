// /endpoints/hello.js
const meta = {
  name: 'Hello',               // Unique endpoint name
  desc: 'Returns a greeting message',
  category: 'Example',        // Sidebar category
  params: ['name'],            // Query or body parameters
};

async function onStart({ req, res }) {
  const { name } = req.query;
  const greeting = name ? `Hello, ${name}!` : 'Hello, World!';

  return res.json({
    message: greeting,
    timestamp: new Date().toISOString(),
    powered_by: 'Iwato Rest API'
  });
}

module.exports = { meta, onStart };