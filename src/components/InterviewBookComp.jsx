import { useState, useMemo, useRef } from "react";

const CONCEPTS = {
  JavaScript: [
    {
      id: "js-var",
      title: "var, let, const",
      tags: ["scope", "hoisting"],
      definition:
        "Three ways to declare variables. var is function-scoped and hoisted; let and const are block-scoped and not hoisted to usable state.",
      syntax: "var x = 1;\nlet y = 2;\nconst z = 3;",
      parts:
        "var → function-scoped, hoisted, re-declarable\nlet → block-scoped, reassignable\nconst → block-scoped, not reassignable",
      example:
        "if (true) {\n  var a = 'visible outside';\n  let b = 'block only';\n}\nconsole.log(a); // works\nconsole.log(b); // ReferenceError",
      howItWorks:
        "1. var declarations are hoisted to function top\n2. let/const are in Temporal Dead Zone until line\n3. const binding can't change, but object contents can",
      keyTakeaway:
        "Use const by default, let when reassignment needed, avoid var.",
      difficulty: "beginner",
    },
    {
      id: "js-closure",
      title: "Closure",
      tags: ["scope", "functions"],
      definition:
        "A closure is a function that retains access to its outer (lexical) scope even after the outer function has finished executing.",
      syntax:
        "function outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  };\n}",
      parts:
        "Outer function → creates scope\nInner function → closes over variables\nLexical scope → captured environment",
      example:
        "const counter = outer();\ncounter(); // 1\ncounter(); // 2\ncounter(); // 3",
      howItWorks:
        "1. outer() runs and creates count\n2. inner() is returned but remembers count\n3. Each call to inner() accesses same count\n4. count persists in memory via closure",
      keyTakeaway:
        "Closures enable data privacy and stateful functions without classes.",
      difficulty: "intermediate",
    },
    {
      id: "js-eventloop",
      title: "Event Loop",
      tags: ["async", "runtime"],
      definition:
        "The event loop is JavaScript's mechanism to handle asynchronous callbacks by continuously checking the call stack and queuing tasks from the callback/microtask queues.",
      syntax:
        "console.log('1');\nsetTimeout(() => console.log('3'), 0);\nPromise.resolve().then(() => console.log('2'));\n// Output: 1, 2, 3",
      parts:
        "Call Stack → executes synchronous code\nTask Queue → setTimeout, setInterval callbacks\nMicrotask Queue → Promise callbacks (higher priority)\nEvent Loop → moves tasks to stack when empty",
      example:
        "// Microtasks run before macrotasks\nasync function run() {\n  console.log('start');\n  await Promise.resolve();\n  console.log('after await');\n}\nrun();\nconsole.log('sync');",
      howItWorks:
        "1. Sync code runs on call stack\n2. Async ops sent to Web APIs\n3. Callbacks added to queues when done\n4. Event loop checks: stack empty? → run microtasks → run next macrotask",
      keyTakeaway:
        "Microtasks (Promises) always run before macrotasks (setTimeout), even with 0ms delay.",
      difficulty: "advanced",
    },
    {
      id: "js-promise",
      title: "Promise",
      tags: ["async"],
      definition:
        "A Promise represents the eventual result of an asynchronous operation. It can be in one of three states: pending, fulfilled, or rejected.",
      syntax:
        "const p = new Promise((resolve, reject) => {\n  // async work\n  resolve(value); // or reject(error)\n});\np.then(val => ...).catch(err => ...);",
      parts:
        "resolve → fulfills the promise\nreject → rejects with error\n.then() → handles success\n.catch() → handles failure\n.finally() → runs always",
      example:
        "function fetchUser(id) {\n  return new Promise((resolve, reject) => {\n    if (id) resolve({ id, name: 'Alice' });\n    else reject(new Error('No ID'));\n  });\n}",
      howItWorks:
        "1. Promise created as 'pending'\n2. Async operation runs\n3. resolve() → moves to 'fulfilled'\n4. reject() → moves to 'rejected'\n5. .then/.catch handlers run in microtask queue",
      keyTakeaway:
        "Promises avoid callback hell. Chain .then() calls for sequential async operations.",
      difficulty: "intermediate",
    },
    {
      id: "js-asyncawait",
      title: "Async / Await",
      tags: ["async"],
      definition:
        "async/await is syntactic sugar over Promises that lets you write asynchronous code in a synchronous style.",
      syntax:
        "async function fetchData() {\n  try {\n    const data = await fetch(url);\n    const json = await data.json();\n    return json;\n  } catch (err) {\n    console.error(err);\n  }\n}",
      parts:
        "async → marks function as returning a Promise\nawait → pauses execution until Promise settles\ntry/catch → handles rejected Promises",
      example:
        "const getUser = async (id) => {\n  const res = await fetch(`/api/users/${id}`);\n  const user = await res.json();\n  return user;\n};",
      howItWorks:
        "1. async function always returns a Promise\n2. await suspends function execution\n3. Other tasks run while waiting\n4. Resumes when Promise resolves\n5. try/catch catches rejections",
      keyTakeaway:
        "Use async/await for readable async code. Always handle errors with try/catch.",
      difficulty: "intermediate",
    },
    {
      id: "js-hoisting",
      title: "Hoisting",
      tags: ["scope"],
      definition:
        "Hoisting is JavaScript's behavior of moving declarations to the top of their scope during the compilation phase, before code execution.",
      syntax:
        "console.log(x); // undefined (not error)\nvar x = 5;\n\ngreet(); // works!\nfunction greet() { console.log('Hi'); }",
      parts:
        "Variable hoisting → var declarations moved to top (undefined)\nFunction hoisting → entire function definition hoisted\nlet/const → hoisted but not initialized (TDZ)",
      example:
        "// What JS sees:\nvar x; // hoisted\nfunction greet() { console.log('Hi'); } // hoisted\nconsole.log(x); // undefined\nx = 5;\ngreet(); // 'Hi'",
      howItWorks:
        "1. JS engine scans code before executing\n2. var and function declarations stored in memory\n3. var initialized to undefined\n4. Functions stored completely\n5. let/const in temporal dead zone",
      keyTakeaway:
        "Only declarations are hoisted, not initializations. Functions hoist completely, var hoists as undefined.",
      difficulty: "intermediate",
    },
    {
      id: "js-this",
      title: "this keyword",
      tags: ["context"],
      definition:
        "this refers to the context in which a function is called. Its value depends on how the function is invoked, not where it is defined.",
      syntax:
        "// Arrow functions inherit this\nconst obj = {\n  name: 'Alice',\n  greet: function() { return this.name; },\n  arrow: () => this.name // undefined\n};",
      parts:
        "Global → this = window/global\nMethod call → this = object\nConstructor → this = new instance\nArrow function → this = enclosing scope",
      example:
        "class Timer {\n  constructor() { this.seconds = 0; }\n  start() {\n    setInterval(() => {\n      this.seconds++; // arrow preserves this\n    }, 1000);\n  }\n}",
      howItWorks:
        "1. Regular function: this set at call time\n2. Arrow function: this set at definition time\n3. .call()/.apply()/.bind() can explicitly set this\n4. class methods: this = instance by default",
      keyTakeaway:
        "Use arrow functions in callbacks to preserve this. Avoid this confusion in event handlers.",
      difficulty: "intermediate",
    },
    {
      id: "js-debounce",
      title: "Debounce",
      tags: ["performance"],
      definition:
        "Debounce delays executing a function until after a specified wait time has elapsed since the last time it was called. Used to limit rapid-fire events.",
      syntax:
        "function debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
      parts:
        "fn → the function to debounce\ndelay → wait time in ms\ntimer → tracks the timeout\nclearTimeout → cancels previous timer",
      example:
        "const searchUsers = debounce((query) => {\n  fetch(/api/search?q=${query}`);\n}, 300);\n\ninput.addEventListener('input', (e) => {\n  searchUsers(e.target.value);\n});",
      howItWorks:
        "1. Event fires, timer starts\n2. If event fires again before delay → timer resets\n3. Only executes after delay with no new calls\n4. Prevents excessive API calls while typing",
      keyTakeaway:
        "Use debounce for search inputs, resize handlers. Lodash has _.debounce() built-in.",
      difficulty: "intermediate",
    },
    {
      id: "js-currying",
      title: "Currying",
      tags: ["functional"],
      definition:
        "Currying transforms a function that takes multiple arguments into a sequence of functions, each taking a single argument.",
      syntax:
        "// Normal: add(2, 3)\n// Curried: add(2)(3)\nconst add = (a) => (b) => a + b;\nconst add5 = add(5);\nadd5(3); // 8",
      parts:
        "Curried function → returns a new function\nPartial application → fix some arguments early\nComposition → combine curried functions",
      example:
        "const multiply = (a) => (b) => a * b;\nconst double = multiply(2);\nconst triple = multiply(3);\ndouble(5); // 10\ntriple(5); // 15",
      howItWorks:
        "1. Call with first arg → returns function\n2. Call returned function with second arg\n3. Process repeats for each argument\n4. Final call returns computed result",
      keyTakeaway:
        "Currying enables reusable specialized functions via partial application.",
      difficulty: "advanced",
    },
    {
      id: "js-map-filter-reduce",
      title: "map / filter / reduce",
      tags: ["arrays", "functional"],
      definition:
        "Three higher-order array methods for transforming data. map transforms each element, filter selects elements, reduce accumulates to a single value.",
      syntax:
        "arr.map(fn)      // transform\narr.filter(fn)   // select\narr.reduce(fn, init) // accumulate",
      parts:
        "map → returns new array, same length\nfilter → returns new array, equal or shorter\nreduce → returns single accumulated value\nAll → do not mutate original array",
      example:
        "const nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconst evens = nums.filter(n => n % 2 === 0);\nconst sum = nums.reduce((acc, n) => acc + n, 0);",
      howItWorks:
        "1. map: applies fn to each element → new array\n2. filter: tests each element with fn → keeps truthy\n3. reduce: accumulates result with initial value → single output\n4. Chain them: arr.filter(...).map(...).reduce(...)",
      keyTakeaway:
        "Prefer map/filter/reduce over for loops for cleaner, functional-style array transformations.",
      difficulty: "beginner",
    },
  ],
  TypeScript: [
    {
      id: "ts-types",
      title: "Types & Interfaces",
      tags: ["types"],
      definition:
        "TypeScript adds static typing to JavaScript. Types and Interfaces define the shape of data. Types are more flexible; Interfaces are better for object shapes and class contracts.",
      syntax:
        "type User = { name: string; age: number };\ninterface Product {\n  id: number;\n  title: string;\n  price: number;\n}",
      parts:
        "type → aliases for any type including unions\ninterface → defines object/class shape\nExtend → interface extends; type uses &\nImplement → class implements interface",
      example:
        "interface Animal {\n  name: string;\n  speak(): string;\n}\nclass Dog implements Animal {\n  name = 'Rex';\n  speak() { return 'Woof'; }\n}",
      howItWorks:
        "1. TypeScript checks types at compile time\n2. No runtime overhead — types erased\n3. IDE provides autocomplete and error hints\n4. Type errors caught before running code",
      keyTakeaway:
        "Use interface for objects/classes, type for unions, primitives, and complex type aliases.",
      difficulty: "beginner",
    },
    {
      id: "ts-generics",
      title: "Generics",
      tags: ["types", "advanced"],
      definition:
        "Generics allow writing reusable, type-safe code that works with multiple types without sacrificing type safety.",
      syntax:
        "function identity<T>(arg: T): T {\n  return arg;\n}\nconst num = identity<number>(42);\nconst str = identity<string>('hi');",
      parts:
        "T → type parameter (placeholder)\n<T> → declares the generic\nConstraints → T extends SomeType\nDefault → T = string",
      example:
        "function getFirst<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}",
      howItWorks:
        "1. Generic type inferred or explicitly passed\n2. T replaced with actual type at usage\n3. TypeScript ensures type consistency\n4. Single function handles many types safely",
      keyTakeaway:
        "Generics replace 'any' with actual type safety. Essential for reusable utilities and API types.",
      difficulty: "intermediate",
    },
    {
      id: "ts-utility-types",
      title: "Utility Types",
      tags: ["types"],
      definition:
        "TypeScript provides built-in utility types to transform existing types, reducing repetition and improving type safety.",
      syntax:
        "Partial<T>    // all props optional\nRequired<T>   // all props required\nPick<T,K>     // select keys\nOmit<T,K>     // exclude keys\nReadonly<T>   // immutable",
      parts:
        "Partial<T> → makes all fields optional\nRequired<T> → makes all fields required\nPick<T, K> → select specific keys\nOmit<T, K> → exclude specific keys\nRecord<K, V> → object with key/value types",
      example:
        "interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\ntype UpdateUser = Partial<Omit<User, 'id'>>;\n// { name?: string; email?: string }",
      howItWorks:
        "1. Utility types are generic type transformers\n2. Built into TypeScript standard library\n3. Compose them for complex type manipulation\n4. No runtime cost — compile-time only",
      keyTakeaway:
        "Utility types save you from duplicating type definitions. Partial and Omit are the most common.",
      difficulty: "intermediate",
    },
    {
      id: "ts-enums",
      title: "Enums",
      tags: ["types"],
      definition:
        "Enums define a set of named constants, making code more readable and avoiding magic strings or numbers.",
      syntax:
        "enum Direction {\n  Up = 'UP',\n  Down = 'DOWN',\n  Left = 'LEFT',\n  Right = 'RIGHT'\n}",
      parts:
        "Numeric enum → auto-increments from 0\nString enum → explicit string values\nConst enum → inlined at compile time\nHeterogene → mixed (avoid)",
      example:
        "enum Status {\n  Pending = 'PENDING',\n  Active = 'ACTIVE',\n  Inactive = 'INACTIVE'\n}\n\nfunction updateStatus(s: Status) {\n  if (s === Status.Active) { ... }\n}",
      howItWorks:
        "1. Enum compiled to JS object\n2. Members accessed via dot notation\n3. String enums preferred for debugging\n4. const enum inlines values (no JS object)",
      keyTakeaway:
        "Use string enums for readable values. Avoid numeric enums in APIs.",
      difficulty: "beginner",
    },
  ],
  React: [
    {
      id: "react-usestate",
      title: "useState",
      tags: ["hooks", "state"],
      definition:
        "useState is a React Hook that lets functional components hold and update local state. State changes trigger re-renders.",
      syntax: "const [state, setState] = useState(initialValue);",
      parts:
        "state → current value\nsetState → updater function\ninitialValue → value on first render\nsetState(fn) → functional update form",
      example:
        "function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  );\n}",
      howItWorks:
        "1. Component renders with initial state\n2. User action calls setState\n3. React queues a re-render\n4. Component re-runs with new state value\n5. UI updates to reflect new state",
      keyTakeaway:
        "Never mutate state directly. Use the setter function. Use functional updates when new state depends on old state.",
      difficulty: "beginner",
    },
    {
      id: "react-useeffect",
      title: "useEffect",
      tags: ["hooks", "lifecycle"],
      definition:
        "useEffect lets you perform side effects in functional components — data fetching, subscriptions, DOM manipulation — after rendering.",
      syntax:
        "useEffect(() => {\n  // side effect\n  return () => { /* cleanup */ };\n}, [dependencies]);",
      parts:
        "Effect function → runs after render\nCleanup function → returned function, runs before next effect\nDependency array → controls when effect runs\nEmpty [] → runs only once (on mount)",
      example:
        "useEffect(() => {\n  const sub = socket.subscribe(userId);\n  return () => sub.unsubscribe();\n}, [userId]); // re-runs when userId changes",
      howItWorks:
        "1. Component renders\n2. React runs effect after paint\n3. If deps changed → cleanup old effect → run new effect\n4. On unmount → cleanup runs",
      keyTakeaway:
        "Always specify dependencies. Always return cleanup for subscriptions and timers to prevent memory leaks.",
      difficulty: "intermediate",
    },
    {
      id: "react-usememo",
      title: "useMemo",
      tags: ["hooks", "performance"],
      definition:
        "useMemo memoizes the result of an expensive calculation, recomputing only when dependencies change.",
      syntax:
        "const value = useMemo(() => {\n  return expensiveComputation(a, b);\n}, [a, b]);",
      parts:
        "Factory function → computation to memoize\nDependency array → triggers recomputation\nMemoized value → cached result",
      example:
        "const sortedList = useMemo(() => {\n  return [...items].sort((a, b) =>\n    a.price - b.price\n  );\n}, [items]); // only re-sorts when items change",
      howItWorks:
        "1. On first render, runs computation\n2. Stores result in memory\n3. On re-render, compares deps\n4. If deps unchanged → returns cached value\n5. If deps changed → recomputes",
      keyTakeaway:
        "Use useMemo for expensive computations. Don't overuse — it has its own overhead for simple values.",
      difficulty: "intermediate",
    },
    {
      id: "react-usecallback",
      title: "useCallback",
      tags: ["hooks", "performance"],
      definition:
        "useCallback memoizes a function reference, preventing child components from re-rendering when a callback passed as prop hasn't changed.",
      syntax:
        "const fn = useCallback(() => {\n  doSomething(a, b);\n}, [a, b]);",
      parts:
        "Callback → function to memoize\nDependency array → when to create new function\nStable reference → prevents unnecessary re-renders",
      example:
        "const handleClick = useCallback((id) => {\n  dispatch({ type: 'DELETE', payload: id });\n}, [dispatch]);\n\n// Pass to memoized child without causing re-renders\n<ItemList onDelete={handleClick} />",
      howItWorks:
        "1. Returns same function reference if deps unchanged\n2. New function created when deps change\n3. Combined with React.memo prevents unnecessary renders\n4. Without it, new function = new prop = child re-renders",
      keyTakeaway:
        "useCallback is only useful when passing callbacks to memoized components. Pair with React.memo.",
      difficulty: "intermediate",
    },
    {
      id: "react-useref",
      title: "useRef",
      tags: ["hooks", "dom"],
      definition:
        "useRef returns a mutable ref object whose .current property persists across re-renders. Used for DOM access and storing mutable values without triggering re-renders.",
      syntax:
        "const ref = useRef(initialValue);\n// DOM: <input ref={ref} />\n// Access: ref.current",
      parts:
        "ref.current → mutable value\nDOM ref → reference to DOM element\nMutable value → stores data without re-render",
      example:
        "function FocusInput() {\n  const inputRef = useRef(null);\n  const focus = () => inputRef.current.focus();\n  return (\n    <>\n      <input ref={inputRef} />\n      <button onClick={focus}>Focus</button>\n    </>\n  );\n}",
      howItWorks:
        "1. useRef creates a plain object {current: value}\n2. Object persists across renders (same reference)\n3. Mutating .current does NOT trigger re-render\n4. React assigns DOM node to ref.current after mount",
      keyTakeaway:
        "Use refs for DOM manipulation and storing previous values. Changing ref.current never causes a re-render.",
      difficulty: "intermediate",
    },
    {
      id: "react-context",
      title: "Context API",
      tags: ["state", "architecture"],
      definition:
        "React Context provides a way to pass data through the component tree without prop drilling. Ideal for global state like theme, auth, or language.",
      syntax:
        "const Ctx = createContext(defaultValue);\n// Provider:\n<Ctx.Provider value={data}>\n// Consumer:\nconst data = useContext(Ctx);",
      parts:
        "createContext → creates context object\nProvider → wraps tree, supplies value\nuseContext → subscribes to context\ndefaultValue → used without Provider",
      example:
        "const ThemeCtx = createContext('light');\nfunction App() {\n  const [theme, setTheme] = useState('dark');\n  return (\n    <ThemeCtx.Provider value={theme}>\n      <Page />\n    </ThemeCtx.Provider>\n  );\n}\nfunction Page() {\n  const theme = useContext(ThemeCtx);\n}",
      howItWorks:
        "1. Create context with default value\n2. Wrap component tree with Provider\n3. Any descendant can consume via useContext\n4. All consumers re-render when Provider value changes",
      keyTakeaway:
        "Context solves prop drilling. For complex state, combine with useReducer or use Redux.",
      difficulty: "intermediate",
    },
    {
      id: "react-virtual-dom",
      title: "Virtual DOM",
      tags: ["internals", "performance"],
      definition:
        "The Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to compute minimal DOM updates through a process called reconciliation.",
      syntax:
        "// React compares old and new Virtual DOM\n// Only updates changed parts in real DOM\n// Called 'diffing algorithm'",
      parts:
        "Virtual DOM → in-memory DOM copy\nDiffing → comparing old vs new vDOM\nReconciliation → computing minimal changes\nFiber → React's reconciliation engine",
      example:
        "// Instead of clearing and re-rendering all:\ndocument.getElementById('app').innerHTML = '';\n// React surgically updates only what changed:\n// <li>Item 3</li> → <li>Item 3 (updated)</li>",
      howItWorks:
        "1. State changes → new Virtual DOM created\n2. Diffing compares new vs old vDOM\n3. Algorithm finds minimal set of changes\n4. Only those changes applied to real DOM\n5. Batch updates in one reflow/repaint",
      keyTakeaway:
        "Virtual DOM makes React fast by minimizing expensive real DOM operations.",
      difficulty: "intermediate",
    },
    {
      id: "react-memo",
      title: "React.memo",
      tags: ["performance"],
      definition:
        "React.memo is a Higher Order Component that memoizes a functional component, preventing re-renders when props haven't changed.",
      syntax:
        "const MemoComponent = React.memo(function Comp({ name }) {\n  return <div>{name}</div>;\n});",
      parts:
        "HOC wrapper → wraps your component\nShallow comparison → compares props by reference\nCustom comparator → optional second argument",
      example:
        "const ExpensiveList = React.memo(({ items, onDelete }) => {\n  return items.map(item => (\n    <Item key={item.id} data={item} onDelete={onDelete} />\n  ));\n});",
      howItWorks:
        "1. Component wrapped in React.memo\n2. Parent re-renders → React checks props\n3. If props shallowly equal → skips re-render\n4. If props changed → re-renders normally",
      keyTakeaway:
        "Pair React.memo with useCallback for passed functions. Avoid for cheap components — memoization has cost too.",
      difficulty: "intermediate",
    },
  ],
  "Node.js": [
    {
      id: "node-eventloop",
      title: "Node.js Event Loop",
      tags: ["async", "runtime"],
      definition:
        "Node.js is single-threaded but handles concurrency through its event loop and non-blocking I/O. The event loop processes callbacks in phases.",
      syntax:
        "// Phases: timers → I/O → poll → check → close\n// setImmediate > setTimeout(0) in I/O callbacks\nsetImmediate(() => console.log('check phase'));\nsetTimeout(() => console.log('timers'), 0);",
      parts:
        "Timers phase → executes setTimeout/setInterval\nI/O callbacks → handles I/O events\nPoll phase → waits for new I/O events\nCheck phase → setImmediate callbacks\nprocess.nextTick → before next phase",
      example:
        "// process.nextTick has highest priority\nsetTimeout(() => console.log('timeout'), 0);\nsetImmediate(() => console.log('immediate'));\nprocess.nextTick(() => console.log('nextTick'));\n// Output: nextTick → timeout → immediate",
      howItWorks:
        "1. Main code runs\n2. Event loop starts: timers → I/O → poll → check\n3. process.nextTick queue clears between each phase\n4. Microtasks (Promises) also clear between phases\n5. Loop continues until no more callbacks",
      keyTakeaway:
        "process.nextTick runs before Promises, which run before setTimeout. Understanding phases prevents bugs.",
      difficulty: "advanced",
    },
    {
      id: "node-streams",
      title: "Streams",
      tags: ["performance", "I/O"],
      definition:
        "Streams process data in chunks instead of loading everything into memory at once. Essential for handling large files or network data efficiently.",
      syntax:
        "const readable = fs.createReadStream('file.txt');\nconst writable = fs.createWriteStream('out.txt');\nreadable.pipe(writable);",
      parts:
        "Readable → read data (fs.createReadStream)\nWritable → write data (fs.createWriteStream)\nDuplex → read and write\nTransform → modify data while streaming\npipe() → connects streams",
      example:
        "// Process a 10GB file without loading it all\nconst gunzip = require('zlib').createGunzip();\nfs.createReadStream('huge.gz')\n  .pipe(gunzip)\n  .pipe(fs.createWriteStream('huge.txt'));",
      howItWorks:
        "1. Data flows in small chunks (default 64KB)\n2. Backpressure prevents overwhelming memory\n3. pipe() handles flow control automatically\n4. Transform streams modify data on the fly",
      keyTakeaway:
        "Use streams for file processing, HTTP responses, and any large data. Prevents out-of-memory errors.",
      difficulty: "intermediate",
    },
    {
      id: "node-middleware",
      title: "Middleware Pattern",
      tags: ["express", "patterns"],
      definition:
        "Middleware are functions that have access to request, response, and the next middleware in Express.js pipeline. They run in sequence.",
      syntax:
        "app.use((req, res, next) => {\n  // do something\n  next(); // pass to next middleware\n});",
      parts:
        "req → HTTP request object\nres → HTTP response object\nnext → calls next middleware\nError middleware → (err, req, res, next)",
      example:
        "// Auth middleware\nconst auth = (req, res, next) => {\n  const token = req.headers.authorization;\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  req.user = verify(token);\n  next();\n};\napp.get('/protected', auth, handler);",
      howItWorks:
        "1. Request arrives\n2. Middleware 1 runs → calls next()\n3. Middleware 2 runs → calls next()\n4. Route handler runs → sends response\n5. Error middleware catches if next(err) called",
      keyTakeaway:
        "Middleware enables modular, reusable request processing. Order matters — auth before routes.",
      difficulty: "intermediate",
    },
    {
      id: "node-jwt",
      title: "JWT Authentication",
      tags: ["auth", "security"],
      definition:
        "JSON Web Token (JWT) is a compact, self-contained token for securely transmitting information. Used for stateless authentication.",
      syntax:
        "// Header.Payload.Signature\neyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abc123\n\njwt.sign(payload, secret, { expiresIn: '1h' })\njwt.verify(token, secret)",
      parts:
        "Header → algorithm type (base64 encoded)\nPayload → claims/data (base64 encoded)\nSignature → HMAC of header + payload\nSecret → server-side signing key",
      example:
        "// Login: create token\nconst token = jwt.sign(\n  { userId: user._id, role: user.role },\n  process.env.JWT_SECRET,\n  { expiresIn: '7d' }\n);\n\n// Request: verify token\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);",
      howItWorks:
        "1. User logs in → server creates signed JWT\n2. Client stores JWT (localStorage or httpOnly cookie)\n3. Client sends JWT in Authorization header\n4. Server verifies signature on each request\n5. No database lookup needed — stateless",
      keyTakeaway:
        "JWT is stateless — no session storage needed. Store in httpOnly cookies (not localStorage) to prevent XSS.",
      difficulty: "intermediate",
    },
  ],
  MongoDB: [
    {
      id: "mongo-crud",
      title: "CRUD Operations",
      tags: ["basics"],
      definition:
        "CRUD stands for Create, Read, Update, Delete — the four basic operations for interacting with a MongoDB database.",
      syntax:
        "db.users.insertOne({ name: 'Alice' })\ndb.users.find({ age: { $gte: 18 } })\ndb.users.updateOne({ _id }, { $set: { name } })\ndb.users.deleteOne({ _id })",
      parts:
        "insertOne/insertMany → Create\nfind/findOne → Read\nupdateOne/updateMany → Update\ndeleteOne/deleteMany → Delete\n$set, $push, $pull → Update operators",
      example:
        "// With Mongoose\nawait User.create({ name: 'Bob', age: 25 });\nconst user = await User.findById(id);\nawait User.findByIdAndUpdate(id, { $set: { age: 26 } });\nawait User.findByIdAndDelete(id);",
      howItWorks:
        "1. MongoDB stores data as BSON documents\n2. Collections = tables, Documents = rows\n3. Each document has unique _id (ObjectId)\n4. Queries use JSON-like filter objects\n5. Indexes speed up find operations",
      keyTakeaway:
        "MongoDB's flexible schema means no migrations for structure changes. Use $set to avoid overwriting entire documents.",
      difficulty: "beginner",
    },
    {
      id: "mongo-aggregation",
      title: "Aggregation Pipeline",
      tags: ["advanced", "queries"],
      definition:
        "The aggregation pipeline processes documents through stages to compute results like grouping, filtering, sorting, and transforming data.",
      syntax:
        "db.orders.aggregate([\n  { $match: { status: 'active' } },\n  { $group: { _id: '$userId', total: { $sum: '$amount' } } },\n  { $sort: { total: -1 } }\n])",
      parts:
        "$match → filter documents (like WHERE)\n$group → group and aggregate (like GROUP BY)\n$sort → order results\n$project → shape output fields\n$lookup → join collections\n$unwind → flatten arrays",
      example:
        "// Top 5 customers by spend\nawait Order.aggregate([\n  { $match: { createdAt: { $gte: lastMonth } } },\n  { $group: { _id: '$customerId', spend: { $sum: '$total' } } },\n  { $sort: { spend: -1 } },\n  { $limit: 5 }\n]);",
      howItWorks:
        "1. Documents enter first stage\n2. Output of each stage = input for next\n3. $match early to reduce document count\n4. $group computes aggregate values\n5. Result returned from final stage",
      keyTakeaway:
        "Place $match and $limit as early as possible to reduce data processed through later stages.",
      difficulty: "advanced",
    },
    {
      id: "mongo-indexing",
      title: "Indexing",
      tags: ["performance"],
      definition:
        "Indexes in MongoDB store a small portion of data in an easy-to-traverse form. They dramatically speed up queries but slow down writes.",
      syntax:
        "db.users.createIndex({ email: 1 }); // ascending\ndb.users.createIndex({ email: 1 }, { unique: true });\ndb.posts.createIndex({ title: 'text' }); // text search",
      parts:
        "Single field → index one field\nCompound → index multiple fields\nUnique → enforces uniqueness\nText → enables text search\nTTL → auto-expire documents",
      example:
        "// Without index: full collection scan O(n)\n// With index: B-tree lookup O(log n)\n\n// Explain query plan:\ndb.users.find({ email: 'a@b.com' }).explain('executionStats')\n// Look for 'IXSCAN' vs 'COLLSCAN'",
      howItWorks:
        "1. Index stores field values + document pointer\n2. Query uses index to find documents quickly\n3. B-tree structure for range queries\n4. Multiple indexes → query planner picks best\n5. Too many indexes → slower writes, more memory",
      keyTakeaway:
        "Index fields you query frequently. Check with .explain(). Don't index every field — writes get slower.",
      difficulty: "intermediate",
    },
  ],
  "System Design": [
    {
      id: "sd-load-balancer",
      title: "Load Balancer",
      tags: ["scalability", "infrastructure"],
      definition:
        "A load balancer distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed, improving availability and performance.",
      syntax:
        "Client → Load Balancer → [Server 1, Server 2, Server 3]\n\nAlgorithms: Round Robin, Least Connections,\nIP Hash, Weighted Round Robin",
      parts:
        "Round Robin → rotate through servers equally\nLeast Connections → send to least busy server\nIP Hash → same client → same server (sticky sessions)\nHealth Check → remove unhealthy servers automatically",
      example:
        "// Nginx load balancer config\nupstream backend {\n  least_conn;\n  server server1:3000;\n  server server2:3000;\n  server server3:3000;\n}",
      howItWorks:
        "1. Request arrives at load balancer\n2. Algorithm selects target server\n3. Request forwarded to server\n4. Response returned via load balancer\n5. Health checks remove failed servers",
      keyTakeaway:
        "Load balancers are critical for high availability. Layer 7 (HTTP) load balancers can route based on URL paths.",
      difficulty: "intermediate",
    },
    {
      id: "sd-caching",
      title: "Caching",
      tags: ["performance", "scalability"],
      definition:
        "Caching stores frequently accessed data in fast storage (memory) to reduce database load and latency. Redis is the most common cache solution.",
      syntax:
        "// Cache-aside pattern:\n1. Check cache (Redis)\n2. Cache miss → query DB\n3. Store result in cache\n4. Return data",
      parts:
        "Cache-aside → app manages cache\nWrite-through → write to cache + DB together\nWrite-behind → write to cache, async DB update\nTTL → time-to-live, auto-expiry\nEviction → LRU, LFU, FIFO policies",
      example:
        "const getUser = async (id) => {\n  const cached = await redis.get(`user:${id}`);\n  if (cached) return JSON.parse(cached);\n  \n  const user = await User.findById(id);\n  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);\n  return user;\n};",
      howItWorks:
        "1. Request checks cache first\n2. Cache hit → return data instantly\n3. Cache miss → fetch from DB\n4. Store in cache with TTL\n5. TTL expires → next request fetches fresh data",
      keyTakeaway:
        "Cache read-heavy data. Always consider cache invalidation — what happens when underlying data changes?",
      difficulty: "intermediate",
    },
    {
      id: "sd-horizontal-scaling",
      title: "Horizontal vs Vertical Scaling",
      tags: ["scalability"],
      definition:
        "Vertical scaling adds more power to existing servers. Horizontal scaling adds more servers. Horizontal is preferred for large systems.",
      syntax:
        "Vertical (Scale Up):\n  t3.micro → t3.xlarge → t3.2xlarge\n\nHorizontal (Scale Out):\n  1 server → 3 servers → 10 servers",
      parts:
        "Vertical scaling → CPU, RAM, faster disk\nHorizontal scaling → add more instances\nStateless apps → required for horizontal scaling\nSharding → horizontal scaling for databases",
      example:
        "// Vertical: has limits (max RAM/CPU)\n// Horizontal: needs stateless design\n\n// Store sessions in Redis, not server memory\napp.use(session({\n  store: new RedisStore({ client: redis }),\n  secret: process.env.SESSION_SECRET\n}));",
      howItWorks:
        "1. Vertical: easy, but has hardware limits and single point of failure\n2. Horizontal: requires stateless design\n3. Shared nothing architecture for horizontal\n4. Load balancer distributes across horizontal servers",
      keyTakeaway:
        "Design apps stateless from the start for horizontal scalability. Session data belongs in Redis, not memory.",
      difficulty: "intermediate",
    },
    {
      id: "sd-message-queue",
      title: "Message Queue",
      tags: ["async", "scalability"],
      definition:
        "Message queues (RabbitMQ, Kafka, Bull) decouple producers from consumers, enabling async processing and preventing service overload during traffic spikes.",
      syntax:
        "Producer → [Queue: job_queue] → Consumer\n\n// Bull with Redis:\nqueue.add({ userId, email }); // producer\nqueue.process(async (job) => { ... }); // consumer",
      parts:
        "Producer → adds messages to queue\nConsumer → processes messages\nQueue → stores messages temporarily\nAck → consumer acknowledges success\nDead Letter Queue → failed messages",
      example:
        "// Don't block HTTP response for email sending\napp.post('/register', async (req, res) => {\n  const user = await User.create(req.body);\n  await emailQueue.add({ to: user.email }); // non-blocking\n  res.json({ success: true }); // returns immediately\n});",
      howItWorks:
        "1. HTTP request completes immediately\n2. Job added to queue\n3. Worker processes job asynchronously\n4. Retries on failure (configurable)\n5. No coupling between services",
      keyTakeaway:
        "Queues improve resilience and scalability. Use for emails, notifications, image processing, and any non-blocking work.",
      difficulty: "intermediate",
    },
  ],
  "React Advanced": [
    {
      id: "react-lazy",
      title: "Lazy Loading & Suspense",
      tags: ["performance", "code-splitting"],
      definition:
        "React.lazy() enables code-splitting — loading components only when they're needed. Suspense provides a fallback UI while the lazy component loads.",
      syntax:
        "const LazyComp = React.lazy(() => import('./Heavy'));\n\n<Suspense fallback={<Spinner />}>\n  <LazyComp />\n</Suspense>",
      parts:
        "React.lazy() → dynamic import wrapper\nSuspense → catches loading state\nfallback → shown while loading\nError Boundary → catches import failures",
      example:
        "const Dashboard = React.lazy(() => import('./Dashboard'));\nconst Settings = React.lazy(() => import('./Settings'));\n\nfunction App() {\n  return (\n    <Suspense fallback={<Loading />}>\n      <Router>\n        <Route path='/dashboard' component={Dashboard} />\n        <Route path='/settings' component={Settings} />\n      </Router>\n    </Suspense>\n  );\n}",
      howItWorks:
        "1. Bundle split at lazy() import point\n2. Initial JS bundle doesn't include lazy component\n3. When component first renders → dynamic import fires\n4. Suspense shows fallback during load\n5. Component renders when JS chunk arrives",
      keyTakeaway:
        "Lazy load routes and heavy components to reduce initial bundle size. Combine with Suspense for smooth UX.",
      difficulty: "intermediate",
    },
    {
      id: "react-error-boundary",
      title: "Error Boundaries",
      tags: ["error handling"],
      definition:
        "Error Boundaries are React class components that catch JavaScript errors anywhere in their child component tree and display a fallback UI instead of crashing.",
      syntax:
        "class ErrorBoundary extends Component {\n  state = { hasError: false };\n  static getDerivedStateFromError() {\n    return { hasError: true };\n  }\n  render() {\n    if (this.state.hasError) return <Fallback />;\n    return this.props.children;\n  }\n}",
      parts:
        "getDerivedStateFromError → update state on error\ncomponentDidCatch → log error details\nfallback UI → shown when error caught\nBoundary scope → only catches render errors",
      example:
        "<ErrorBoundary fallback={<ErrorPage />}>\n  <UserProfile id={userId} />\n</ErrorBoundary>",
      howItWorks:
        "1. Child component throws during render\n2. Error bubbles up to nearest ErrorBoundary\n3. getDerivedStateFromError sets error state\n4. componentDidCatch logs the error\n5. Fallback UI renders instead of crashed tree",
      keyTakeaway:
        "Error Boundaries prevent full app crashes. Wrap each major section in its own boundary for granular error handling.",
      difficulty: "advanced",
    },
  ],
  "CSS & Tailwind": [
    {
      id: "css-flexbox",
      title: "Flexbox",
      tags: ["layout"],
      definition:
        "Flexbox is a one-dimensional CSS layout system for arranging items in a row or column, with powerful alignment and distribution controls.",
      syntax:
        ".container {\n  display: flex;\n  justify-content: center; /* main axis */\n  align-items: center;    /* cross axis */\n  gap: 1rem;\n}",
      parts:
        "flex-direction → row | column\njustify-content → main axis alignment\nalign-items → cross axis alignment\nflex-wrap → wrap items to new lines\nflex-grow/shrink → how items resize",
      example:
        "/* Center anything */\n.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n\n/* Tailwind: flex justify-center items-center min-h-screen */",
      howItWorks:
        "1. Parent becomes flex container\n2. Direct children become flex items\n3. Main axis = direction of flex\n4. justify-content aligns along main axis\n5. align-items aligns along cross axis",
      keyTakeaway:
        "Flexbox for 1D layouts (rows/columns). Grid for 2D. Flexbox excels at centering and distributing space.",
      difficulty: "beginner",
    },
    {
      id: "css-grid",
      title: "CSS Grid",
      tags: ["layout"],
      definition:
        "CSS Grid is a two-dimensional layout system for creating complex row and column layouts. It gives precise control over placement and sizing.",
      syntax:
        ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: auto;\n  gap: 1rem;\n}",
      parts:
        "grid-template-columns → define column sizes\ngrid-template-rows → define row sizes\nfr unit → fraction of available space\ngap → space between items\ngrid-area → name areas for placement",
      example:
        "/* 12-column responsive grid */\n.layout {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1.5rem;\n}\n\n/* Tailwind: grid grid-cols-1 md:grid-cols-3 gap-6 */",
      howItWorks:
        "1. Parent becomes grid container\n2. Define rows and columns with template\n3. Items placed in cells automatically\n4. Or explicitly placed with grid-column/row\n5. fr distributes remaining space proportionally",
      keyTakeaway:
        "Grid for 2D layouts. Use auto-fit with minmax() for responsive grids without media queries.",
      difficulty: "intermediate",
    },
    {
      id: "tailwind-basics",
      title: "Tailwind CSS Core",
      tags: ["tailwind", "utility-first"],
      definition:
        "Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS, you compose designs using small, single-purpose classes directly in HTML.",
      syntax:
        '/* Traditional CSS */\n.btn { padding: 0.5rem 1rem; background: blue; }\n\n/* Tailwind */\n<button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">',
      parts:
        "Spacing → p-4, m-2, gap-6\nTypography → text-lg, font-bold, text-gray-900\nLayout → flex, grid, hidden\nColors → bg-blue-500, text-red-600\nResponsive → sm:, md:, lg:, xl:",
      example:
        '<!-- Card component -->\n<div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">\n  <h2 class="text-xl font-semibold text-gray-900 mb-2">Title</h2>\n  <p class="text-gray-600 leading-relaxed">Content</p>\n</div>',
      howItWorks:
        "1. Classes map directly to CSS properties\n2. JIT compiler generates only used styles\n3. Responsive prefixes apply at breakpoints\n4. Hover/focus/active state variants\n5. Extend via tailwind.config.js",
      keyTakeaway:
        "Tailwind eliminates context-switching between HTML and CSS. Purge unused styles in production for tiny CSS bundles.",
      difficulty: "beginner",
    },
  ],
  "Git & DevOps": [
    {
      id: "git-core",
      title: "Git Core Commands",
      tags: ["git", "version-control"],
      definition:
        "Git is a distributed version control system. These are the commands you use in every project.",
      syntax:
        "git init / git clone <url>\ngit add . / git commit -m 'msg'\ngit push / git pull\ngit branch / git checkout -b feature\ngit merge / git rebase",
      parts:
        "Working Directory → your local files\nStaging Area → files ready to commit\nLocal Repo → committed history\nRemote → GitHub, GitLab origin",
      example:
        "# Feature branch workflow:\ngit checkout -b feature/user-auth\ngit add .\ngit commit -m 'feat: add JWT authentication'\ngit push origin feature/user-auth\n# Open Pull Request on GitHub",
      howItWorks:
        "1. git add moves changes to staging\n2. git commit saves snapshot to local repo\n3. git push syncs local to remote\n4. git pull fetches and merges remote changes\n5. Branches allow parallel development",
      keyTakeaway:
        "Commit often with clear messages. Use branches for features. Never force-push to main/master.",
      difficulty: "beginner",
    },
    {
      id: "git-rebase",
      title: "Merge vs Rebase",
      tags: ["git", "workflow"],
      definition:
        "Merge combines branches and preserves history. Rebase moves commits to a new base, creating a linear history. Both integrate changes differently.",
      syntax:
        "# Merge (preserves history):\ngit merge feature-branch\n\n# Rebase (linear history):\ngit rebase main",
      parts:
        "Merge → creates merge commit, preserves branches\nRebase → rewrites commits onto new base\nFast-forward → merge when no divergence\nInteractive rebase → squash, reorder commits",
      example:
        "# Clean up feature branch before PR:\ngit checkout feature/auth\ngit rebase -i main # squash commits\n# Force push ONLY your own branch:\ngit push --force-with-lease origin feature/auth",
      howItWorks:
        "1. Merge: finds common ancestor → new merge commit\n2. Rebase: detaches commits → replays on top of new base\n3. Interactive: lets you edit each commit\n4. Rebasing rewrites history — only on unshared branches",
      keyTakeaway:
        "Merge for shared branches. Rebase to clean up personal feature branches before merging. Never rebase shared branches.",
      difficulty: "intermediate",
    },
  ],
  "REST & APIs": [
    {
      id: "rest-methods",
      title: "REST API Methods",
      tags: ["http", "api"],
      definition:
        "REST (Representational State Transfer) uses HTTP methods to perform operations on resources. Each method has a specific semantic meaning.",
      syntax:
        "GET    /users         → list users\nGET    /users/:id     → get one user\nPOST   /users         → create user\nPUT    /users/:id     → replace user\nPATCH  /users/:id     → update fields\nDELETE /users/:id     → delete user",
      parts:
        "GET → idempotent, no body, cacheable\nPOST → creates resource, not idempotent\nPUT → replaces entire resource\nPATCH → partial update\nDELETE → removes resource",
      example:
        "// Express routes following REST\nrouter.get('/products', getAll);\nrouter.get('/products/:id', getOne);\nrouter.post('/products', create);\nrouter.patch('/products/:id', update);\nrouter.delete('/products/:id', remove);",
      howItWorks:
        "1. Client sends HTTP request with method + path\n2. Server routes to appropriate handler\n3. Handler processes request (DB operation)\n4. Returns appropriate status code + data\n5. Client handles response",
      keyTakeaway:
        "Status codes matter: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.",
      difficulty: "beginner",
    },
    {
      id: "rest-status-codes",
      title: "HTTP Status Codes",
      tags: ["http"],
      definition:
        "HTTP status codes communicate the result of a request. They're grouped into 5 classes: 1xx informational, 2xx success, 3xx redirect, 4xx client error, 5xx server error.",
      syntax:
        "2xx Success:   200 OK, 201 Created, 204 No Content\n3xx Redirect:  301 Moved, 304 Not Modified\n4xx Client:    400 Bad Req, 401 Unauth, 403 Forbidden, 404 Not Found\n5xx Server:    500 Error, 502 Bad Gateway, 503 Unavailable",
      parts:
        "200 → request succeeded\n201 → resource created\n400 → invalid request\n401 → not authenticated\n403 → not authorized\n404 → not found\n500 → server error",
      example:
        "// Return correct status codes\napp.post('/users', async (req, res) => {\n  if (!req.body.email) return res.status(400).json({ error: 'Email required' });\n  const user = await User.create(req.body);\n  res.status(201).json(user); // 201 for created\n});",
      howItWorks:
        "1. Server processes request\n2. Determines outcome\n3. Sets appropriate status code\n4. Returns response with code + body\n5. Client handles based on code range",
      keyTakeaway:
        "401 = not authenticated (who are you?). 403 = not authorized (I know who you are, but you can't do this).",
      difficulty: "beginner",
    },
  ],
};

const QUIZ_QUESTIONS = [
  {
    q: "What does the Virtual DOM do in React?",
    options: [
      "Stores data in memory",
      "Creates a lightweight copy of the DOM for diffing",
      "Renders components to a canvas",
      "Handles HTTP requests",
    ],
    answer: 1,
  },
  {
    q: "Which array method returns a new array of the same length?",
    options: ["filter()", "reduce()", "map()", "find()"],
    answer: 2,
  },
  {
    q: "What is a closure in JavaScript?",
    options: [
      "A way to close browser tabs",
      "A function that remembers its outer scope",
      "A CSS selector",
      "An async pattern",
    ],
    answer: 1,
  },
  {
    q: "What does the dependency array in useEffect do?",
    options: [
      "Lists props the component needs",
      "Controls when the effect re-runs",
      "Declares context consumers",
      "Sets the initial state",
    ],
    answer: 1,
  },
  {
    q: "Which HTTP status code means 'Unauthorized'?",
    options: ["400", "403", "401", "404"],
    answer: 2,
  },
  {
    q: "In MongoDB, what does $match do in an aggregation pipeline?",
    options: [
      "Joins two collections",
      "Filters documents",
      "Groups documents",
      "Transforms field names",
    ],
    answer: 1,
  },
  {
    q: "What is the purpose of process.nextTick in Node.js?",
    options: [
      "Moves to next line of code",
      "Schedules callback before I/O events in the event loop",
      "Creates a new process",
      "Sets a timer",
    ],
    answer: 1,
  },
  {
    q: "What does useCallback return?",
    options: [
      "A memoized value",
      "A memoized function reference",
      "A new component",
      "A ref object",
    ],
    answer: 1,
  },
];

const CATEGORIES = Object.keys(CONCEPTS);
const ALL_CONCEPTS = Object.entries(CONCEPTS).flatMap(([cat, items]) =>
  items.map((item) => ({ ...item, category: cat })),
);

const STICKY_COLORS = {
  definition: {
    bg: "#fef08a",
    border: "#eab308",
    text: "#713f12",
    label: "Definition",
    emoji: "📖",
  },
  syntax: {
    bg: "#bfdbfe",
    border: "#3b82f6",
    text: "#1e3a8a",
    label: "Syntax",
    emoji: "{ }",
  },
  parts: {
    bg: "#e9d5ff",
    border: "#a855f7",
    text: "#4c1d95",
    label: "Parts",
    emoji: "🔩",
  },
  example: {
    bg: "#fbcfe8",
    border: "#ec4899",
    text: "#831843",
    label: "Example",
    emoji: "💡",
  },
  howItWorks: {
    bg: "#fed7aa",
    border: "#f97316",
    text: "#7c2d12",
    label: "How It Works",
    emoji: "⚙️",
  },
  keyTakeaway: {
    bg: "#bbf7d0",
    border: "#22c55e",
    text: "#14532d",
    label: "Key Takeaway",
    emoji: "✅",
  },
};

const DARK_STICKY_COLORS = {
  definition: {
    bg: "#713f12",
    border: "#eab308",
    text: "#fef9c3",
    label: "Definition",
    emoji: "📖",
  },
  syntax: {
    bg: "#1e3a8a",
    border: "#3b82f6",
    text: "#dbeafe",
    label: "Syntax",
    emoji: "{ }",
  },
  parts: {
    bg: "#4c1d95",
    border: "#a855f7",
    text: "#f3e8ff",
    label: "Parts",
    emoji: "🔩",
  },
  example: {
    bg: "#831843",
    border: "#ec4899",
    text: "#fce7f3",
    label: "Example",
    emoji: "💡",
  },
  howItWorks: {
    bg: "#7c2d12",
    border: "#f97316",
    text: "#ffedd5",
    label: "How It Works",
    emoji: "⚙️",
  },
  keyTakeaway: {
    bg: "#14532d",
    border: "#22c55e",
    text: "#dcfce7",
    label: "Key Takeaway",
    emoji: "✅",
  },
};

export default function InterviewBookComp() {
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState("home"); // home | category | concept | search | quiz | flashcard | interview
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [progress, setProgress] = useState({});
  const [quizState, setQuizState] = useState({
    qIndex: 0,
    selected: null,
    score: 0,
    done: false,
    answers: [],
  });
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEval, setAiEval] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const inputRef = useRef(null);

  const sc = darkMode ? DARK_STICKY_COLORS : STICKY_COLORS;

  const styles = {
    app: {
      minHeight: "100vh",
      background: darkMode ? "#0f0f14" : "#f0f0f5",
      color: darkMode ? "#e2e8f0" : "#1e293b",
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s",
    },
    header: {
      background: darkMode ? "rgba(15,15,20,0.95)" : "rgba(255,255,255,0.95)",
      borderBottom: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
      backdropFilter: "blur(10px)",
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      height: "56px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    logo: {
      fontWeight: 700,
      fontSize: "1.1rem",
      color: darkMode ? "#a78bfa" : "#7c3aed",
      cursor: "pointer",
    },
    navBtn: (active) => ({
      padding: "0.35rem 0.85rem",
      borderRadius: "8px",
      border: "none",
      background: active ? (darkMode ? "#1e1b4b" : "#ede9fe") : "transparent",
      color: active
        ? darkMode
          ? "#a78bfa"
          : "#7c3aed"
        : darkMode
          ? "#94a3b8"
          : "#64748b",
      cursor: "pointer",
      fontSize: "0.82rem",
      fontWeight: 500,
      transition: "all 0.15s",
    }),
    content: { maxWidth: "1100px", margin: "0 auto", padding: "1.5rem 1rem" },
    categoryCard: {
      background: darkMode ? "#161622" : "#ffffff",
      border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "1.25rem",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    conceptCard: {
      background: darkMode ? "#161622" : "#ffffff",
      border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "1rem",
      cursor: "pointer",
      transition: "all 0.15s",
    },
    stickyNote: (type) => ({
      background: sc[type].bg,
      border: `2px solid ${sc[type].border}`,
      borderRadius: "12px",
      padding: "1rem",
    }),
    searchInput: {
      width: "100%",
      padding: "0.75rem 1rem 0.75rem 2.5rem",
      borderRadius: "12px",
      border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
      background: darkMode ? "#161622" : "#ffffff",
      color: darkMode ? "#e2e8f0" : "#1e293b",
      fontSize: "1rem",
      outline: "none",
    },
    btn: (variant = "primary") => ({
      padding: "0.5rem 1.25rem",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.85rem",
      background:
        variant === "primary"
          ? "#7c3aed"
          : variant === "success"
            ? "#16a34a"
            : variant === "danger"
              ? "#dc2626"
              : darkMode
                ? "#1e293b"
                : "#f1f5f9",
      color:
        variant === "ghost" ? (darkMode ? "#94a3b8" : "#64748b") : "#ffffff",
      transition: "all 0.15s",
    }),
    tag: {
      padding: "2px 8px",
      borderRadius: "6px",
      fontSize: "0.72rem",
      fontWeight: 600,
      background: darkMode ? "#1e1b4b" : "#ede9fe",
      color: darkMode ? "#a78bfa" : "#7c3aed",
    },
    progressBar: (pct) => ({
      height: "6px",
      borderRadius: "3px",
      background: darkMode ? "#1e293b" : "#e2e8f0",
      overflow: "hidden",
      position: "relative",
    }),
    progressFill: (pct) => ({
      height: "100%",
      width: `${pct}%`,
      background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
      borderRadius: "3px",
      transition: "width 0.5s",
    }),
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_CONCEPTS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.includes(q)) ||
        c.category.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [searchQuery]);

  const toggleBookmark = (id) => {
    setBookmarks((b) =>
      b.includes(id) ? b.filter((x) => x !== id) : [...b, id],
    );
  };

  const markRead = (id) => {
    setProgress((p) => ({ ...p, [id]: true }));
  };

  const bookmarkedConcepts = ALL_CONCEPTS.filter((c) =>
    bookmarks.includes(c.id),
  );
  const flashcardConcepts = selectedCategory
    ? CONCEPTS[selectedCategory] || []
    : ALL_CONCEPTS;

  const openConcept = (concept) => {
    setSelectedConcept(concept);
    setView("concept");
    markRead(concept.id);
  };

  const openCategory = (cat) => {
    setSelectedCategory(cat);
    setView("category");
  };

  const catProgress = (cat) => {
    const items = CONCEPTS[cat] || [];
    const done = items.filter((c) => progress[c.id]).length;
    return {
      done,
      total: items.length,
      pct: items.length ? Math.round((done / items.length) * 100) : 0,
    };
  };

  const CATEGORY_META = {
    JavaScript: { icon: "⚡", color: "#f59e0b", count: "10+ concepts" },
    TypeScript: { icon: "🔷", color: "#3b82f6", count: "4+ concepts" },
    React: { icon: "⚛️", color: "#06b6d4", count: "8+ concepts" },
    "React Advanced": { icon: "🚀", color: "#8b5cf6", count: "2+ concepts" },
    "Node.js": { icon: "🟢", color: "#22c55e", count: "4+ concepts" },
    MongoDB: { icon: "🍃", color: "#16a34a", count: "3+ concepts" },
    "System Design": { icon: "🏗️", color: "#f97316", count: "4+ concepts" },
    "CSS & Tailwind": { icon: "🎨", color: "#ec4899", count: "3+ concepts" },
    "Git & DevOps": { icon: "🔀", color: "#6366f1", count: "2+ concepts" },
    "REST & APIs": { icon: "🌐", color: "#14b8a6", count: "2+ concepts" },
  };

  const StickyCard = ({ type, content, title }) => {
    const c = sc[type];
    const isCode = type === "syntax" || type === "example";
    return (
      <div style={styles.stickyNote(type)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "0.6rem",
          }}
        >
          <span style={{ fontSize: "1rem" }}>{c.emoji}</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.78rem",
              color: c.text,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {c.label}
          </span>
        </div>
        {isCode ? (
          <pre
            style={{
              margin: 0,
              fontSize: "0.78rem",
              color: c.text,
              whiteSpace: "pre-wrap",
              fontFamily: "'Fira Code', 'Courier New', monospace",
              lineHeight: 1.6,
            }}
          >
            {content}
          </pre>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: c.text,
              lineHeight: 1.6,
              whiteSpace: "pre-line",
            }}
          >
            {content}
          </p>
        )}
      </div>
    );
  };

  // --- VIEWS ---

  const HomeView = () => (
    <div style={styles.content}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            margin: "0 0 0.3rem",
            background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Interview Prep Handbook
        </h1>
        <p
          style={{
            color: darkMode ? "#64748b" : "#94a3b8",
            margin: 0,
            fontSize: "0.95rem",
          }}
        >
          Revise key concepts in 5–10 minutes before your interview
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            label: "🧠 Quiz Mode",
            action: () => {
              setQuizState({
                qIndex: 0,
                selected: null,
                score: 0,
                done: false,
                answers: [],
              });
              setView("quiz");
            },
          },
          {
            label: "🃏 Flashcards",
            action: () => {
              setFlashcardIndex(0);
              setFlashcardFlipped(false);
              setView("flashcard");
            },
          },
          {
            label: "⚡ Interview Mode",
            action: () => {
              setInterviewIndex(0);
              setView("interview");
            },
          },
          {
            label: `⭐ Bookmarks (${bookmarks.length})`,
            action: () => setShowBookmarks(!showBookmarks),
          },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              ...styles.btn("ghost"),
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              padding: "0.5rem 1rem",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {showBookmarks && bookmarkedConcepts.length > 0 && (
        <div
          style={{
            marginBottom: "1.5rem",
            background: darkMode ? "#161622" : "#fff",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "1rem",
          }}
        >
          <p
            style={{
              margin: "0 0 0.75rem",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            ⭐ Bookmarked Concepts
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {bookmarkedConcepts.map((c) => (
              <button
                key={c.id}
                onClick={() => openConcept(c)}
                style={{
                  ...styles.tag,
                  cursor: "pointer",
                  padding: "4px 10px",
                  border: "none",
                  fontSize: "0.82rem",
                }}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat] || {
            icon: "📘",
            color: "#7c3aed",
            count: "",
          };
          const { done, total, pct } = catProgress(cat);
          return (
            <div
              key={cat}
              style={styles.categoryCard}
              onClick={() => openCategory(cat)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>{meta.icon}</div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: darkMode ? "#64748b" : "#94a3b8",
                  }}
                >
                  {meta.count}
                </span>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginBottom: "0.25rem",
                }}
              >
                {cat}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: darkMode ? "#64748b" : "#94a3b8",
                  marginBottom: "0.75rem",
                }}
              >
                {done}/{total} completed
              </div>
              <div style={styles.progressBar(pct)}>
                <div style={styles.progressFill(pct)} />
              </div>
              <div
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.72rem",
                  color: meta.color,
                  fontWeight: 600,
                }}
              >
                {pct}% ready
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const CategoryView = () => {
    const concepts = CONCEPTS[selectedCategory] || [];
    return (
      <div style={styles.content}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={() => setView("home")}
            style={{ ...styles.btn("ghost"), padding: "0.35rem 0.75rem" }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800 }}>
            {selectedCategory}
          </h2>
          <span style={{ ...styles.tag }}>{concepts.length} concepts</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {concepts.map((c) => (
            <div
              key={c.id}
              style={{
                ...styles.conceptCard,
                borderLeft: progress[c.id]
                  ? "3px solid #22c55e"
                  : darkMode
                    ? "3px solid #1e293b"
                    : "3px solid #e2e8f0",
              }}
              onClick={() => openConcept({ ...c, category: selectedCategory })}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode
                  ? "#1e1b4b"
                  : "#f5f3ff";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkMode
                  ? "#161622"
                  : "#ffffff";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  {c.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(c.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: "0",
                  }}
                >
                  {bookmarks.includes(c.id) ? "⭐" : "☆"}
                </button>
              </div>
              <p
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.8rem",
                  color: darkMode ? "#64748b" : "#94a3b8",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {c.definition}
              </p>
              <div
                style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}
              >
                {c.tags?.map((t) => (
                  <span key={t} style={styles.tag}>
                    {t}
                  </span>
                ))}
                {progress[c.id] && (
                  <span
                    style={{
                      ...styles.tag,
                      background: darkMode ? "#14532d" : "#dcfce7",
                      color: darkMode ? "#bbf7d0" : "#15803d",
                    }}
                  >
                    ✓ read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ConceptView = () => {
    if (!selectedConcept) return null;
    const c = selectedConcept;
    return (
      <div style={styles.content}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setView(selectedCategory ? "category" : "home")}
            style={{ ...styles.btn("ghost"), padding: "0.35rem 0.75rem" }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800 }}>
            {c.title}
          </h2>
          <button
            onClick={() => toggleBookmark(c.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            {bookmarks.includes(c.id) ? "⭐" : "☆"}
          </button>
          <span
            style={{
              ...styles.tag,
              background: darkMode ? "#1e3a8a" : "#dbeafe",
              color: darkMode ? "#93c5fd" : "#1d4ed8",
            }}
          >
            {c.category}
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          <StickyCard type="definition" content={c.definition} />
          <StickyCard type="syntax" content={c.syntax} />
          <StickyCard type="parts" content={c.parts} />
          <StickyCard type="example" content={c.example} />
          <StickyCard type="howItWorks" content={c.howItWorks} />
          <StickyCard type="keyTakeaway" content={c.keyTakeaway} />
        </div>
      </div>
    );
  };

  const SearchView = () => (
    <div style={styles.content}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem" }}>
        🔍 Search
      </h2>
      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <span
          style={{
            position: "absolute",
            left: "0.85rem",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1rem",
          }}
        >
          🔍
        </span>
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search concepts, topics, tags..."
          style={styles.searchInput}
          autoFocus
        />
      </div>
      {searchQuery && (
        <div
          style={{
            marginBottom: "0.75rem",
            fontSize: "0.85rem",
            color: darkMode ? "#64748b" : "#94a3b8",
          }}
        >
          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}{" "}
          for "{searchQuery}"
        </div>
      )}
      {!searchQuery && (
        <div>
          <p
            style={{
              color: darkMode ? "#64748b" : "#94a3b8",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
            }}
          >
            Popular searches:
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              "Closure",
              "useState",
              "Event Loop",
              "JWT",
              "Aggregation",
              "Flexbox",
              "Generics",
              "Promise",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setSearchQuery(s)}
                style={{
                  ...styles.tag,
                  cursor: "pointer",
                  padding: "6px 12px",
                  border: "none",
                  fontSize: "0.82rem",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "0.75rem",
          marginTop: "1rem",
        }}
      >
        {searchResults.map((c) => (
          <div
            key={c.id}
            style={styles.conceptCard}
            onClick={() => openConcept(c)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = darkMode
                ? "#1e1b4b"
                : "#f5f3ff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = darkMode
                ? "#161622"
                : "#ffffff")
            }
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                marginBottom: "0.25rem",
              }}
            >
              {c.title}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: darkMode ? "#64748b" : "#94a3b8",
                marginBottom: "0.4rem",
              }}
            >
              {c.category}
            </div>
            <p
              style={{
                margin: "0 0 0.5rem",
                fontSize: "0.8rem",
                color: darkMode ? "#94a3b8" : "#475569",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {c.definition}
            </p>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {c.tags?.map((t) => (
                <span key={t} style={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const QuizView = () => {
    const q = QUIZ_QUESTIONS[quizState.qIndex];
    if (quizState.done) {
      return (
        <div
          style={{ ...styles.content, textAlign: "center", maxWidth: "500px" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
            {quizState.score >= 7 ? "🎉" : quizState.score >= 5 ? "👍" : "📚"}
          </div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
            }}
          >
            Quiz Complete!
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: darkMode ? "#94a3b8" : "#64748b",
              marginBottom: "1.5rem",
            }}
          >
            You scored{" "}
            <strong style={{ color: "#a78bfa" }}>
              {quizState.score}/{QUIZ_QUESTIONS.length}
            </strong>
          </p>
          <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
            {QUIZ_QUESTIONS.map((q, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                }}
              >
                <span>{quizState.answers[i] === q.answer ? "✅" : "❌"}</span>
                <span style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  {q.q}
                </span>
              </div>
            ))}
          </div>
          <button
            style={styles.btn("primary")}
            onClick={() =>
              setQuizState({
                qIndex: 0,
                selected: null,
                score: 0,
                done: false,
                answers: [],
              })
            }
          >
            Retake Quiz
          </button>
        </div>
      );
    }
    return (
      <div style={{ ...styles.content, maxWidth: "600px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
            🧠 Quiz Mode
          </h2>
          <span style={{ ...styles.tag }}>
            {quizState.qIndex + 1} / {QUIZ_QUESTIONS.length}
          </span>
        </div>
        <div
          style={{
            background: darkMode ? "#161622" : "#fff",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              lineHeight: 1.5,
              marginBottom: "1.5rem",
            }}
          >
            {q.q}
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {q.options.map((opt, i) => {
              const isSelected = quizState.selected === i;
              const isCorrect = i === q.answer;
              const showResult = quizState.selected !== null;
              let bg = darkMode ? "#0f172a" : "#f8fafc";
              let border = darkMode ? "#1e293b" : "#e2e8f0";
              if (showResult && isCorrect) {
                bg = darkMode ? "#14532d" : "#dcfce7";
                border = "#22c55e";
              } else if (showResult && isSelected && !isCorrect) {
                bg = darkMode ? "#7f1d1d" : "#fee2e2";
                border = "#ef4444";
              } else if (isSelected) {
                bg = darkMode ? "#1e1b4b" : "#ede9fe";
                border = "#7c3aed";
              }
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (quizState.selected !== null) return;
                    const correct = i === q.answer;
                    setQuizState((s) => ({
                      ...s,
                      selected: i,
                      score: correct ? s.score + 1 : s.score,
                    }));
                  }}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: `2px solid ${border}`,
                    background: bg,
                    color: darkMode ? "#e2e8f0" : "#1e293b",
                    textAlign: "left",
                    cursor: quizState.selected !== null ? "default" : "pointer",
                    fontWeight:
                      isSelected || (showResult && isCorrect) ? 600 : 400,
                    transition: "all 0.2s",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", opacity: 0.6 }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                  {showResult && isCorrect && " ✓"}
                </button>
              );
            })}
          </div>
        </div>
        {quizState.selected !== null && (
          <div style={{ textAlign: "center" }}>
            <button
              style={styles.btn("primary")}
              onClick={() => {
                const nextIndex = quizState.qIndex + 1;
                if (nextIndex >= QUIZ_QUESTIONS.length) {
                  setQuizState((s) => ({ ...s, done: true }));
                } else {
                  setQuizState((s) => ({
                    ...s,
                    qIndex: nextIndex,
                    selected: null,
                    answers: [...s.answers, s.selected],
                  }));
                }
              }}
            >
              {quizState.qIndex + 1 >= QUIZ_QUESTIONS.length
                ? "See Results"
                : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const FlashcardView = () => {
    const cards = flashcardConcepts;
    const card = cards[flashcardIndex];
    if (!card)
      return (
        <div style={styles.content}>
          <p>No cards available.</p>
        </div>
      );
    return (
      <div style={{ ...styles.content, maxWidth: "600px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
            🃏 Flashcards
          </h2>
          <span style={styles.tag}>
            {flashcardIndex + 1} / {cards.length}
          </span>
        </div>
        <div
          onClick={() => setFlashcardFlipped(!flashcardFlipped)}
          style={{
            cursor: "pointer",
            perspective: "1000px",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              minHeight: "240px",
              background: darkMode ? "#161622" : "#fff",
              border: `2px solid ${flashcardFlipped ? "#22c55e" : "#7c3aed"}`,
              borderRadius: "20px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              transition: "all 0.3s",
            }}
          >
            {!flashcardFlipped ? (
              <>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#7c3aed",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                  }}
                >
                  QUESTION
                </div>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  What is {card.title}?
                </div>
                <div
                  style={{
                    marginTop: "1.5rem",
                    fontSize: "0.8rem",
                    color: darkMode ? "#64748b" : "#94a3b8",
                  }}
                >
                  Tap to reveal answer
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#22c55e",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                  }}
                >
                  ANSWER
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    color: darkMode ? "#e2e8f0" : "#1e293b",
                  }}
                >
                  {card.definition}
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    background: darkMode ? "#14532d" : "#dcfce7",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    color: darkMode ? "#bbf7d0" : "#15803d",
                    fontWeight: 600,
                  }}
                >
                  💡 {card.keyTakeaway}
                </div>
              </>
            )}
          </div>
        </div>
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}
        >
          <button
            style={styles.btn("ghost")}
            onClick={() => {
              setFlashcardIndex((i) => Math.max(0, i - 1));
              setFlashcardFlipped(false);
            }}
            disabled={flashcardIndex === 0}
          >
            ← Prev
          </button>
          <button
            style={styles.btn("ghost")}
            onClick={() => setFlashcardFlipped(!flashcardFlipped)}
          >
            Flip
          </button>
          <button
            style={styles.btn("primary")}
            onClick={() => {
              setFlashcardIndex((i) => (i + 1) % cards.length);
              setFlashcardFlipped(false);
            }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  const InterviewView = () => {
    const concepts = ALL_CONCEPTS;
    const c = concepts[interviewIndex % concepts.length];
    return (
      <div style={{ ...styles.content, maxWidth: "600px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
            ⚡ Interview Mode
          </h2>
          <span
            style={{ ...styles.tag, background: "#7f1d1d", color: "#fca5a5" }}
          >
            30s per card
          </span>
        </div>
        <div
          style={{
            background: darkMode ? "#161622" : "#fff",
            border: "2px solid #f97316",
            borderRadius: "20px",
            padding: "1.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.75rem",
            }}
          >
            {c.category}
          </div>
          <h3
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "1rem",
            }}
          >
            {c.title}
          </h3>
          <div
            style={{
              ...styles.stickyNote("definition"),
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: sc.definition.text,
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}
            >
              📖 Definition
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: sc.definition.text,
                lineHeight: 1.5,
              }}
            >
              {c.definition}
            </p>
          </div>
          {c.syntax && (
            <div
              style={{
                ...styles.stickyNote("syntax"),
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: sc.syntax.text,
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}
              >
                {"{ }"} Syntax
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  color: sc.syntax.text,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {c.syntax}
              </pre>
            </div>
          )}
          <div style={{ ...styles.stickyNote("keyTakeaway") }}>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: sc.keyTakeaway.text,
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}
            >
              ✅ Key Takeaway
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.88rem",
                color: sc.keyTakeaway.text,
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              {c.keyTakeaway}
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            style={styles.btn("ghost")}
            onClick={() => setInterviewIndex((i) => Math.max(0, i - 1))}
          >
            ← Prev
          </button>
          <button style={styles.btn("primary")} onClick={() => openConcept(c)}>
            Full Details
          </button>
          <button
            style={styles.btn("ghost")}
            onClick={() => setInterviewIndex((i) => i + 1)}
          >
            Next →
          </button>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: darkMode ? "#475569" : "#94a3b8",
            marginTop: "1rem",
          }}
        >
          Card {(interviewIndex % concepts.length) + 1} of {concepts.length}
        </p>
      </div>
    );
  };

  const AIView = () => {
    const handleAsk = async () => {
      if (!aiQuestion.trim()) return;
      setAiLoading(true);
      setAiEval("");
      try {
        const prompt = `You are a senior software engineer conducting a technical interview. The candidate was asked: "${aiQuestion}". Their answer is: "${aiAnswer}". 

Evaluate their answer in this format:
Score: X/10
Strengths: (what they got right)
Missing: (key points they missed)
Better answer: (a concise 2-3 sentence model answer)

Be encouraging but honest. Keep it under 200 words.`;
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        setAiEval(data.content?.[0]?.text || "Could not evaluate.");
      } catch {
        setAiEval("Error connecting to AI. Please try again.");
      }
      setAiLoading(false);
    };

    return (
      <div style={{ ...styles.content, maxWidth: "700px" }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          🤖 AI Interviewer
        </h2>
        <p
          style={{
            color: darkMode ? "#64748b" : "#94a3b8",
            fontSize: "0.88rem",
            marginBottom: "1.5rem",
          }}
        >
          Practice your answers and get instant AI feedback.
        </p>
        <div
          style={{
            background: darkMode ? "#161622" : "#fff",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
              color: darkMode ? "#94a3b8" : "#64748b",
            }}
          >
            Interview Question
          </label>
          <input
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="e.g. Explain the JavaScript event loop"
            style={{ ...styles.searchInput, marginBottom: "0.75rem" }}
          />
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "0.75rem",
            }}
          >
            {[
              "Explain closures in JavaScript",
              "What is the Virtual DOM?",
              "How does JWT authentication work?",
              "Explain database indexing",
            ].map((q) => (
              <button
                key={q}
                onClick={() => setAiQuestion(q)}
                style={{
                  ...styles.tag,
                  cursor: "pointer",
                  border: "none",
                  fontSize: "0.75rem",
                }}
              >
                {q}
              </button>
            ))}
          </div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
              color: darkMode ? "#94a3b8" : "#64748b",
            }}
          >
            Your Answer
          </label>
          <textarea
            value={aiAnswer}
            onChange={(e) => setAiAnswer(e.target.value)}
            placeholder="Type your answer here..."
            style={{
              ...styles.searchInput,
              height: "120px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button
          style={{
            ...styles.btn("primary"),
            width: "100%",
            padding: "0.75rem",
          }}
          onClick={handleAsk}
          disabled={aiLoading || !aiQuestion || !aiAnswer}
        >
          {aiLoading ? "Evaluating..." : "🤖 Evaluate My Answer"}
        </button>
        {aiEval && (
          <div
            style={{
              marginTop: "1rem",
              background: darkMode ? "#161622" : "#fff",
              border: "2px solid #7c3aed",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#a78bfa",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              AI Feedback
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: "0.88rem",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                color: darkMode ? "#e2e8f0" : "#1e293b",
              }}
            >
              {aiEval}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderView = () => {
    switch (view) {
      case "home":
        return <HomeView />;
      case "category":
        return <CategoryView />;
      case "concept":
        return <ConceptView />;
      case "search":
        return <SearchView />;
      case "quiz":
        return <QuizView />;
      case "flashcard":
        return <FlashcardView />;
      case "interview":
        return <InterviewView />;
      case "ai":
        return <AIView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div onClick={() => setView("home")} style={styles.logo}>
          📚 Handbook
        </div>
        <div style={{ flex: 1 }} />
        <nav
          style={{
            display: "flex",
            gap: "0.25rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "home", label: "Home" },
            { key: "search", label: "Search" },
            { key: "quiz", label: "Quiz" },
            { key: "flashcard", label: "Cards" },
            { key: "interview", label: "Interview" },
            { key: "ai", label: "AI" },
          ].map(({ key, label }) => (
            <button
              key={key}
              style={styles.navBtn(view === key)}
              onClick={() => {
                if (key === "quiz")
                  setQuizState({
                    qIndex: 0,
                    selected: null,
                    score: 0,
                    done: false,
                    answers: [],
                  });
                if (key === "flashcard") {
                  setFlashcardIndex(0);
                  setFlashcardFlipped(false);
                }
                if (key === "interview") setInterviewIndex(0);
                setView(key);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.1rem",
            padding: "0.25rem",
          }}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>
      {renderView()}
    </div>
  );
}
