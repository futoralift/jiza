import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS...');
  const remoteCmd = `cd /var/www/jiza && node -e "
    import('jsonwebtoken').then(({ default: jwt }) => {
      const secret = 'jiza-studio-enterprise-secret-key-998877665544332211';
      const token = jwt.sign({ email: 'jizajewellery@gmail.com', role: 'SUPER_ADMIN' }, secret, { expiresIn: '1h' });
      const dummyBuffer = Buffer.from('VPS_MP4_VIDEO_STREAM_DATA_PERSISTENCE');
      const base64Video = 'data:video/mp4;base64,' + dummyBuffer.toString('base64');
      const testCode = 'VPS-VID-' + Date.now();
      
      fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          productCode: testCode,
          title: 'VPS Live Video Test',
          category: 'maharashtrian',
          categoryLabel: 'Maharashtrian',
          subcategory: 'Long Sets',
          subcategoryLabel: 'Long Sets',
          sellingPrice: 1999,
          images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'],
          video: base64Video,
          videoUrl: base64Video,
          video_url: base64Video
        })
      })
      .then(r => r.json())
      .then(data => {
        console.log('VPS Create Res:', data);
        return fetch('http://localhost:5000/api/products');
      })
      .then(r => r.json())
      .then(products => {
        const p = products.find(prod => prod.product_code === testCode);
        console.log('VPS DB Verification after refresh:', { id: p?.id, productCode: p?.product_code, video_url: p?.video_url });
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
    });
  "`;

  conn.exec(remoteCmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => { conn.end(); });
  });
}).connect({ host: '200.141.13.61', port: 22, username: 'root', password: 'Jizajewellerystudio@7' });
