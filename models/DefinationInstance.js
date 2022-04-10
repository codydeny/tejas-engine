var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DefinationInstanceSchema = new Schema(
  {
    instanceId: {type: Schema.Types.String, required: true, maxLength: 100},
    instanceType: {type: Schema.Types.ObjectId, ref: 'Defination', required: true},
    instanceState : {type : Schema.Types.String, enum : ['IN_PROGRESS','FINISHED'], default : 'IN_PROGRESS'},
    currentStep: {type: Schema.Types.String, required: true, maxLength: 100},
    stepData: {type: Schema.Types.Mixed, required: true},
    createdAt: {type: Schema.Types.Date, required: true},
    updatedAt: {type: Schema.Types.Date, required: true},
  }
);

//Export model
module.exports = mongoose.model('DefinationInstance', DefinationInstanceSchema);