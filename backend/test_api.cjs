const http = require('http');

http.get('http://localhost:5011/api/trips/search?from=Trivandrum&to=Bangalore&date=2024-12-01', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const trips = json.trips || [];
    console.log("Trips found:", trips.length);
    if (trips.length > 0) {
      const trip = trips[0];
      const tripId = trip.tripId;
      const bSeq = trip.boardingPoint.sequence;
      const dSeq = trip.droppingPoint.sequence;
      console.log(`Fetching seats for trip ${tripId} bSeq=${bSeq} dSeq=${dSeq}`);
      
      http.get(`http://localhost:5011/api/trips/${tripId}/seats?boardingSequence=${bSeq}&droppingSequence=${dSeq}`, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
           const seats = JSON.parse(data2).seats;
           console.log("Total seats:", seats.length);
           console.log("Booked seats:", seats.filter(s => !s.isAvailable).length);
           console.log("First 3 booked seats:", seats.filter(s => !s.isAvailable).slice(0, 3));
        });
      });
    } else {
        console.log("No trips, response was:", json);
    }
  });
}).on('error', err => console.log('Error:', err.message));
