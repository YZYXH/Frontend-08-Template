function find(str, patter) {
  const index = str.indexOf(patter);
  if(index === -1) {
    return false;
  }
  return true;
}

function match(str, patter) {
  let index = 0;
  let hasMatch = false;
  for(let k of str) {
    if(k === patter[index]) {
      hasMatch = true;
      index ++;
      if(index === patter.length) {
        return true;
      }
    } else {
      index = 0;
      hasMatch = false;
    }
  }
  return false;
}
const ismatch = match('asbcd', 'ab')
console.log(ismatch,'ismatch')
function findAB(str) {
let findA = false;
for(let k of str) {
if(k === 'a') {
  findA = true;
} else if(findA && k === 'b') {
  return true;
} else {
  findA = false;
}
}
return false;
}

function match(str) {
let findA = false;
let findB = false;
let findC = false;
let findD = false;
for(let k of str) {
if(k === 'a') {
  findA = true;
} else if(findA && k === 'b') {
  findB = true;
} else if(findB && k === 'c') {
  findC = true;
} else if(findC && k === 'd') {
  findD = true;
} else if(findB && k === 'e') {
  return true;
} else {
  findA = false;
  findB = false;
  finC = false;
  findD = false;
}
}
return false;
}
console.log(match('bcde88', 'abcde'))