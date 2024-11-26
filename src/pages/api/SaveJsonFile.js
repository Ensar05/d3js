import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const filePath = path.join(process.cwd(), 'public', 'nodes.json');
    const data = req.body;

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.status(200).json({ message: 'JSON file saved successfully!' });
    } catch (error) {
      console.error('Error writing JSON file:', error);
      res.status(500).json({ error: 'Failed to save JSON file.' });
    }
  } 
}
