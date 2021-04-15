export function replacer(key, value) {
  if (value instanceof Map) {
    return {
      type: "Map",
      value: Array.from(value.entries()),
    };
  }
  if (value instanceof Set) {
    return {
      type: "Set",
      value: Array.from(value),
    };
  }
  return value;
}

export function releiver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.type === "Map") {
      return new Map(value.value);
    }
    if (value.type === "Set") {
      return new Set(value.value);
    }
  }
  return value;
}

export function intersection(...args) {
  function inter(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
      if (setA.has(elem)) {
        _intersection.add(elem);
      }
    }
    return _intersection;
  }
  return args.reduce((acc, el) => {
    if (acc.size == 0) return acc;
    return inter(acc, el);
  }, args[0]);
}

export function now() {
  return Math.floor(Date.now() / 1000);
}
