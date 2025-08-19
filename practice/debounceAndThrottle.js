const debounce = (func, wait) => {
    let timeout
    return function(...args){
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            func.apply(this, args)
        }, wait)
    }
}

const testFunc = (time) => {
    console.log('执行时间:', time);
}

// const debouncedTestFunc = debounce(testFunc, 1000)
// debouncedTestFunc(1)
// debouncedTestFunc(3)


function throttle(func, wait) {
    let isThrottle = false;
    let lastArgs = null;  // 保存最后一次的参数
    let timeout;

    return function(...args) {
        lastArgs = args;  // 总是更新为最新的参数

        if (!isThrottle) {
            // 立即执行一次
            func.apply(this, args);
            isThrottle = true;

            // 间隔结束后，重置状态，并执行最后一次的参数
            timeout = setTimeout(() => {
                isThrottle = false;
                if (lastArgs !== null) {
                    func.apply(this, lastArgs);
                    lastArgs = null;
                }
            }, wait);
        }
    };
}

const throttledTestFunc = throttle(testFunc, 1000);

const testThrottleFunc = () => {
    setInterval(() => {
        let time = new Date().toLocaleTimeString();
        throttledTestFunc(time);
    }, 100);
}

testThrottleFunc();