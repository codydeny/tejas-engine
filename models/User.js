var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    uid: {type: Schema.Types.String, required: true},
    email: {type: Schema.Types.String, required: false},
    displayName: {type: Schema.Types.String, required: false},
    isVerified : {type: Schema.Types.Boolean, default: false},
    userType : {type : Schema.Types.String, enum : ['FACULTY', 'STUDENT', 'ADMIN'], default : 'STUDENT'},
    userProfile : {type : Schema.Types.Mixed, required: true},
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);