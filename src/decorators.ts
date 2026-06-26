//decorator : wraps around a function and adds behaviour but doesnt change the og function

//target is the class in which the method belongs
//key is the method name
//descriptor.value is the actual function only
export function Log(
  target: object,
  key: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]): unknown { //replacing og function
    console.log(`[LOG] ${key} called with:`, args);
    const result = original.apply(this, args); //apply is used because this refers to lib instance
    console.log(`[LOG] ${key} returned:`, result);
    return result;
  };
  return descriptor;
}

export function Validate(
  target: object,
  key: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]): unknown {
    if (args.some((arg) => arg === null || arg === undefined || arg === "")) 
      console.warn(`[VALIDATE] ${key} received empty or null argument`);
    
    return original.apply(this, args);
  };
  return descriptor;
}
