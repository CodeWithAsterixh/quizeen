// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reverseArray(array:any[]) {
    const output = [];
    while (array.length) {
      output.push(array.pop());
    }
  
    return output;
  }