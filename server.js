const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const BLOCKED_FILE = path.join(__dirname, 'data', 'blocked.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Route aliases (so /login, /admin work without .html)
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ─── BOOKINGS ────────────────────────────────────────────────────────────────

// Get all bookings
app.get('/api/bookings', (req, res) => {
    fs.readFile(BOOKINGS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading bookings" });
        res.json(JSON.parse(data));
    });
});

// Create a booking
app.post('/api/bookings', (req, res) => {
    fs.readFile(BOOKINGS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading bookings" });

        const bookings = JSON.parse(data);
        const newBooking = {
            booking_id: 'b' + Date.now(),
            ...req.body
        };

        bookings.push(newBooking);

        fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error saving booking" });
            res.status(201).json(newBooking);
        });
    });
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
    fs.readFile(BOOKINGS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading bookings" });

        let bookings = JSON.parse(data);
        const bookingId = req.params.id;
        const initialLength = bookings.length;
        bookings = bookings.filter(b => b.booking_id !== bookingId);

        if (bookings.length === initialLength) {
            return res.status(404).json({ error: "Booking not found" });
        }

        fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error deleting booking" });
            res.json({ message: "Booking deleted successfully" });
        });
    });
});

// Update a booking (Drag & Drop)
app.put('/api/bookings/:id', (req, res) => {
    fs.readFile(BOOKINGS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading bookings" });

        let bookings = JSON.parse(data);
        const bookingId = req.params.id;
        const index = bookings.findIndex(b => b.booking_id === bookingId);

        if (index === -1) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Validate the new slot
        const { date, start_time } = req.body;
        if (date) bookings[index].date = date;
        if (start_time) bookings[index].start_time = start_time;

        fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error saving booking" });
            res.json(bookings[index]);
        });
    });
});

// ─── BLOCKED SLOTS ────────────────────────────────────────────────────────────

function readBlocked(cb) {
    fs.readFile(BLOCKED_FILE, (err, data) => {
        if (err) return cb([]);
        try { cb(JSON.parse(data)); } catch { cb([]); }
    });
}

// Get blocked slots
app.get('/api/blocked', (req, res) => {
    readBlocked(blocked => res.json(blocked));
});

// Block a slot
app.post('/api/blocked', (req, res) => {
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ error: "date and time required" });

    readBlocked(blocked => {
        const exists = blocked.find(b => b.date === date && b.time === time);
        if (!exists) blocked.push({ date, time });

        fs.writeFile(BLOCKED_FILE, JSON.stringify(blocked, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error saving blocked slot" });
            res.status(201).json({ message: "Slot blocked", date, time });
        });
    });
});

// Unblock a slot
app.delete('/api/blocked', (req, res) => {
    const { date, time } = req.body;

    readBlocked(blocked => {
        const filtered = blocked.filter(b => !(b.date === date && b.time === time));
        fs.writeFile(BLOCKED_FILE, JSON.stringify(filtered, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error saving blocked slots" });
            res.json({ message: "Slot unblocked" });
        });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at:`);
    console.log(`- Local:   http://localhost:${PORT}`);
    console.log(`- Network: http://192.168.10.30:${PORT} (Access from your phone)`);
});
