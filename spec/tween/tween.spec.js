var Tweenie = mojs.Tweenie;
var Tween = mojs.Tween;

var helpers = mojs.__helpers__;
var tweener = helpers.tweener;
var ClassProto = helpers.ClassProto;
var tweenieDefaults = helpers.tweenieDefaults;
var tweenDefaults = helpers.tweenDefaults;

var eps = 0.0000001;

describe('tween ->', function () {
  describe('extension ->', function() {
    it('should extend `ClassProto`', function () {
      var tween = new Tween();
      expect(ClassProto.isPrototypeOf(tween)).toBe(true);
    });

    it('should declare `defaults`', function () {
      var tween = new Tween();
      expect(tween._defaults).toBe(tweenDefaults);
    });
  });

  describe('_vars ->', function() {
    it('should call `_setupUpdateFunction`', function () {
      var tween = new Tween();
      spyOn(tween, '_setupUpdateFunction');
      tween._vars();
      expect(tween._setupUpdateFunction).toHaveBeenCalled();
    });
  });

  describe('`repeat` option ->', function () {
    it('should create `n+1` tweenies', function () {
      var tween = new Tween();
      expect(tween._tweenies.length).toBe(1);
      expect(Object.getPrototypeOf(tween._tweenies[0])).toBe(Object.getPrototypeOf(new Tweenie()));
    });

    it('should create `n+1` tweenies #2', function () {
      var n = 1;
      var tween = new Tween({ repeat: n });
      expect(tween._tweenies.length).toBe(n + 1);
      for (var i = 0; i <= n; i++) {
        expect(Object.getPrototypeOf(tween._tweenies[i])).toBe(Object.getPrototypeOf(new Tweenie()));
      }
    });

    it('should create `n+1` tweenies #3', function () {
      var n = 5;
      var tween = new Tween({ repeat: n });
      expect(tween._tweenies.length).toBe(n + 1);
      for (var i = 0; i <= n; i++) {
        expect(Object.getPrototypeOf(tween._tweenies[i])).toBe(Object.getPrototypeOf(new Tweenie()));
      }
    });

    it('should pass `index` to tweenies', function () {
      var n = 5;
      var tween = new Tween({ repeat: n });
      expect(tween._tweenies.length).toBe(n + 1);
      for (var i = 0; i <= n; i++) {
        expect(tween._tweenies[i]._props.index).toBe(i);
      }
    });
  });

  describe('`onUpdate` callback ->', function () {
    it('should pass the `onUpdate` callback ', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };
      var tween = new Tween(options);
      for (var i = 0; i <= options.repeat; i++) {
        expect(tween._tweenies[i]._o.onUpdate).toBe(options.onUpdate);
      }
    });
  });

  describe('`setStartTime` function ->', function () {
    it('should set `_start` time', function () {
      var tween = new Tween();
      var startTime = 500;

      tween.setStartTime(startTime);
      expect(tween._start).toBe(startTime);
      expect(tween._spot).toBe(tween._start - tween._props.delay);
    });

    it('should set `_start` time regarding `_elapsed`', function () {
      var delay = 50;
      var tween = new Tween({
        delay: delay
      });
      var startTime = 500;
      tween._elapsed = 200;

      tween.setStartTime(startTime);
      expect(tween._spot).toBe(startTime - tween._elapsed);
      expect(tween._start).toBe(tween._spot + delay);
    });

    it('should set `_start` time #delay', function () {
      var delay = 200;
      var duration = 500;
      var tween = new Tween({
        delay: delay,
        duration: duration
      });
      var startTime = 200;

      tween.setStartTime(startTime);
      expect(tween._start).toBe(startTime + delay);
    });

    it('should set `_time` regarding `repeat`', function () {
      var delay = 200;
      var duration = 500;
      var repeat = 3;
      var tween = new Tween({
        delay: delay,
        duration: duration,
        repeat: repeat
      });
      var startTime = 200;

      tween.setStartTime(startTime);
    });

    it('should set `_start` time to `performance.now` if not set', function () {
      var tween = new Tween();
      tween.setStartTime();
      var newTime = performance.now();
      expect(Math.abs(newTime - tween._start)).not.toBeGreaterThan(5);
    });

    it('should set `_start` time to `performance.now` if not set #delay', function () {
      var delay = 150;
      var tween = new Tween({ delay: delay });
      tween.setStartTime();
      var newTime = performance.now();
      expect(Math.abs(tween._start - (newTime + delay))).not.toBeGreaterThan(5);
    });

    it('should set `_start` time on each `Tweenie`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      spyOn(tween._tweenies[0], 'setStartTime');
      spyOn(tween._tweenies[1], 'setStartTime');
      spyOn(tween._tweenies[2], 'setStartTime');
      spyOn(tween._tweenies[3], 'setStartTime');
      spyOn(tween._tweenies[4], 'setStartTime');
      spyOn(tween._tweenies[5], 'setStartTime');

      tween.setStartTime();

      expect(tween._tweenies[0].setStartTime).toHaveBeenCalledWith(tween._start);
      expect(tween._tweenies[1].setStartTime).toHaveBeenCalledWith(tween._tweenies[0]._end);
      expect(tween._tweenies[2].setStartTime).toHaveBeenCalledWith(tween._tweenies[1]._end);
      expect(tween._tweenies[3].setStartTime).toHaveBeenCalledWith(tween._tweenies[2]._end);
      expect(tween._tweenies[4].setStartTime).toHaveBeenCalledWith(tween._tweenies[3]._end);
      expect(tween._tweenies[5].setStartTime).toHaveBeenCalledWith(tween._tweenies[4]._end);
    });

    it('should set `_end` to the `_end` of the last `Tweenie`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      expect(tween._end).toBe(tween._tweenies[tween._tweenies.length-1]._end);
    });

    it('should recalculate `_elapsed` if >= `_end`', function () {
      var duration = 500;
      var tween = new Tween({
        duration: duration
      });
      tween.setStartTime();

      var start = tween._start;
      tween.update(start);
      tween.update(start + duration/2);
      tween.update(start + duration);

      tween.setStartTime();

      expect(tween._elapsed).toBe(0);
    });

    it('should recalculate `_elapsed` if > `_end`', function () {
      var duration = 500;
      var tween = new Tween({
        duration: duration
      });
      tween.setStartTime();

      var start = tween._start;
      tween.update(start);
      tween.update(start + duration/2);
      tween.update(start + duration + 20);

      tween.setStartTime();

      expect(tween._elapsed).toBe(0);
    });
  });

  describe('`update` function ->', function () {
    it('should be equal to `_updateUFwd`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      expect(tween.update).toBe(tween._updateUFwd);
    });

    it('should be equal to `_updateURev` if `isReversed`', function () {
      var options = {
        onUpdate: function() {},
        isReverse: true,
        repeat: 5
      };

      var tween = new Tween(options);
      expect(tween.update).toBe(tween._updateURev);
    });

    it('should be equal to `_updateFwd` if `repeat` is `0`', function () {
      var options = {
        onUpdate: function() {}
      };

      var tween = new Tween(options);
      expect(tween.update).toBe(tween._updateFwd);
    });

    it('should be equal to `_updateRev` if `repeat` is `0` and `isReverse`', function () {
      var options = {
        onUpdate: function() {},
        isReverse: true
      };

      var tween = new Tween(options);
      expect(tween.update).toBe(tween._updateRev);
    });
  });

  describe('`_updateFwd` function ->', function () {
    it('should update only current tween', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[1], 'update');
      spyOn(tween._tweenies[2], 'update');
      spyOn(tween._tweenies[3], 'update');
      spyOn(tween._tweenies[4], 'update');
      spyOn(tween._tweenies[5], 'update');

      var updateTime = tween._start + 10;

      tween._act = tween._tweenies[0];

      tween._updateFwd(updateTime);
      expect(tween._tweenies[0].update).toHaveBeenCalledWith(updateTime);
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
    });

    // not need for now
    // it('should return result of inner update', function () {
    //   var duration = 200;
    //   var options = {
    //     onUpdate: function() {},
    //     duration: duration
    //   };
    //
    //   var tween = new Tween(options);
    //   tween.setStartTime();
    //
    //   var updateTime = tween._start + 10;
    //
    //   tween._updateFwd(updateTime);
    //   tween._updateFwd(updateTime + duration/2);
    //   var result = tween._updateFwd(updateTime + duration);
    //   expect(result).toBe(true);
    // });

    it('should save `_elapsed`', function () {
      var duration = 200;
      var options = {
        onUpdate: function() {},
        duration: duration
      };

      var tween = new Tween(options);
      tween.setStartTime();

      var updateTime = tween._start + 10;

      tween._updateFwd(updateTime);
      expect(tween._elapsed).toBe(updateTime - tween._spot);

      updateTime += duration/2;
      tween._updateFwd(updateTime);
      expect(tween._elapsed).toBe(updateTime - tween._spot);

      updateTime += duration/2;
      tween._updateFwd(updateTime);
      expect(tween._elapsed).toBe(updateTime - tween._spot);
    });
  });

  describe('`_updateRev` function ->', function () {
    it('should update only current tween with reverse time', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[1], 'update');
      spyOn(tween._tweenies[2], 'update');
      spyOn(tween._tweenies[3], 'update');
      spyOn(tween._tweenies[4], 'update');
      spyOn(tween._tweenies[5], 'update');

      var shift = -50;
      var updateTime = tween._start + shift;

      tween._act = tween._tweenies[0];

      tween._updateRev(updateTime);

      expect(tween._tweenies[0].update).toHaveBeenCalledWith(tween._end - shift);
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      var shift = 50;
      var updateTime = tween._start + shift;
      tween._updateRev(updateTime);

      expect(tween._tweenies[0].update).toHaveBeenCalledWith(tween._end - shift);
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      var shift = 50;
      var updateTime = tween._end + shift;
      tween._updateRev(updateTime);

      expect(tween._tweenies[0].update.calls.mostRecent().args[0]).toBeCloseTo(tween._start - shift, 3);
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
    });

    // not need for now
    // it('should return result of inner update', function () {
    //   var duration = 200;
    //   var options = {
    //     onUpdate: function() {},
    //     duration: duration
    //   };
    //
    //   var tween = new Tween(options);
    //   tween.setStartTime();
    //
    //   var updateTime = tween._end;
    //
    //   tween._updateRev(updateTime);
    //   tween._updateRev(updateTime - duration/2);
    //   var result = tween._updateRev(updateTime - duration);
    //   expect(result).toBe(true);
    // });

    it('should save `_elapsed`', function () {
      var duration = 200;
      var options = {
        onUpdate: function() {},
        duration: duration
      };

      var tween = new Tween(options);
      tween.setStartTime();

      var updateTime = tween._end;
      var start = tween._start;

      tween._updateRev(updateTime);
      expect(tween._elapsed).toBe(updateTime - tween._spot);

      updateTime -= duration/2;
      tween._updateRev(updateTime);
      expect(tween._elapsed).toBe(updateTime - tween._spot);

      updateTime -= duration/2;
      tween._updateRev(updateTime);
      expect(tween._elapsed).toBe(updateTime - tween._spot);
    });
  });

  describe('`onChimeOut` callback ->', function () {
    it('should be set to `_chimeOut`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween, '_chimeOut');

      tween._tweenies[0]._props.onChimeOut();
      expect(tween._chimeOut.calls.count()).toBe(1);

      tween._tweenies[1]._props.onChimeOut();
      expect(tween._chimeOut.calls.count()).toBe(2);

      tween._tweenies[2]._props.onChimeOut();
      expect(tween._chimeOut.calls.count()).toBe(3);

      tween._tweenies[3]._props.onChimeOut();
      expect(tween._chimeOut.calls.count()).toBe(4);

      tween._tweenies[4]._props.onChimeOut();
      expect(tween._chimeOut.calls.count()).toBe(5);

      tween._tweenies[5]._props.onChimeOut();
      expect(tween._chimeOut.calls.count()).toBe(6);
    });
  });

  describe('`_chimeOut` function ->', function () {
    it('should increase `_active`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      tween._active = 0;

      tween._tweenies[0]._props.onChimeOut(true);
      expect(tween._active).toBe(1);

      tween._tweenies[1]._props.onChimeOut(true);
      expect(tween._active).toBe(2);

      tween._tweenies[2]._props.onChimeOut(true);
      expect(tween._active).toBe(3);

      tween._tweenies[3]._props.onChimeOut(true);
      expect(tween._active).toBe(4);

      tween._tweenies[4]._props.onChimeOut(true);
      expect(tween._active).toBe(5);

      tween._tweenies[5]._props.onChimeOut(true);
      expect(tween._active).toBe(5);
    });

    it('should not increase `_active` if backward', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      tween._active = 0;

      tween._tweenies[0]._props.onChimeOut(false);
      expect(tween._active).toBe(0);

      tween._tweenies[1]._props.onChimeOut(false);
      expect(tween._active).toBe(0);

      tween._tweenies[2]._props.onChimeOut(false);
      expect(tween._active).toBe(0);

      tween._tweenies[3]._props.onChimeOut(false);
      expect(tween._active).toBe(0);

      tween._tweenies[4]._props.onChimeOut(false);
      expect(tween._active).toBe(0);

      tween._tweenies[5]._props.onChimeOut(false);
      expect(tween._active).toBe(0);
    });

    it('should update the newly `_active` tweenie', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();
      tween._active = 0;
      tween._act = tween._tweenies[0];

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[1], 'update');
      spyOn(tween._tweenies[2], 'update');
      spyOn(tween._tweenies[3], 'update');
      spyOn(tween._tweenies[4], 'update');
      spyOn(tween._tweenies[5], 'update');

      var time = 200;
      tween._tweenies[0]._props.onChimeOut(true, time);
      expect(tween._active).toBe(1);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[1].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[1]._props.onChimeOut(true, time += 10);
      expect(tween._active).toBe(2);
      expect(tween._act).toBe(tween._tweenies[2]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[1].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[2]._props.onChimeOut(true, time += 10);
      expect(tween._active).toBe(3);
      expect(tween._act).toBe(tween._tweenies[3]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[1].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[3]._props.onChimeOut(true, time += 10);
      expect(tween._active).toBe(4);
      expect(tween._act).toBe(tween._tweenies[4]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[1].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update.calls.count()).toBe(1);
      expect(tween._tweenies[4].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[4]._props.onChimeOut(true, time += 10);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[1].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update.calls.count()).toBe(1);
      expect(tween._tweenies[4].update.calls.count()).toBe(1);
      expect(tween._tweenies[5].update).toHaveBeenCalledWith(time);

      tween._tweenies[5]._props.onChimeOut(true, time += 10);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[1].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update.calls.count()).toBe(1);
      expect(tween._tweenies[4].update.calls.count()).toBe(1);
      expect(tween._tweenies[5].update.calls.count()).toBe(1);
    });

    it('should not update the newly `_active` tweenie if backward', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();
      tween._active = 0;
      tween._act = tween._tweenies[0];

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[1], 'update');
      spyOn(tween._tweenies[2], 'update');
      spyOn(tween._tweenies[3], 'update');
      spyOn(tween._tweenies[4], 'update');
      spyOn(tween._tweenies[5], 'update');

      var time = 200;
      tween._tweenies[0]._props.onChimeOut(false, time);
      expect(tween._active).toBe(0);

      expect(tween._tweenies[0].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[1]._props.onChimeOut(false, time += 10);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[2]._props.onChimeOut(false, time += 10);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[3]._props.onChimeOut(false, time += 10);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[4]._props.onChimeOut(false, time += 10);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();

      tween._tweenies[5]._props.onChimeOut(false, time += 10);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      expect(tween._tweenies[0].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
    });
  });

  describe('`_chimeIn` function ->', function () {
    it('should decrease `_active`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      tween._active = 5;
      tween._act = tween._tweenies[tween._active];

      tween._tweenies[5]._props.onChimeIn(false);
      expect(tween._active).toBe(4);
      expect(tween._act).toBe(tween._tweenies[4]);

      tween._tweenies[4]._props.onChimeIn(false);
      expect(tween._active).toBe(3);
      expect(tween._act).toBe(tween._tweenies[3]);

      tween._tweenies[3]._props.onChimeIn(false);
      expect(tween._active).toBe(2);
      expect(tween._act).toBe(tween._tweenies[2]);

      tween._tweenies[2]._props.onChimeIn(false);
      expect(tween._active).toBe(1);
      expect(tween._act).toBe(tween._tweenies[1]);

      tween._tweenies[1]._props.onChimeIn(false);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      tween._tweenies[0]._props.onChimeIn(false);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);
    });

    it('should not decrease `_active` if forward', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      tween._active = 5;
      tween._act = tween._tweenies[tween._active];

      tween._tweenies[5]._props.onChimeIn(true);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      tween._tweenies[4]._props.onChimeIn(true);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      tween._tweenies[3]._props.onChimeIn(true);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      tween._tweenies[2]._props.onChimeIn(true);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      tween._tweenies[1]._props.onChimeIn(true);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      tween._tweenies[0]._props.onChimeIn(true);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);
    });

    it('should update the newly `_active` tweenie', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[1], 'update');
      spyOn(tween._tweenies[2], 'update');
      spyOn(tween._tweenies[3], 'update');
      spyOn(tween._tweenies[4], 'update');
      spyOn(tween._tweenies[5], 'update');

      tween._active = 5;

      var time = 200;
      tween._tweenies[5]._props.onChimeIn(false, time);
      expect(tween._active).toBe(4);

      expect(tween._tweenies[5].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[4].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[4]._props.onChimeIn(false, time -= 10);
      expect(tween._active).toBe(3);
      expect(tween._act).toBe(tween._tweenies[3]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[4].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[3]._props.onChimeIn(false, time -= 10);
      expect(tween._active).toBe(2);
      expect(tween._act).toBe(tween._tweenies[2]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[4].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[2]._props.onChimeIn(false, time -= 10);
      expect(tween._active).toBe(1);
      expect(tween._act).toBe(tween._tweenies[1]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[4].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update.calls.count()).toBe(1);
      expect(tween._tweenies[1].update).toHaveBeenCalledWith(time);
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[1]._props.onChimeIn(false, time -= 10);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[4].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update.calls.count()).toBe(1);
      expect(tween._tweenies[1].update.calls.count()).toBe(1);
      expect(tween._tweenies[0].update).toHaveBeenCalledWith(time);

      tween._tweenies[0]._props.onChimeIn(false, time -= 10);
      expect(tween._active).toBe(0);
      expect(tween._act).toBe(tween._tweenies[0]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalledWith(time);
      expect(tween._tweenies[4].update.calls.count()).toBe(1);
      expect(tween._tweenies[3].update.calls.count()).toBe(1);
      expect(tween._tweenies[2].update.calls.count()).toBe(1);
      expect(tween._tweenies[1].update.calls.count()).toBe(1);
      expect(tween._tweenies[0].update.calls.count()).toBe(1);
    });

    it('should not update the newly `_active` tweenie if forward', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[1], 'update');
      spyOn(tween._tweenies[2], 'update');
      spyOn(tween._tweenies[3], 'update');
      spyOn(tween._tweenies[4], 'update');
      spyOn(tween._tweenies[5], 'update');

      tween._active = 5;
      tween._act = tween._tweenies[tween._active];

      var time = 200;
      tween._tweenies[5]._props.onChimeIn(true, time);
      expect(tween._active).toBe(5);

      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[4]._props.onChimeIn(true, time -= 10);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[3]._props.onChimeIn(true, time -= 10);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[2]._props.onChimeIn(true, time -= 10);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[1]._props.onChimeIn(true, time -= 10);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();

      tween._tweenies[0]._props.onChimeIn(true, time -= 10);
      expect(tween._active).toBe(5);
      expect(tween._act).toBe(tween._tweenies[5]);

      expect(tween._tweenies[5].update).not.toHaveBeenCalled();
      expect(tween._tweenies[4].update).not.toHaveBeenCalled();
      expect(tween._tweenies[3].update).not.toHaveBeenCalled();
      expect(tween._tweenies[2].update).not.toHaveBeenCalled();
      expect(tween._tweenies[1].update).not.toHaveBeenCalled();
      expect(tween._tweenies[0].update).not.toHaveBeenCalled();
    });
  });

  describe('`_onStart` function ->', function () {
    it('should be called by tweenies `onStart` callback', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween, '_onStart');

      tween._tweenies[0]._props.onStart();
      expect(tween._onStart.calls.count()).toBe(1);

      tween._tweenies[1]._props.onStart();
      expect(tween._onStart.calls.count()).toBe(2);

      tween._tweenies[2]._props.onStart();
      expect(tween._onStart.calls.count()).toBe(3);

      tween._tweenies[3]._props.onStart();
      expect(tween._onStart.calls.count()).toBe(4);

      tween._tweenies[4]._props.onStart();
      expect(tween._onStart.calls.count()).toBe(5);

      tween._tweenies[5]._props.onStart();
      expect(tween._onStart.calls.count()).toBe(6);
    });

    it('should be call `onRepeatStart` callback', function () {
      var options = {
        onRepeatStart: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onRepeatStart');

      tween._tweenies[0]._props.onStart(true);
      expect(tween._props.onRepeatStart.calls.count()).toBe(1);

      tween._tweenies[1]._props.onStart(true);
      expect(tween._props.onRepeatStart.calls.count()).toBe(2);

      tween._tweenies[2]._props.onStart(true);
      expect(tween._props.onRepeatStart.calls.count()).toBe(3);

      tween._tweenies[3]._props.onStart(true);
      expect(tween._props.onRepeatStart.calls.count()).toBe(4);

      tween._tweenies[4]._props.onStart(true);
      expect(tween._props.onRepeatStart.calls.count()).toBe(5);

      tween._tweenies[5]._props.onStart(true);
      expect(tween._props.onRepeatStart.calls.count()).toBe(6);
    });

    it('should pass 3 args to `onRepeatStart` callback', function () {
      var options = {
        onRepeatStart: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onRepeatStart');

      var args = [true, false, 5];
      tween._tweenies[0]._props.onStart.apply(null, args);
      expect(tween._props.onRepeatStart.calls.mostRecent().args).toEqual(args);

      var args = [true, true, 5];
      tween._tweenies[1]._props.onStart.apply(null, args);
      expect(tween._props.onRepeatStart.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[2]._props.onStart.apply(null, args);
      expect(tween._props.onRepeatStart.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[3]._props.onStart.apply(null, args);
      expect(tween._props.onRepeatStart.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[4]._props.onStart.apply(null, args);
      expect(tween._props.onRepeatStart.calls.mostRecent().args).toEqual(args);
    });

    it('should be call `onStart` callback if the last item', function () {
      var options = {
        onComplete: function() {},
        onRepeatComplete: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onStart').and.callThrough();

      tween._tweenies[0]._props.onStart(true, false, 0);
      expect(tween._props.onStart.calls.count()).toBe(1);

      tween._tweenies[1]._props.onStart();
      expect(tween._props.onStart.calls.count()).toBe(1);

      tween._tweenies[2]._props.onStart();
      expect(tween._props.onStart.calls.count()).toBe(1);

      tween._tweenies[3]._props.onStart();
      expect(tween._props.onStart.calls.count()).toBe(1);

      tween._tweenies[4]._props.onStart();
      expect(tween._props.onStart.calls.count()).toBe(1);

      tween._tweenies[5]._props.onStart();
      expect(tween._props.onStart.calls.count()).toBe(1);
    });

    it('should pass the 3 arguments to the `onStart`', function () {
      var options = {
        onStart: function() {},
        onRepeatComplete: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onStart').and.callThrough();

      var args = [true, false, 0];
      tween._tweenies[0]._props.onStart.apply(null, args);
      expect(tween._props.onStart.calls.mostRecent().args).toEqual(args);

      var args = [true, true, 0];
      tween._tweenies[1]._props.onStart.apply(null, args);
      expect(tween._props.onStart.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 0];
      tween._tweenies[2]._props.onStart.apply(null, args);
      expect(tween._props.onStart.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 0];
      tween._tweenies[3]._props.onStart.apply(null, args);
      expect(tween._props.onStart.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 0];
      tween._tweenies[4]._props.onStart.apply(null, args);
      expect(tween._props.onStart.calls.mostRecent().args).toEqual(args);
    });

    it('should set `_ac` to `true`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);

      tween._onStart(false, false, 1);
      expect(tween._ac).toBeFalsy();

      tween._onStart(false, false, 0);
      expect(tween._ac).toBe(true);
    });
  });

  describe('`_onComplete` callback ->', function () {
    it('should be called by tweenies `onComplete` callback', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween, '_onComplete');

      tween._tweenies[0]._props.onComplete();
      expect(tween._onComplete.calls.count()).toBe(1);

      tween._tweenies[1]._props.onComplete();
      expect(tween._onComplete.calls.count()).toBe(2);

      tween._tweenies[2]._props.onComplete();
      expect(tween._onComplete.calls.count()).toBe(3);

      tween._tweenies[3]._props.onComplete();
      expect(tween._onComplete.calls.count()).toBe(4);

      tween._tweenies[4]._props.onComplete();
      expect(tween._onComplete.calls.count()).toBe(5);

      tween._tweenies[5]._props.onComplete();
      expect(tween._onComplete.calls.count()).toBe(6);
    });

    it('should be call `onRepeatComplete` callback', function () {
      var options = {
        onRepeatComplete: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onRepeatComplete');

      tween._tweenies[0]._props.onComplete(true);
      expect(tween._props.onRepeatComplete.calls.count()).toBe(1);

      tween._tweenies[1]._props.onComplete(true);
      expect(tween._props.onRepeatComplete.calls.count()).toBe(2);

      tween._tweenies[2]._props.onComplete(true);
      expect(tween._props.onRepeatComplete.calls.count()).toBe(3);

      tween._tweenies[3]._props.onComplete(true);
      expect(tween._props.onRepeatComplete.calls.count()).toBe(4);

      tween._tweenies[4]._props.onComplete(true);
      expect(tween._props.onRepeatComplete.calls.count()).toBe(5);

      tween._tweenies[5]._props.onComplete(true);
      expect(tween._props.onRepeatComplete.calls.count()).toBe(6);
    });

    it('should pass 3 args to `onRepeatComplete` callback', function () {
      var options = {
        onRepeatComplete: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onRepeatComplete');

      var args = [true, false, 5];
      tween._tweenies[0]._props.onComplete.apply(null, args);
      expect(tween._props.onRepeatComplete.calls.mostRecent().args).toEqual(args);

      var args = [true, true, 5];
      tween._tweenies[1]._props.onComplete.apply(null, args);
      expect(tween._props.onRepeatComplete.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[2]._props.onComplete.apply(null, args);
      expect(tween._props.onRepeatComplete.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[3]._props.onComplete.apply(null, args);
      expect(tween._props.onRepeatComplete.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[4]._props.onComplete.apply(null, args);
      expect(tween._props.onRepeatComplete.calls.mostRecent().args).toEqual(args);
    });

    it('should be call `onComplete` callback if the last item', function () {
      var options = {
        onComplete: function() {},
        onRepeatComplete: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onComplete').and.callThrough();

      tween._tweenies[0]._props.onComplete();
      expect(tween._props.onComplete.calls.count()).toBe(0);

      tween._tweenies[1]._props.onComplete();
      expect(tween._props.onComplete.calls.count()).toBe(0);

      tween._tweenies[2]._props.onComplete();
      expect(tween._props.onComplete.calls.count()).toBe(0);

      tween._tweenies[3]._props.onComplete();
      expect(tween._props.onComplete.calls.count()).toBe(0);

      tween._tweenies[4]._props.onComplete();
      expect(tween._props.onComplete.calls.count()).toBe(0);

      tween._tweenies[5]._props.onComplete(true, false, 5);
      expect(tween._props.onComplete.calls.count()).toBe(1);
    });

    it('should pass the 3 arguments to the `onComplete`', function () {
      var options = {
        onComplete: function() {},
        onRepeatComplete: function() {},
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      tween.setStartTime();

      spyOn(tween._props, 'onComplete').and.callThrough();

      var args = [true, false, 5];
      tween._tweenies[0]._props.onComplete.apply(null, args);
      expect(tween._props.onComplete.calls.mostRecent().args).toEqual(args);

      var args = [true, true, 5];
      tween._tweenies[1]._props.onComplete.apply(null, args);
      expect(tween._props.onComplete.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[2]._props.onComplete.apply(null, args);
      expect(tween._props.onComplete.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[3]._props.onComplete.apply(null, args);
      expect(tween._props.onComplete.calls.mostRecent().args).toEqual(args);

      var args = [false, true, 5];
      tween._tweenies[4]._props.onComplete.apply(null, args);
      expect(tween._props.onComplete.calls.mostRecent().args).toEqual(args);
    });

    it('should set `_ac` to `true`', function () {
      var options = {
        onUpdate: function() {},
        repeat: 5
      };

      var tween = new Tween(options);

      tween._onComplete(true, false, 4);
      expect(tween._ac).toBeFalsy();

      tween._onComplete(true, false, 5);
      expect(tween._ac).toBe(true);
    });
  });

  // `onProgress` is not needed yet
  // describe('`onProgress` callback ->', function () {
  //   it('should be called with current `progress`', function () {
  //     var progress = -1;
  //     var duration = 200;
  //
  //     var options = {
  //       duration: duration,
  //       onProgress: function(p) {
  //         progress = p;
  //       },
  //       repeat: 2
  //     };
  //
  //     var tween = new Tween(options);
  //     tween.setStartTime();
  //     var startTime = tween._start;
  //
  //     tween._p = -1;
  //     expect(progress).toBe(-1);
  //
  //     tween.update(startTime);
  //     expect(progress).toBeCloseTo(0, 3);
  //     expect(tween._p).toBeCloseTo(0, 3);
  //
  //     tween.update(startTime + duration/2);
  //     expect(progress).toBeCloseTo(0.16666666666666666, 3);
  //     expect(tween._p).toBeCloseTo(0.16666666666666666, 3);
  //
  //     tween.update(startTime + duration);
  //     expect(progress).toBeCloseTo(0.3333333333333333, 3);
  //     expect(tween._p).toBeCloseTo(0.3333333333333333, 3);
  //
  //     tween.update(startTime + 1.5*duration);
  //     expect(progress).toBeCloseTo(.5, 3);
  //     expect(tween._p).toBeCloseTo(.5, 3);
  //
  //     tween.update(startTime + 2*duration);
  //     expect(progress).toBeCloseTo(0.6666666666666666, 3);
  //     expect(tween._p).toBeCloseTo(0.6666666666666666, 3);
  //
  //     tween.update(startTime + 2.5*duration);
  //     expect(progress).toBeCloseTo(0.8333333333333334, 3);
  //     expect(tween._p).toBeCloseTo(0.8333333333333334, 3);
  //
  //     tween.update(startTime + 3*duration);
  //     expect(progress).toBeCloseTo(1, 3);
  //     expect(tween._p).toBeCloseTo(1, 3);
  //   });
  // });

  // not needed yet
  describe('`onRefresh` callback ->', function () {
    it('should pass the `onRefresh` callback to the first tweenie', function () {
      var progress = -1;
      var duration = 200;

      var options = {
        duration: duration,
        onRefresh: function() {},
        repeat: 5
      };

      var tween = new Tween(options);
      expect(tween._tweenies[0]._props.onRefresh).toBe(options.onRefresh);
    });
  });

  describe('_setState function ->', function() {
    it('should set playback state', function() {
      var tween = new Tween();
      tween._setState('play');
      expect(tween._state).toBe('play');
    });
    it('should track previous playback state', function() {
      var t;
      t = new Tween;
      t._setState('play');
      t._setState('pause');
      expect(t._prevState).toBe('play');
      expect(t._state).toBe('pause');
    });
    describe('onPlaybackStart / play callback ->', function() {
      it('should call `onPlaybackStart` method if `play`', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration,
          onPlaybackStart: function() {}
        });
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('play');
        expect(tween._props.onPlaybackStart).toHaveBeenCalledWith('play', 'stop');
      });
      it('should call `onPlaybackStart` method if `play` after `pause`', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration
        });
        tween._setState('play');
        tween._setState('pause');
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('play');
        expect(tween._props.onPlaybackStart).toHaveBeenCalledWith('play', 'pause');
      });
      it('should not call `onPlaybackStart` method if already `play`', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration
        });
        tween._setState('play');
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('play');
        expect(tween._props.onPlaybackStart).not.toHaveBeenCalled();
      });
      it('should not call `onPlaybackStart` method if already `reverse`', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration
        });
        tween._setState('reverse');
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('play');
        expect(tween._props.onPlaybackStart).not.toHaveBeenCalled();
      });
    });

    describe('onPlaybackStart / reverse callback ->', function() {
      it('should call `onPlaybackStart` method if `reverse`', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration
        });
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('reverse');
        expect(tween._props.onPlaybackStart).toHaveBeenCalled();
      });
      it('should call onPlaybackStart method if reverse', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration
        });
        tween._setState('reverse');
        tween._setState('pause');
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('reverse');
        expect(tween._props.onPlaybackStart).toHaveBeenCalled();
      });
      it('should not call onPlaybackStart method if already reverse', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration
        });
        tween._setState('reverse');
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('reverse');
        expect(tween._props.onPlaybackStart).not.toHaveBeenCalled();
      });
      it('should not call onPlaybackStart method if already play', function() {
        var duration = 50;
        var tween = new Tween({
          duration: duration
        });
        tween._setState('play');
        spyOn(tween._props, 'onPlaybackStart');
        tween._setState('reverse');
        expect(tween._props.onPlaybackStart).not.toHaveBeenCalled();
      });
    });

    describe('onPlaybackPause / pause callback ->', function() {
      it('should call onPlaybackPause method if pause', function() {
        var tween = new Tween();
        tween._setState('play');
        spyOn(tween._props, 'onPlaybackPause');
        tween._setState('pause');
        return expect(tween._props.onPlaybackPause).toHaveBeenCalled();
      });
      it('should call onPlaybackPause method if play', function() {
        var tween = new Tween();
        tween._setState('play');
        spyOn(tween._props, 'onPlaybackPause');
        tween._setState('pause');
        expect(tween._props.onPlaybackPause).toHaveBeenCalled();
      });
      it('should call onPlaybackPause method if already was reverse', function() {
        var tween = new Tween();
        tween._setState('reverse');
        spyOn(tween._props, 'onPlaybackPause');
        tween._setState('pause');
        expect(tween._props.onPlaybackPause).toHaveBeenCalled();
      });
      it('should not call onPlaybackPause method if already stopped', function() {
        var tween = new Tween();
        spyOn(tween._props, 'onPlaybackPause');
        tween._setState('pause');
        expect(tween._props.onPlaybackPause).not.toHaveBeenCalled();
      });
      it('should not call onPlaybackPause method if already paused', function() {
        var tween = new Tween();
        tween._setState('play');
        tween._setState('pause');
        spyOn(tween._props, 'onPlaybackPause');
        tween._setState('pause');
        expect(tween._props.onPlaybackPause).not.toHaveBeenCalled();
      });
    });
    describe('onPlaybackStop / stop callback ->', function() {
      it('should call onPlaybackStop method if stop', function() {
        var tween = new Tween();
        tween._setState('play');
        spyOn(tween._props, 'onPlaybackStop');
        tween._setState('stop');
        expect(tween._props.onPlaybackStop).toHaveBeenCalled();
      });
      it('should call onPlaybackStop method if stop', function() {
        var tween = new Tween();
        tween._setState('play');
        spyOn(tween._props, 'onPlaybackStop');
        tween._setState('stop');
        expect(tween._props.onPlaybackStop).toHaveBeenCalled();
      });
      it('should call onPlaybackStop method if was play', function() {
        var tween = new Tween();
        tween._setState('play');
        spyOn(tween._props, 'onPlaybackStop');
        tween._setState('stop');
        expect(tween._props.onPlaybackStop).toHaveBeenCalled();
      });
      it('should call onPlaybackStop method if already paused', function() {
        var tween = new Tween();
        tween._setState('play');
        tween._setState('pause');
        spyOn(tween._props, 'onPlaybackStop');
        tween._setState('stop');
        expect(tween._props.onPlaybackStop).toHaveBeenCalled();
      });
      it('should not call onPlaybackStop method if already stopped', function() {
        var tween = new Tween();
        spyOn(tween._props, 'onPlaybackStop');
        tween._setState('stop');
        expect(tween._props.onPlaybackStop).not.toHaveBeenCalled();
      });
    });
  });

  describe('`_updateUFwd` function ->', function() {
    it('should update the first and the last tweenies', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      var start = tween._start;

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update');

      tween._updateUFwd(start);

      expect(tween._tweenies[0].update).toHaveBeenCalledWith(start);
      expect(tween._tweenies[tween._tweenies.length-1].update).toHaveBeenCalledWith(start);
    });

    it('should set _act to the `0` tweenie', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      tween._active = 0;
      tween._act = tween._tweenies[0];

      var start = tween._start;

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update');

      tween._updateUFwd(start);

      expect(tween._tweenies[0].update).toHaveBeenCalledWith(start);
      expect(tween._tweenies[tween._tweenies.length-1].update).toHaveBeenCalledWith(start);

      expect(tween._act).toBe(tween._tweenies[0]);
      expect(tween._active).toBe(0);
    });

    it('should set _act to the `last` tweenie', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      var end = tween._end;

      spyOn(tween._tweenies[0], 'update').and.callThrough();
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update').and.callThrough();

      // the first update to the the `_prevTime`
      tween._updateUFwd(end + 10);
      tween._updateUFwd(end);

      expect(tween._tweenies[0].update).toHaveBeenCalledWith(end);
      expect(tween._tweenies[tween._tweenies.length-1].update).toHaveBeenCalledWith(end);

      expect(tween._act).toBe(tween._tweenies[tween._tweenies.length-1]);
      expect(tween._active).toBe(tween._tweenies.length-1);
    });

    it('should not update when out of bounds', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      var end = tween._end + 100;

      spyOn(tween._tweenies[0], 'update').and.callThrough();
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update').and.callThrough();

      tween._updateUFwd(end);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(end);
      expect(tween._tweenies[tween._tweenies.length-1].update).not.toHaveBeenCalledWith(end);
    });
  });

  describe('`_updateURev` function ->', function() {
    it('should update the first and the last tweenies', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      var start = tween._start;
      var end = tween._end;

      spyOn(tween._tweenies[0], 'update');
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update');

      var time = start;
      var revTime = end + (start - time);
      tween._updateURev(time);

      expect(tween._tweenies[0].update.calls.mostRecent().args[0]).toBeCloseTo(revTime,3);
      expect(tween._tweenies[tween._tweenies.length-1].update.calls.mostRecent().args[0]).toBeCloseTo(revTime,3);
    });

    it('should set _act to the `last` tweenie', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      var start = tween._start;
      var end = tween._end;

      spyOn(tween._tweenies[0], 'update').and.callThrough();
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update').and.callThrough();

      var time = start;
      var revTime = end + (start - time);
      // the first update to set the `_prevTime`
      tween._updateURev(time - 10);
      tween._updateURev(time);

      expect(tween._act).toBe(tween._tweenies[tween._tweenies.length-1]);
      expect(tween._active).toBe(tween._tweenies.length-1);
    });

    it('should set _act to the `0` tweenie', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      tween._active = 0;
      tween._act = tween._tweenies[0];

      var start = tween._start;
      var end = tween._end;

      spyOn(tween._tweenies[0], 'update').and.callThrough();
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update').and.callThrough();

      var time = start;
      var revTime = end + (start - time);
      tween._updateURev(revTime);

      expect(tween._act).toBe(tween._tweenies[0]);
      expect(tween._active).toBe(0);
    });

    it('should not update when out of bounds', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      var start = tween._start;
      var end = tween._end;

      spyOn(tween._tweenies[0], 'update').and.callThrough();
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update').and.callThrough();

      var time = start - 200;
      var revTime = end + (start - time);
      tween._updateURev(time);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(revTime);
      expect(tween._tweenies[tween._tweenies.length-1].update).not.toHaveBeenCalledWith(revTime);
    });

    it('should not update when out of bounds #2', function() {
      var tween = new Tween({
        repeat: 5
      });
      tween.setStartTime();
      var start = tween._start;
      var end = tween._end;

      spyOn(tween._tweenies[0], 'update').and.callThrough();
      spyOn(tween._tweenies[tween._tweenies.length-1], 'update').and.callThrough();

      var time = start - 200;
      var revTime = end + (start - time);
      tween._updateURev(revTime + 200);

      expect(tween._tweenies[0].update).not.toHaveBeenCalledWith(time - 200);
      expect(tween._tweenies[tween._tweenies.length-1].update).not.toHaveBeenCalledWith(time - 200);
    });
  });

  describe('`play` function ->', function() {
    it('should call the `_setState` function', function() {
      var tween = new Tween();
      spyOn(tween, '_setState');
      tween.play();

      expect(tween._setState).toHaveBeenCalledWith('play');
    });

    it('should call the `_setupPlay` function', function() {
      var tween = new Tween();
      spyOn(tween, '_setupPlay');
      tween.play();

      expect(tween._setupPlay).toHaveBeenCalledWith('play');
    });

    it('should return `this`', function() {
      var tween = new Tween();
      var result = tween.play();

      expect(result).toBe(tween);
    });

    it('should return if already playing', function() {
      var tween = new Tween();
      tween._state = 'play';
      spyOn(tween, 'setStartTime');
      var result = tween.play();

      expect(result).toBe(tween);
      expect(tween.setStartTime).not.toHaveBeenCalled();
    });
  });

  describe('`pause` function ->', function() {
    it('should call the `tweener.remove` function', function() {
      var tween = new Tween();
      tween.play();
      spyOn(tweener, 'remove');
      tween.pause();

      expect(tweener.remove).toHaveBeenCalledWith(tween);
    });

    it('should call the `_setState` function', function() {
      var tween = new Tween();
      tween.play();
      spyOn(tween, '_setState');
      tween.pause();

      expect(tween._setState).toHaveBeenCalledWith('pause');
    });

    it('should not call the `_setState` if already `paused`', function() {
      var tween = new Tween();
      tween.pause();
      spyOn(tween, '_setState');
      tween.pause();

      expect(tween._setState).not.toHaveBeenCalledWith('pause');
    });

    it('should not call the `_setState` if already `stopped`', function() {
      var tween = new Tween();
      tween._state = 'stop';
      spyOn(tween, '_setState');
      tween.pause();

      expect(tween._setState).not.toHaveBeenCalledWith('pause');
    });

    it('should return `this`', function() {
      var tween = new Tween();
      var result = tween.pause();

      expect(result).toBe(tween);
    });
  });

  describe('`reverse` function ->', function() {
    it('should flip `isReverse` in `_props`', function() {
      var tween = new Tween();
      tween.reverse();
      expect(tween._props.isReverse).toBe(true);
      tween.reverse();
      expect(tween._props.isReverse).toBe(false);
    });
    it('should flip the `_update` function if `_elapsed`', function() {
      var tween = new Tween();
      tween.reverse();
      tween._elapsed = 200;
      expect(tween._props.isReverse).toBe(true);
      expect(tween.update).toBe(tween._updateRev);
      tween.reverse();
      expect(tween._props.isReverse).toBe(false);
      expect(tween.update).toBe(tween._updateFwd);
    });

    it('should call `_setupUpdateFunction` is `_elapsed` is `0`', function() {
      var tween = new Tween();
      spyOn(tween, '_setupUpdateFunction');
      tween.reverse();
      expect(tween._setupUpdateFunction).toHaveBeenCalled();
    });
    it('should flip the `_elapsed` time', function() {
      var delay = 200;
      var duration = 800;
      var tween = new Tween({
        delay: delay,
        duration: duration
      });

      tween.setStartTime();
      var start = tween._start;
      tween.update(start - delay);
      tween.update(start);
      tween.update(start + duration / 2);

      var elapsed = tween._elapsed;

      tween.reverse();
      expect(tween._elapsed).toBe((tween._end - tween._spot) - (elapsed - delay));
    });

    it('should not flip the `_elapsed` time if `0`', function() {
      var delay = 200;
      var duration = 800;
      var tween = new Tween({
        delay: delay,
        duration: duration
      });

      var elapsed = tween._elapsed;

      tween.reverse();
      expect(tween._elapsed).toBe(0);
    });
    it('should return `this`', function() {
      var tween = new Tween();
      var result = tween.reverse();

      expect(result).toBe(tween);
    });
  });

  describe('`_setupPlay` function ->', function() {
    it('should call the `setStartTime` function', function() {
      var tween = new Tween();
      spyOn(tween, 'setStartTime');
      tween._setupPlay();

      expect(tween.setStartTime).toHaveBeenCalledWith();
    });
    it('should add the tween to the `tweener`', function() {
      var tween = new Tween();
      spyOn(tweener, 'add');
      tween._setupPlay();

      expect(tweener.add).toHaveBeenCalledWith(tween);
    });
  });

  describe('`onTweenerFinish` function ->', function() {
    it('should call the `_setState` function', function() {
      var tween = new Tween();
      spyOn(tween, '_setState');
      tween.onTweenerFinish();

      expect(tween._setState).toHaveBeenCalledWith('stop');
    });

    it('should envoke `onPlaybackComplete` callback', function() {
      var tween = new Tween();
      spyOn(tween._props, 'onPlaybackComplete');
      tween.onTweenerFinish();

      expect(tween._props.onPlaybackComplete).toHaveBeenCalled();
    });

    it('should call the `reset` function', function() {
      var tween = new Tween();
      spyOn(tween, 'reset');
      tween.onTweenerFinish();

      expect(tween.reset).toHaveBeenCalled();
    });
  });

  describe('`reset` function ->', function() {
    it('should `reset` all tweenies', function() {
      var tween = new Tween({
        repeat: 2
      });
      spyOn(tween._tweenies[0], 'reset');
      spyOn(tween._tweenies[1], 'reset');
      spyOn(tween._tweenies[2], 'reset');
      tween.reset();

      expect(tween._tweenies[0].reset).toHaveBeenCalled();
      expect(tween._tweenies[1].reset).toHaveBeenCalled();
      expect(tween._tweenies[2].reset).toHaveBeenCalled();
    });

    it('should set `_elapsed` to 0', function() {
      var tween = new Tween({
        repeat: 2
      });

      tween._elapsed = 100;
      tween.reset();
      expect(tween._elapsed).toBe(0);
    });

    // nope
    // it('should call `_setupUpdateFunction`', function () {
    //   var tween = new Tween();
    //   spyOn(tween, '_setupUpdateFunction');
    //   tween.reset();
    //   expect(tween._setupUpdateFunction).toHaveBeenCalled();
    // });
  });

  describe('`setupUpdateFunction` function ->', function() {
    it('should set to `_updateUFwd`', function() {
      var tween = new Tween({
        repeat: 2
      });

      tween.update = 200;

      tween._setupUpdateFunction();
      expect(tween.update).toBe(tween._updateUFwd);
    });

    it('should set to `_updateURev`', function() {
      var tween = new Tween({
        repeat: 2,
        isReverse: true
      });

      tween.update = 200;

      tween._setupUpdateFunction();
      expect(tween.update).toBe(tween._updateURev);
    });

    it('should set to `_updateFwd`', function() {
      var tween = new Tween();

      tween.update = 200;

      tween._setupUpdateFunction();
      expect(tween.update).toBe(tween._updateFwd);
    });

    it('should set to `_updateRev`', function() {
      var tween = new Tween({
        isReverse: true
      });

      tween.update = 200;

      tween._setupUpdateFunction();
      expect(tween.update).toBe(tween._updateRev);
    });
  });
});
