import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  seatNo: { type: String, required: true },
  row: { type: Number, required: true },
  column: { type: Number, required: true },
  type: { type: String } // e.g. 'window', 'aisle', 'sleeper'
}, { _id: false });

const busLayoutSchema = new mongoose.Schema(
  {
    layoutName: { type: String, required: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    seats: [seatSchema]
  },
  { timestamps: true }
);

export default mongoose.model('BusLayout', busLayoutSchema);
