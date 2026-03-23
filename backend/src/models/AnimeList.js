const mongoose = require('mongoose');

const animeListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    animeId: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['visto', 'viendo', 'por_ver', 'favorito'],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    review: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

animeListSchema.index({ userId: 1, animeId: 1 }, { unique: true });

module.exports = mongoose.model('AnimeList', animeListSchema);
