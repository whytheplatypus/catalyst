requirejs.config({
  urlArgs: "bust=" +  (new Date()).getTime()
});
require(['../Catalyst', './components/chai/chai'], function(Catalyst, chai){
  chai.should();
  function fixture(path, fn) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'fixtures/'+path, true);
    //xhr.setRequestHeader('Accept', 'application/vnd.github-blob.raw');
    xhr.onload = function(e){
      fn(e, this.response);
    };
    xhr.send();
  }
  describe("Catalyst", function(){
    describe("A new catalyst", function(){
      it('should have an empty events object', function(){
        var cat = {};Catalyst(cat);
        cat.events.should.be.empty;
      });
      it('should have an on method', function(){
        var cat = {};Catalyst(cat);;
        cat.on.should.exist;
      });
      it('should have a remove method', function(){
        var cat = {};Catalyst(cat);;
        cat.remove.should.exist;
      });
      it('should have a trigger', function(){
        var cat = {};Catalyst(cat);;
        cat.trigger.should.exist;
      });
      it('should have a watch method', function(){
        var cat = {};Catalyst(cat);;
        cat.watch.should.exist;
      });
      it('should have a unwatch method', function(){
        var cat = {};Catalyst(cat);;
        cat.unwatch.should.exist;
      });
    });
    
    describe("When adding a listener", function(){
      var cat = {};Catalyst(cat);;
      var event = cat.on('hello', function(){console.log('world');}), event2;
      it('should return the type', function(){
        event.type.should.to.equal('hello');
      });
      it('and the uid of the event', function(){
        event.id.should.match(/\w+\d+/);
      });
      it('should have the event in its event object under [type][id]', function(){
        cat.events[event.type][event.id].should.be.a('Function');
      });
      it('should not conflict with a new listener', function(){
        event2 = cat.on('hello', function(){console.log('world2');});
        event.should.not.equal(event2);
      });
    });
    describe("Working with a catalyst", function(){
      var cat = {};Catalyst(cat);;
      var listener;
      describe("When triggering an event with an event object", function(){
        it('should pass the correct event object', function(done){
          var event = {type:'hello', data:'world'};
          listener = cat.on('hello', function(e){
            e.should.equal(event);
            done();
          });
          cat.trigger(event);
        });
      });
      describe("when removing an event", function(){
        it("should make it undefined", function(){
          cat.remove(listener);
          chai.expect(cat.events[listener.type][listener.id]).to.be.undefined;
        })
      });
      describe("When triggering an object with just a string", function(){
        it('should pass the catalyst object', function(done){
          cat.on('hello', function(e){
            e.should.equal(cat);
            done();
          });
          cat.trigger('hello');
        });
      });
    });
    describe("Working with watcher", function(){
      var obj = function(){
        this.hello = "dlrow";
        Catalyst(this);
      }
      

      var test = new obj();
      test.watch('hello');
      it("the watcher should trigger events when the property changes", function(done){
        
        test.on("change:hello", function(e){
          
          describe("When it changes, a watched value ", function(){
            it("should have the old value", function(){
              e.old.should.equal('dlrow');
            });
            it("and the new value", function(){
              e.new.should.equal('world');
            });
          });
          done();
        });
        test.hello = "world";
      });
      it("The watcher should stop watching if asked", function(){
        test.unwatch('hello');
        chai.expect(test.events['change:hello']).to.be.undefined;
      });
    });
  });
  mocha.run();
});