
module.exports = function (mongoose) {
    var guild_chema = mongoose.Schema({
        guildimage: {type:String},
        guildname: {type:String},
        guildCoverImage: {type:String},
        guildmaketime:{type:String,default:Date.now()},
        maker: {type:String},
        guildExplain: {type:String}
    })
    return  guild_chema;
}