const mongoose = require('mongoose');

mongoose.Promise = Promise;

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

  static createConnection (onConnect, onError) {
    try {
      const params = {
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
        haInterval: 3000,
        poolSize: 10,
        keepAlive: 100,
        connectTimeoutMS: 30000,
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
  
      mongoose.set('useNewUrlParser', true);
      mongoose.set('useFindAndModify', false);
      mongoose.set('useCreateIndex', true);
      mongoose.set('debug', false);
    
      mongoose
        .connect(this.connectionString, params)
        .then(() => {
          console.log('Connection to database established');
          if (onConnect) onConnect();
        })
        .catch(error => {
          console.error(error);
          if (onError) onError(error);
          process.exit(-1);
        });
      return mongoose.connection;
    } catch (error) {
      throw new Error(error);
    }
  }
}

class TestMongoDBConnectionFactory extends MongoDBConnectionFactory {
  static createConnection (onConnect, onError) {
    onConnect();
  }
}

class Database {
  constructor (connectionFactory, env) {
    this._connectionFactory = connectionFactory;
    this._connection = null;
    this._schemas = [];
    this._modelInstances = new ModelInstances();
  }

  connect (onConnect, onError) {
    if (!this._connection) {
      this._connection = this._connectionFactory.createConnection(onConnect, onError);
    }
    return this;
  }
  
  get connection() {
    return this._connection;
  }

  get connectionString () {
    return this._connectionFactory.connectionString;
  }

  setSchemas (schemas) {
    this._schemas = schemas;
    return this;
  }

  get defaultSchemaParams () {
    return {};
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

      const modelInstance = mongoose.model(name, schema);
      this._modelInstances.set(name, modelInstance);
    }
    return this;
  }

  model (name) {
    return this._modelInstances.get(name);
  }
}

const schemas = './schemas';
const ConnectionFactory = MongoDBConnectionFactory;

const db = new Database(ConnectionFactory)
                .setSchemas(require(schemas))
                .initModels();

module.exports = db;
