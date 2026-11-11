export default function handler(req, res) {
  res.status(200).json({ version: 'v2-birlik-bot', time: Date.now() });
}
