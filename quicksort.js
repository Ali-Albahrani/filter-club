/**
 * Quicksort implementation in JavaScript
 * @param {Array} arr - Array to be sorted
 * @param {Function} compareFn - Optional comparison function
 * @returns {Array} - New sorted array
 */
function quicksort(arr, compareFn) {
  // Default comparison function for numbers
  const defaultCompare = (a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };

  const compare = compareFn || defaultCompare;

  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const right = [];
  const equal = [];

  for (let element of arr) {
    const comparison = compare(element, pivot);
    if (comparison < 0) {
      left.push(element);
    } else if (comparison > 0) {
      right.push(element);
    } else {
      equal.push(element);
    }
  }

  return [
    ...quicksort(left, compare),
    ...equal,
    ...quicksort(right, compare)
  ];
}

// Example usage:
// const numbers = [64, 34, 25, 12, 22, 11, 90];
// console.log(quicksort(numbers)); // [11, 12, 22, 25, 34, 64, 90]

// const strings = ['banana', 'apple', 'cherry', 'date'];
// console.log(quicksort(strings)); // ['apple', 'banana', 'cherry', 'date']

module.exports = { quicksort };