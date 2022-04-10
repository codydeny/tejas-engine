var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DefinationSchema = new Schema(
  {
    name: {type: Schema.Types.String, required: true, maxLength: 100},
    watchers: {type: Schema.Types.Array, required: true},
    creators: {type: Schema.Types.Array, required: true},
    steps: {type: Schema.Types.Mixed, required: true},
  }
);

//Export model
module.exports = mongoose.model('Defination', DefinationSchema);