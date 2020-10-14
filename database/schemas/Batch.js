const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { nanoid } = require('nanoid');

module.exports = {
  params: {
    collection: 'batches',
    timestamps: true,
    versionKey: false,
  },
  fields: {
    _id: {
      type: Schema.Types.String,
      default: function () {
        return nanoid(32);
      },
    },
    batch: {
      type: Schema.Types.String,
      index: true,
      ref: 'Batch',
      default: null,
    },
    files: {
      type: [Schema.Types.String],
      ref: 'File',
      default: [],
    },
    deleted: {
      type: Schema.Types.Boolean,
      index: true,
      default: false,
    },
  },
};
