const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info', // Niveau minimum des logs (info, warn, error, etc.)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Affiche les logs dans la console
    new winston.transports.File({ filename: path.join(__dirname, 'logs', 'app.log') }) // Sauvegarde dans un fichier
  ]
});

// Export du logger
module.exports = logger;