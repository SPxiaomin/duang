def((Item) => class extends Item {
  get tagName() { return `span`; }
  init() {
    this.resolveAt().then(() => this.buildComponent());
  }
  resolveAt() {
    let path = [];
    if (depot.scheme) path.push(depot.key);
    return function callee(base) {
      let tasks = [];
      Object.keys(base).forEach(i => {
        let item = base[i];
        if (i[0] === '@') {
          let task = api(path.concat(item), { expires: 1000 }).then(result => {
            base[i.slice(1)] = result;
          });
          tasks.push(task);
        } else {
          if (typeof item === 'object') {
            tasks.push(callee(item));
          }
        }
      });
      return Promise.all(tasks).then(() => base);
    }(this).catch(error => {
      throw new Error(`Component "${component}" args loading error with "${error.message}"`);
    });
  }
  get $promise() {
    let resolve;
    let value = new Promise($resolve => resolve = $resolve);
    value.then(() => {
      if (typeof this.onReady === 'function') this.onReady();
    });
    value.resolve = resolve;
    Object.defineProperty(this, '$promise', { value });
    return value;
  }
  get value() { return this.$value; }
  set value(value) {
    this.$value = value;
    this.$promise.then(() => {
      this.input.value = value;
    });
  }
});