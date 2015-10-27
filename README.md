# Constants

Reactive, defaultable, configurable configuration values for meteor.

The useful:constants package exports a single global variable which you can use to get & set values which change rarely.

Generally you should use the `Constant` method once for each variable and should set the default value at the same time, like this:

```
var maxSpeed = Constant('maxSpeed', 100);
```

However feel free to use the `Constant` method directly anywhere in your code, it works on both the client & the server,

# API

- `Constant(name[, options])` An alias for either `Constant.get` or `Constant.getAndConfigure` depending on whether you pass the 'options' argument.
- `Constant.get(name)` This is how you get values, this method takes a single argument, which is the name of the constant you want to get. Reactive on the client.
- `Constant.watch(name, callback)` Watches for changes to the value, and calls callback with those changes. Will run at least once, even if the value was never set (e.g. with the value `undefined`). (you'll need this because we don't have reactivity on the server)
- `Constant.getAndConfigure(name, options)` If you want more control over your constant, you can configure it. If options is a string, number, or boolean, it is used as the default value. Reactive on the client.
  - `options.defaultValue` The default value, this value will be overriden by any other value that get's set, either via `Constant.set`, environment variables, or meteor settings.json.
  - `options.envName` The name of this variable in the environment, e.g. `KADIRA_DEBUG_API_KEY`
  - `options.settingName` The name of this variable in meteor settings, e.g. `kadira.api_key`, periods are used to split the name so you can specify nested properties.
  - `options.public` Whether this constant should be published to the client. Can only be specified on the server, is always true on the client. The value specified on the server takes priority.
  - `options.serverSpecific` Setting this varaible via enviroment variables or meteor settings should take precedence over the value in the db, and calls to `Constant.set` should not be propagated to the db.
- `Constant.set(name, value)` Actively set the value, for example in response to some user action. This value will always override any default value set. This value is stored in the db.

## How does the useful:constants package resolve set conflicts
The useful:constants package provides multiple ways to set a value:

- Setting the default value `Constant('myValue', 'someDefault')`
- Passing values in via meteor settings `myValue: 'production variable'`
- Passing values in via the env `MY_VALUE='staging variable'`
- Setting values directly `Constant.set('myValue', 'admin preference')`
- Direct mongodb manipulation

It's important that when these values conflict, we set the value correctly. Here's how the useful:constants packages resolves these conflicts:

The above ways of setting a value are in order of least to greatest precidence, e.g. direct mongodb manipulation will override all the other ways of setting the value. There are a few caveats:

1. Setting the default value more than once will trigger a console warning. The last value will win. The same applies for setting the value more than once via meteor settings & env variables.
2. Setting the value via both meteor settings & env variables will trigger a console warning.
3. When setting values directly, the last call to `Constant.set` wins, this is resolved via a timestamp, with the value in the db being the final source of truth.
4. Setting values directly via `Constant.set` and changing the value via direct mongodb manipulation are equivilent, `Constant.set` just updates the underlying collection with the new value.
