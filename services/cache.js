const mongoose = require('mongoose')
const redis = require('redis')
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();


const exec = mongoose.Query.prototype.exec
mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function(){
    if(!this.useCache){
        return exec.apply(this,arguments);
    }

    const key = JSON.stringify(
        Object.assign({},this.getQuery(),{
            collection: this.mongooseCollection.name
        })
    )
    const cacheValue= await client.hGet(this.hashKey,key)
    if(cacheValue){
        console.log(cacheValue);
        const doc = JSON.parse(cacheValue) 

        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d))
            : new this.model(doc)
    }

    const result = await exec.apply(this,arguments);
    client.hSet(this.hashKey,key, JSON.stringify(result));
    
    return result;
}
module.exports = {
    clearHash : function(hashKey){
        client.del(JSON.stringify(hashKey));
    }
  }