require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Route aliases
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ─── BOOKINGS ────────────────────────────────────────────────────────────────

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
    const newBooking = {
        booking_id: 'b' + Date.now(),
        ...req.body
    };

    const { data, error } = await supabase.from('bookings').insert([newBooking]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data ? data[0] : newBooking);
});

// Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
    const bookingId = req.params.id;
    const { error } = await supabase.from('bookings').delete().eq('booking_id', bookingId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Booking deleted successfully" });
});

// Update a booking (Drag & Drop)
app.put('/api/bookings/:id', async (req, res) => {
    const bookingId = req.params.id;
    const { date, start_time } = req.body;
    
    const updates = {};
    if (date) updates.date = date;
    if (start_time) updates.start_time = start_time;

    const { data, error } = await supabase.from('bookings').update(updates).eq('booking_id', bookingId).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ? data[0] : updates);
});

// ─── BLOCKED SLOTS ────────────────────────────────────────────────────────────

// Get blocked slots
app.get('/api/blocked', async (req, res) => {
    const { data, error } = await supabase.from('blocked_slots').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Block a slot
app.post('/api/blocked', async (req, res) => {
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ error: "date and time required" });

    // Check if exists
    const { data: existing } = await supabase.from('blocked_slots').select('*').eq('date', date).eq('time', time);
    if (existing && existing.length > 0) return res.status(201).json({ message: "Slot already blocked", date, time });

    const { error } = await supabase.from('blocked_slots').insert([{ date, time }]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: "Slot blocked", date, time });
});

// Unblock a slot
app.delete('/api/blocked', async (req, res) => {
    const { date, time } = req.body;
    const { error } = await supabase.from('blocked_slots').delete().eq('date', date).eq('time', time);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Slot unblocked" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at:`);
    console.log(`- Local:   http://localhost:${PORT}`);
    console.log(`- Network: Connected to Supabase`);
});
