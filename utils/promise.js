// 控制并发请求方法
export const handQueue = (reqs) => {

}

// dequeue 函数 concurrency：最大并发数  current: 当前请求数
export const dequeue = () => {
  while(current < concurrency && queue.length) {
    current++;
    const requestPromiseFactory = queue.shift(); // 出列
    requestPromiseFactory()
      .then(() => { // success

      })
      .catch(() => { // fail

      })
      .finally(() => {
        current--;
        dequeue();
      })
  }
}

function Person () {};

const person = new Person();

person._proto_; // 实例的原型
Person.prototype; // 构造函数的Prototype 指向实例的原型

//so 
person._proto_ === Person.prototype; // true

// 每个原型都有一个constructor
Person === Person.prototype.constructor;

Person === person._proto_.constructor;

// ES5 获取对象原型的方法 getPrototypeOf();
Object.getPrototypeOf(person) === person._proto_ === Person.prototype