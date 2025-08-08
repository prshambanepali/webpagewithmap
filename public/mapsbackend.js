app.post("/save-location", (req, res) => {
  const { user_id, lat, lng } = req.body;

  // Example: Save to database
  db.query(
    "UPDATE users SET origin_lat=?, origin_lng=? WHERE id=?",
    [lat, lng, user_id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});
