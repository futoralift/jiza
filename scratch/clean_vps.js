import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cd /var/www/jiza && node -e "import('./server/db/database.js').then(async m => { const db = await m.getDb(); await db.run('DELETE FROM products WHERE product_code LIKE ?', ['%VID%']); console.log('VPS DB Cleaned'); process.exit(0); });"`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => { conn.end(); });
  });
}).connect({ host: '200.141.13.61', port: 22, username: 'root', password: 'Jizajewellerystudio@7' });
