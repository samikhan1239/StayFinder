const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  preferences: { type: String, required: true }, // JSON stringified preferences
  itinerary: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Itinerary", itinerarySchema);
