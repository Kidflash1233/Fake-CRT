// Minimal health endpoint to verify serverless env is wired.
// Does NOT expose the key; just reports if it exists.

export default function handler(req, res) {
    const configured = Boolean(process.env.AI_GATEWAY_API_KEY);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, configured });
}

