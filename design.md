# Write up

> this is a short write up about implementation/ thought process while working on
> ledis

## Thought Process

**Ledis** is a key-value store, so that should be similar to `Object/Map` in JavaScript.
I used Map as top level Ledis store and inside we have pairs of key-value which
key is a `string` and value is either another `string` or `Set`

- We can interact with store by provided method in `Map` like `delete`, `get`,
  `set`, `keys`

- To keep it simple, the value is always a single string.

### String

- String is simplest value we can store inside a key
- I store it as a `string` type in js
- `SET` override anything saved underthat key, so i don't need to perform some
  type check to override it or not
  - It's just the `set` method of `Map` : `store.set("k", "v")`
- `GET` get string value at key, **can't** get value out of set so we need to
  check if the value is a `SET` or not to return
  - `store.get("k")`;

### Set

- Is a unordered collection of **unique** `String` value, JS also have a Set
  object that also store unique value so i use that (because it removes
  duplicate for me)
- `SADD` can't add to existing string value stored at key, can add to existing
  set or empty key, so i need to check if the value store at key whether a
  string or set or empty.
  - if key is empty, simply create a set and add to store `store.set(k, new Set(v))`
  - if key is already a set, append value to it `store.set(k, new Set([...oldSet, ...v]))`
  - if value inside key is a string, throw `type error`
- `SREM` like `SADD`, can't interact with string value, empty key just ignore,
  remove value if set has it
- `SMEMBERS` like `GET` but can only interact with `Set` value.
- `SINTER`, find intersection of k Set, throw if `k` is `String`, return empty
  when intersec with empty key.
  - `setsArray.reduce(intersect, setsArray[0])`

### Data Expiration

- `KEYS` list all keys=> `store.keys()`
- `DEL` delete a key => `store.delete(k)`
- `EXPIRE` auto delete a key when the timeout is up. We can simply create a
  `setTimeout` and put a callback to delete a key later, BUT it have some problems:

  - what if user delete a key before timeout expired
  - and then user override that key
  - what if user set a new expire time for that key

  so i looked up how redis do the expire and find this
  [stackoverflow answer](https://stackoverflow.com/a/36173972) and decided to
  do `Expire` with lazy approach. Which mean i only delete keys when it got read
  by commands like `keys, get, smembers`, and in order to track the key is have
  been set expire time or not, i use another Map instead of messing up my original
  store. All the command that perform read have to add some behavior

  - `GET`, `SMEMBERS` if expire delete that key in store and expire and throw
    key not there
  - `SET` override key and delete existing expire time of that key
  - `SADD` if expire then similar behavior to empty key, also delete expire time
  - `SREM` delete expire time and moving on
  - `SINTER` if set is expire, return an empty set, also delete expire time
  - `KEYS` get all key then filter out the expired key, also delete expire time
  - `DEL`, also delete expire time

- `TTL`: i stored the expire time as now+expire by seconds so whenever i call
  `TTL` simply do a subtract `ttl - now` to get time left.

### Snapshot

Because this is a webapp so easiest way to persist data is to use `localStorage`

`localStorage` is also a key value store that can only store string, so i have
to serialized/stringify the store and expire. BUT `JSON.stringify` don't support
serialize `Map` and `Set`, so oops... After some googling for help, i came across
[a life saving stackoverflow post](https://stackoverflow.com/a/56150320) about
replacer/reliever arguments in `JSON.stringify`. With this new founded knowledge,
the snapshot problem became trivial

- `SAVE`: serialized store then save into localStorage
- `RESTORE`: get from localStorage and set into store

### Error Handling

simple throw and catch at command loop

# Web-cli and implementation

I choose react for this because its my most familiar with.

The entire core logic, commands stay at a single custom hook called
[useLedis](https://github.com/violeine/ledis/blob/main/src/useLedis.js)

The UI part of CLI stay at App.js

## Design

### Store and expire

This is ledis key-value store which is a `state hook` that hold a Map,

` const [store, setStore] = useState(new Map());`

We will mostly interact with this store through commands

Samething with expire

### REPL and history

This web-cli is basically a repl that interact with my ledis store through

command/operation.

It will have 2 function `evl` and `print`

- `evl` will take the input user put in and parse it into command and
  its arguments then evaluate it and feed into the `print` function

- `print` have a single job that is take the result of `evl` then push it in
  the `history` state which is another state hook
- `rep` function is the combine of these two fn then export
  - `rep = (str) => print(evl(str))`

### Evl and commands

- Evl receive input from user,trim and split it into Command and args
- It look up to the `commands object` which hold every command function of ledis,
  if the command is not there, `throw err` for `print`

### Commands object

have every commands that ledis have, to interact with `store state`
every function in this have some similar step is:

- check if arguments is enough, else throw
- check if key is expired then do its correct behavior as describe above
  - get something out
  - update the store or the expire
- return something to the `print` function

### Utilities function

Some utility function that need to interact with the store and expire will stay
inside this custom hook, else is inside the utils.js file

- `isSet` handle the repeated nested `if` of some SET operation like i describe
  in the `SADD` thought process
- `isExpire` to handle the repeated if expired then delete check as i decribe
  above
- `clear` clear the history
- `intersection` find intersection of n set
- `replacer/releiver` custom serialize for `Map` and `Set`
- `now` time as second

### The custom hook

will only need to export `rep` and `history state` for the cli, but i export store, exp also for debugging purposed

## Conclusion

The app have all the feature required but maybe its have some edge cases that
I didn't account for.

The `EXPIRE` and `Argument check` is still clunky

Some of the return value of command is not clear

Not handling string value that have whitespace in it
