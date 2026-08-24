import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const conn = new Client();

const config = {
  host: '200.141.13.61',
  port: 22,
  username: 'root',
  password: 'Jizajewellerystudio@7',
  readyTimeout: 20000
};

conn.on('ready', () => {
  console.log('SSH Connected as root for package deployment!');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    // Local files to upload
    const filesToUpload = [
      {
        local: path.join(__dirname, '../src/components/AdminPanel.jsx'),
        remote: '/var/www/jiza/src/components/AdminPanel.jsx'
      },
      {
        local: path.join(__dirname, '../src/components/admin/tabs/PremiumFeaturesTab.jsx'),
        remote: '/var/www/jiza/src/components/admin/tabs/PremiumFeaturesTab.jsx'
      }
    ];

    let completed = 0;

    filesToUpload.forEach(({ local, remote }) => {
      sftp.fastPut(local, remote, (err) => {
        if (err) {
          console.error(`Failed to upload ${remote}:`, err);
        } else {
          console.log(`✅ Uploaded ${remote}`);
        }
        completed++;
        if (completed === filesToUpload.length) {
          // Rebuild frontend on VPS
          const cmd = `
            cd /var/www/jiza
            npm run build
            pm2 reload jiza-backend || pm2 restart jiza-backend
          `;
          conn.exec(cmd, (err, stream) => {
            if (err) {
              console.error('Exec error:', err);
              conn.end();
              return;
            }
            stream.on('close', (code) => {
              console.log(`Build & reload on VPS finished with code ${code}`);
              conn.end();
            }).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
          });
        }
      });
    });
  });
}).connect(config);
