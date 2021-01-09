var crypto = require('crypto');
module.exports = function (mongoose) {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var Hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    var UserSchema = mongoose.Schema({
        email: { type: String, unique: true },
        hashed_password: { type: String, 'default': '' },
        salt: { type: String },
        created_at: { type: String, default: year + '.' + month + '.' + day + ' 시간:' + Hours + ':' + minutes + ':' + seconds, index: { unique: false } },
        updated_at: { type: String, default: year + '.' + month + '.' + day + ' 시간:' + Hours + ':' + minutes + ':' + seconds, index: { unique: false } },
        maker: { type: String },
        guildinfo: [{
            guildimage: { type: String, trim: true, default: '' },
            guildCoverImage: { type: String },
            guildname: { type: String },
            gamename: { type: String },
            guildexplain: { type: String },
            guildmaketime:{type:String,default:Date.now()},
            maker : { type: String },
        }]
    })
    // 칼럼 이메일값이 들어가있는지 ? 확인 //
    /*
    UserSchema.path('email').validate(function (email) {
        return email.length;
    }, 'email 칼럼의 값이 없습니다');
    UserSchema.path('hashed_password').validate(function (hashed_password) {;
        return hashed_password.length;
    }, 'email 칼럼의 값이 없습니다');
*/
    // 비밀번호 암호화 sha1 알고리즘 , hex 알고리즘 :: S  //
    UserSchema
        .virtual('password')
        .set(function (password) {
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
        })
    UserSchema.method('encryptPassword', function (plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });
    UserSchema.method('makeSalt', function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });
    // 내가입력한 비밀번호와 암호화된 비밀번호 일치 여부 확인 //
    UserSchema.method('authenticate', function (password, inSalt, hashed_password) {

        if (inSalt) {
            return this.encryptPassword(password, inSalt) === hashed_password;
        } else {
            return this.encryptPassword(password) === hashed_password;
        }
    })
    // usershema1 :: S //


    // 비밀번호 암호화 sha1 알고리즘 , hex 알고리즘 :: E  //
    UserSchema.static('findByEmail', function (email, callback) {
        return this.find({ 'email': email }, callback);
    })
    UserSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    })
    return UserSchema;
}