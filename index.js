const express = require('express');
const fs = require('fs');
const path = require('path');
const set = require('./settings');
const chalk = require('chalk');

(async () => {
  const app = express();
  const PORT = process.env.PORT || 4000;

  const logger = {
    info: (message) => console.log(chalk.dim.blue('•') + chalk.dim(' info  - ') + message),
    ready: (message) => console.log(chalk.dim.green('•') + chalk.dim(' ready - ') + message),
    warn: (message) => console.log(chalk.dim.yellow('•') + chalk.dim(' warn  - ') + message),
    error: (message) => console.log(chalk.dim.red('•') + chalk.dim(' error - ') + message),
    event: (message) => console.log(chalk.dim.cyan('•') + chalk.dim(' event - ') + message),
  };

  app.set('trust proxy', true);
  app.set('json spaces', 2);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/', express.static(path.join(__dirname, 'docs')));

  logger.info('Starting server initialization...');

  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      if (data && typeof data === 'object') {
        const statusCode = res.statusCode || 200;
        const responseData = {
          status: data.status,
          statusCode,
          creator: (set.author || '').toLowerCase(),
          ...data,
        };
        return originalJson.call(this, responseData);
      }
      return originalJson.call(this, data);
    };
    next();
  });

  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  function loadEndpointsFromDirectory(directory, categoryPath = '') {
    let endpoints = [];
    const fullPath = path.join(__dirname, directory);

    if (!fs.existsSync(fullPath)) {
      logger.warn(`Directory not found: ${fullPath}`);
      return endpoints;
    }

    logger.info(`Scanning directory: ${directory}...`);
    for (const item of fs.readdirSync(fullPath)) {
      const itemPath = path.join(fullPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const subCategory = categoryPath ? `${categoryPath}/${item}` : item;
        logger.info(`Found subdirectory: ${item}`);
        endpoints = endpoints.concat(
          loadEndpointsFromDirectory(path.join(directory, item), subCategory)
        );
      } else if (stats.isFile() && item.endsWith('.js')) {
        try {
          const mod = require(itemPath);
          if (mod && typeof mod.onStart === 'function') {
            const name = item.replace('.js', '');
            const route = `/api/${name}`;

            app.all(route, async (req, res, next) => {
              try {
                await mod.onStart({ req, res });
              } catch (err) {
                next(err);
              }
            });

            let displayPath = `/api/${name}`;
            if (Array.isArray(mod.meta?.params) && mod.meta.params.length) {
              displayPath += '?' + mod.meta.params.map(p => `${p}=`).join('&');
            } else if (mod.meta.path) {
              const [pathPart, queryPart] = mod.meta.path.split('?');
              if (pathPart !== `/${name}`) {
                logger.warn(`meta.path path part does not match endpoint name for ${name}: expected /${name}, got ${pathPart}`);
              }
              displayPath += queryPart ? `?${queryPart}` : '';
            }

            const cat = mod.meta.category || (categoryPath || 'Other');
            let bucket = endpoints.find(e => e.name === cat);
            if (!bucket) {
              bucket = { name: cat, items: [] };
              endpoints.push(bucket);
            }

            bucket.items.push({
              [mod.meta.name || name]: {
                desc: mod.meta.desc || mod.meta.description || 'No description provided',
                path: displayPath,
              },
            });

            logger.ready(
              `${chalk.green(route)} ${chalk.dim('(')}${chalk.cyan(cat)}${chalk.dim(')')}`
            );
          }
        } catch (error) {
          logger.error(`Failed to load module ${itemPath}: ${error.message}`);
        }
      }
    }
    return endpoints;
  }

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
  });

  logger.info('Loading API endpoints...');
  const allEndpoints = loadEndpointsFromDirectory('api');
  logger.ready(
    `Loaded ${allEndpoints.reduce((t, c) => t + c.items.length, 0)} endpoints`
  );

  app.get('/endpoints', (req, res) => {
    const total = allEndpoints.reduce((t, c) => t + c.items.length, 0);
    res.json({ status: true, count: total, endpoints: allEndpoints });
  });

  app.get('/set', (req, res) => {
    res.json({ status: true, ...set });
  });

  app.use((req, res) => {
    logger.info(`404: ${req.method} ${req.path}`);
    res.status(404).sendFile(path.join(__dirname, 'docs', 'err', '404.html'));
  });

  app.use((err, req, res, next) => {
    logger.error(`500: ${err.message}`);
    res.status(500).sendFile(path.join(__dirname, 'docs', 'err', '500.html'));
  });

  app.listen(PORT, () => {
    logger.ready(`Server started successfully`);
    logger.info(`Local:   ${chalk.cyan(`http://localhost:${PORT}`)}`);

    try {
      const { networkInterfaces } = require('os');
      const nets = networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            logger.info(
              `Network: ${chalk.cyan(`http://${net.address}:${PORT}`)}`
            );
          }
        }
      }
    } catch (error) {
      logger.warn(`Cannot detect network interfaces: ${error.message}`);
    }

    logger.info(`${chalk.dim('Ready for connections')}`);
  });

  module.exports = app;
})();