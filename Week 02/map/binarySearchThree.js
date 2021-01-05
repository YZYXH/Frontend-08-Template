class BinatySearchThree {
  constructor(start= [], end = []) {
    this.root = null;
    this.start = start;
    this.end = end;
    this.insert(this.start);
  }
  node(key) {
    const left = null;
    const right = null;
    const distance = this.compare(key);
    return {
      key,
      left,
      right,
      distance,
    }
  }
  compare(point, target = this.end) {
    if(point.length && target.length) {
      return (point[0] - target[0]) ** 2 + (point[1] - target[1]) ** 2;
    }
    return null;
  }
  insert(v) {
    const newNode = this.node(v);
    if(this.root === null) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }
  insertNode(node, key) {
    if(node) {
      if(key.distance < node.distance) {
        if(node.left === null) {
          node.left = key;
        } else {
          this.insertNode(node.left, key)
        }
      } else {
        if(node.right === null) {
          node.right = key;
        } else {
          this.insertNode(node.right, key)
        }
      }
    }
  }
  min() {
    return this.minNode(this.root)
  }
  minNode(node) {
    console.log(node.left,'999')
    if(node) {
      while(node && node.left) {
        node = node.left;
        console.log(node, 'node')
      }
      return node.key;
    }
    return null;
  }
  search(key, node = this.root) {
    if(node === null) {
      return false;
    }
    const keyDistance = this.compare(key);
    if(keyDistance < node.distance) {
      return this.search(key, node.left);
    } else if(keyDistance > node.distance) {
      return this.search(key, node.right);
    } else {
      return !!(key.toString() === node.key.toString())
    }
  }
  take() {
    return this.root;
  }
}

// const sto = new BinatySearchThree([3,4], [9,16]);
// sto.insert([2,3]);
// sto.insert([9,11]);
// sto.insert([9,15]);

// console.log(sto.min(),sto.search([1,9]));
