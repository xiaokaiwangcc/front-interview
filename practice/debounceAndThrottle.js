const debounce = (func, wait) => {
    let timeout
    return function(...args){
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            func.apply(this, args)
        }, wait)
    }
}

// 测试用例
const testFunc = (a, b) => {
    console.log(a, b)
}
// const debouncedTestFunc = debounce(testFunc, 1000)
// debouncedTestFunc(1, 2)
// debouncedTestFunc(3, 4)


function throttle(func, wait) {
    let isThrottle = false;
    let lastArgs; // 存储最后一次触发的参数
    let timeout;  // 声明定时器变量

    return function(...args) {
        // 记录最后一次的参数
        lastArgs = args;

        if (!isThrottle) {
            // 立即执行一次
            func.apply(this, lastArgs);
            isThrottle = true;

            // 间隔结束后，重置状态，并检查是否有未执行的参数
            timeout = setTimeout(() => {
                isThrottle = false;
                // 如果在间隔内有新触发，执行最后一次的参数
                if (lastArgs) {
                    func.apply(this, lastArgs);
                    lastArgs = null; // 清空参数，避免重复执行
                }
            }, wait);
        }
    };
}
const throttledTestFunc = throttle(testFunc, 50)

throttledTestFunc(1, 2)
throttledTestFunc(3, 4)
throttledTestFunc(5, 6)