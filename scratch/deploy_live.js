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
  readyTimeout: 30000
};

console.log('🚀 Connecting to VPS at 200.141.13.61...');

conn.on('ready', () => {
  console.log('✅ SSH Connected as root!');

  // First ensure all remote directories exist in one clean command
  const mkdirCmd = 'mkdir -p /var/www/jiza/src/components/admin/modals /var/www/jiza/src/components/admin/tabs /var/www/jiza/server';
  
  conn.exec(mkdirCmd, (err, stream) => {
    if (err) {
      console.error('❌ mkdir error:', err);
      conn.end();
      return;
    }

    stream.on('close', () => {
      console.log('📁 Directories verified on VPS. Opening SFTP session...');
      
      conn.sftp((sftpErr, sftp) => {
        if (sftpErr) {
          console.error('❌ SFTP error:', sftpErr);
          conn.end();
          return;
        }

        const projectRoot = path.join(__dirname, '..');
        const remoteBase = '/var/www/jiza';

        const filesToUpload = [
          '.env',
          'package.json',
          'src/main.jsx',
          'src/config.js',
          'vite.config.js',
          'src/components/ProductDetailModal.jsx',
          'src/components/MobileNavDrawer.jsx',
          'src/components/ExchangePolicyModal.jsx',
          'src/components/ContactUsModal.jsx',
          'src/components/Header.jsx',
          'src/components/HomeView.jsx',
          'src/components/SearchView.jsx',
          'src/components/CancellationPolicyView.jsx',
          'src/components/AdminPanel.jsx',
          'src/components/admin/modals/AddProductModal.jsx',
          'src/components/admin/modals/EditProductModal.jsx',
          'src/components/RentalGalleryView.jsx',
          'src/components/admin/tabs/RentalGalleryTab.jsx',
          'src/components/WishlistDrawer.jsx',
          'src/components/ProfileView.jsx',
          'src/components/admin/tabs/ProductsTab.jsx',
          'src/App.jsx',
          'src/index.css',
          'index.html',
          'public/robots.txt',
          'public/sitemap.xml',
          'server/index.js',
          'server/db/database.js',
          'server/db/schema_pg.sql'
        ];

        let index = 0;

        function uploadNext() {
          if (index >= filesToUpload.length) {
            console.log(`\n📦 All ${filesToUpload.length} files uploaded successfully to VPS!`);
            sftp.end();
            runBuildAndReload();
            return;
          }

          const relPath = filesToUpload[index];
          const localPath = path.join(projectRoot, relPath);
          const remotePath = path.posix.join(remoteBase, relPath.replace(/\\/g, '/'));

          if (!fs.existsSync(localPath)) {
            console.warn(`⚠️ Local file not found: ${localPath}`);
            index++;
            uploadNext();
            return;
          }

          const fileData = fs.readFileSync(localPath);
          
          sftp.writeFile(remotePath, fileData, (writeErr) => {
            if (writeErr) {
              console.error(`❌ Error writing ${relPath}:`, writeErr);
            } else {
              console.log(`✅ [${index + 1}/${filesToUpload.length}] Uploaded: ${relPath}`);
            }
            index++;
            uploadNext();
          });
        }

        uploadNext();
      });
    }).resume();
  });
}).on('error', (err) => {
  console.error('❌ SSH Connection error:', err.message);
});

function runBuildAndReload() {
  const buildCmd = 'cd /var/www/jiza && npm install && sed -i "/client_max_body_size/d" /etc/nginx/nginx.conf 2>/dev/null; sed -i "/http {/a \\    client_max_body_size 50M;" /etc/nginx/nginx.conf 2>/dev/null && nginx -t && systemctl reload nginx 2>/dev/null; npm run build && pm2 reload jiza-backend || pm2 restart jiza-backend && pm2 status';
  console.log('🔨 Running npm install, npm run build, Nginx config & reloading PM2 on VPS...');

  conn.exec(buildCmd, (err, stream) => {
    if (err) {
      console.error('❌ Build command error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log(`\n🎉 Deployment & Build completed with exit code: ${code}`);
      conn.end();
      process.exit(0);
    });

    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}

conn.connect(config);
