Constants = new Mongo.Collection('useful:constants');

Constant = function (name, defaultValue) {
  if (defaultValue)
    return Constant.getAndConfigure(name, {
      defaultValue: defaultValue
    });
  return Constant.get(name);
};

Constant._config = {};
Constant.get = function (name) {
  const record = Constants.findOne({ name: name });
  if (record)
    return record.value || record.defaultValue;

  const options = Constant._config[name];
  if (options)
    return options.defaultValue;
};
Constant._set = function (name, value, callback) {
  if (!Constant._config[name])
    Constant.configure(name, {});

  Constants.upsert({ name: name }, { $set: { value: value } }, callback);
};
Constant.set = function (name, value, callback) {
  if (Meteor.isClient)
    Meteor.call('useful:constants/set', name, value, callback);
  else
    Constant._set(name, value, callback);
};
Constant.configure = function (name, options, callback) {
  if (Constant._config[name])
    console.warn(`Multiple calls to Constant.configure for ${name}`);
  
  _.defaults(options, {
    public: false
  });

  if (Meteor.isServer) {
    Constants.upsert({ name: name }, { $set: options }, callback);
  }

  Constant._config[name] = options;
};
Constant.getAndConfigure = function (name, options, callback) {
  Constant.configure(name, options, callback);
  return Constant.get(name);
};

Meteor.methods({
  'useful:constants/set': function (name, value) {
    var options = Constant._config[name];
    if (!options)
      Constant.configure(name, options = {
        public: true
      });
    if (!options.public)
      throw new Meteor.Error('not-public', 'Setting is not public');

    Constant._set(name, value);
  }
});

if (Meteor.isServer)
  Meteor.publish(null, function () {
    return Constants.find({
      public: true
    });
  });