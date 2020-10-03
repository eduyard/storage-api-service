const mongoose = require('mongoose');
require('./support/types/Int32');

class ModelInstances {
  constructor () {
    this._instances = {};
  }
  
  set (name, instance) {
    this._instances[name] = instance;
  }
  
  get (name) {
    if (!this._instances[name]) {
      throw new Error('Model instance "' + name + '" not found');
    }
    return this._instances[name];
  }
}

class MongoDBConnectionFactory {
  static get connectionString () {
    return process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/storage';
  }
  
  static async createConnection () {
    try {
      const params = {
        haInterval: 3000,
        poolSize: 200,
        keepAlive: 100,
        connectTimeoutMS: 30000,
        autoIndex: true,
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      };
      
      mongoose.set('debug', process.env.NODE_ENV !== 'production');
      
      const connection = await mongoose.createConnection(this.connectionString, params);
      console.log('Connection to database established');
      
      return connection;
    } catch (error) {
      throw new Error(error);
    }
  }
}

class Database {
  constructor (connectionFactory, env) {
    this._connectionFactory = connectionFactory;
    this._connection = null;
    this._schemas = [];
    this._modelInstances = new ModelInstances();
  }
  
  async connect () {
    if (!this.connected) {
      this._connection = await this._connectionFactory.createConnection();
    }
    this.initModels();
    return this;
  }
  
  get connectionString () {
    return this._connectionFactory.connectionString;
  }
  
  get connected () {
    return !!this._connection;
  }
  
  setSchemas (schemas) {
    this._schemas = schemas;
  }
  
  get defaultSchemaParams () {
    return {
      usePushEach: true,
      setDefaultsOnInsert: true
    };
  }
  
  initModels () {
    for (const name in this._schemas) {
      if (!this._schemas.hasOwnProperty(name)) {
        continue;
      }
      const schemaConfig = this._schemas[name];
      const schema = new mongoose.Schema(
        schemaConfig.fields,
        Object.assign(this.defaultSchemaParams, schemaConfig.params)
      );
      if (schemaConfig.hooks && schemaConfig.hooks.length > 0) {
        schemaConfig.hooks.forEach(hook => {
          switch (hook.when + ' ' + hook.event) {
            case 'pre save' :
              schema.pre('save', hook.method);
              break;
          }
        });
      }
      
      const modelInstance = this._connection.model(name, schema);
      this._modelInstances.set(name, modelInstance);
    }
    return this;
  }
  
  model (name) {
    if (!this.connected) {
      throw Error('Connection to database not established');
    }
    return this._modelInstances.get(name);
  }
}

const schemas = './schemas';
const
  ConnectionFactory = MongoDBConnectionFactory;

const db = new Database(ConnectionFactory);
db.setSchemas(require(schemas));

module.exports = db;
