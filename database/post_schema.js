
module.exports = function (mongoose) {
    var PostSchema = mongoose.Schema({
        owner:{type:String},
        guildType:{type:String},
        guildKind:{type:String},
        title: { type: String, trim: true},
        contents: { type: String, trim: true},
        writer: { type: mongoose.Schema.ObjectId, ref: 'users7' },
        email: { type: String },
        tags: { type: [], default: '' },
        created_at: { type: String, default: '', index: { unique: false } },
        updated_at: { type: String, default: '', index: { unique: false } },
        comments: [{
            writer: { type: String },
            contents: { type: String, trim: true, default: '' },
            created_at: { type: String, default: '', index: { unique: false } },
            updated_at: { type: String, default: '', index: { unique: false } },
            reply: [{
                writer: { type: String },
                contents: { type: String, trim: true, default: '' },
                created_at: { type: String, default: '', index: { unique: false } },
                updated_at: { type: String, default: '', index: { unique: false } },
            }]
        }]
    })
    PostSchema.static('findByEmail', function (r, callback) {
        return this.find({ '_id': r }, callback);
    })
    // email 찾기 //
    PostSchema.static('findByUser', function (email, callback) {
        return this.find({ 'email': email }, callback);
    })
    return PostSchema;
}