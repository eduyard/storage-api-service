const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { nanoid } = require('nanoid');

module.exports = {
  params: {
    collection: 'files',
    timestamps: true,
    versionKey: false
  },
  fields: {
    _id: {
      type: Schema.Types.String,
      default: function() {
        return nanoid(32);
      }
    },
    batch: {
      type: Schema.Types.String,
      index: true,
      ref: 'Batch',
      default: null
    },
    size: {
      type: Schema.Types.Number,
      default: null
    },
    name: {
      type: Schema.Types.String,
      required: true
    },
    originalName: {
      type: Schema.Types.String,
      default: null
    },
    extension: {
      type: Schema.Types.String,
      default: ''
    },
    mimeType: {
      type: Schema.Types.String,
      default: 'application/octet-stream'
    },
    isImage: {
      type: Schema.Types.Boolean,
      default: false
    },
    tags: {
      type: [Schema.Types.String],
      index: true,
      default: []
    },
    sourceServerUrl: {
      type: Schema.Types.String,
      unique: true,
      default: null
    },
    sourceServerAliasUrlPath: {
      type: Schema.Types.String,
      index: true,
      default: null
    },
    replicatedToServers: {
      type: [Schema.Types.String],
      default: []
    },
    completed: {
      type: Schema.Types.Boolean,
      index: true,
      default: false
    },
    deleted: {
      type: Schema.Types.Boolean,
      index: true,
      default: false
    }
  }
};
