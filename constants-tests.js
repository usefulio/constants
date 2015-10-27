Tinytest.add('Useful Constants - default method', function (test) {
  test.equal(Constant(Random.id(), '456'), '456');
});
Tinytest.add('Useful Constants - get/set pair', function (test) {
  var val = Random.id();
  Constant.set('124', val);
  test.equal(Constant('124'), val);
});
if (Meteor.isServer)
  Constant.set('125', '111');
if (Meteor.isClient)
  Tinytest.addAsync('Useful Constants - get/set security', function (test, done) {
    test.equal(Constant.get('125'), undefined);
    Constant.set('125', 'XXX', function (error) {
      test.equal(!!error, true);
      done();
    });
  });
if (Meteor.isServer) {
  Constant.configure('126', {
    public: true
  });
  Constant.set('126', '111');
}
if (Meteor.isClient)
  Tinytest.add('Useful Constants - publishes public constants', function (test) {
    test.equal(Constant.get('126'), '111');
  });
if (Meteor.isClient)
  Tinytest.add('Useful Constants - get is reactive', function (test) {
    var count = 0;
    Tracker.autorun(function () {
      count++;
      Constant.get('124');
    });
    Constant.set('124', Random.id());
    Tracker.flush();
    test.equal(count, 2);
  });
