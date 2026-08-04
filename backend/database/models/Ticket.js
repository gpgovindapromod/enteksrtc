import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    ticketNumber: { type: String, required: true, unique: true },

    qrCode: { type: String },
    pdfUrl: { type: String },

    downloadCount: { type: Number, default: 0 },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);
