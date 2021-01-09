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
    var naverSchema = mongoose.Schema({
        email: { type: String,unique:true},
        created_at: { type: String, default: year + '.' + month + '.' + day + ' 시간:' + Hours + ':' + minutes + ':' + seconds, index: { unique: false } },
        updated_at: { type: String, default: year + '.' + month + '.' + day + ' 시간:' + Hours + ':' + minutes + ':' + seconds, index: { unique: false } },
        provider: { type: String, default: 'naver'},
        authToken: { type: String, default: '' }
    })
    return naverSchema;
}